"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { DateRangeFilter } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { useApiList } from "@/hooks/use-api"
import { useOptions, toOptions } from "@/hooks/use-options"
import { formatDateTime, formatNumber } from "@/lib/status"
import { cn } from "@/lib/utils"
import type { Barang, Gudang, KartuStok } from "@/types"
import {
  BiPackage,
  BiTrendingUp,
  BiTrendingDown,
  BiBarChartAlt2,
  BiPrinter,
  BiCheckCircle,
  BiErrorCircle,
  BiTimeFive,
} from "react-icons/bi"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { TableSkeletonRows, KpiGridSkeleton } from "@/components/skeletons"

export interface StockCardDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  barang: (Barang & { total_stok?: number; stok?: number }) | null
  initialGudangId?: number | null
}

const TIPE_CONFIG: Record<
  string,
  {
    label: string
    color: "green" | "yellow" | "purple" | "blue" | "red" | "gray"
    getHref?: (id: number | string) => string
  }
> = {
  in: {
    label: "Barang Masuk",
    color: "green",
    getHref: (id) => `/inventory/barang-masuk/detail/${id}`,
  },
  out: {
    label: "Barang Keluar",
    color: "yellow",
    getHref: (id) => `/inventory/barang-keluar/${id}`,
  },
  mutasi_in: {
    label: "Mutasi Masuk",
    color: "purple",
    getHref: (id) => `/inventory/mutasi/detail/${id}`,
  },
  mutasi_out: {
    label: "Mutasi Keluar",
    color: "purple",
    getHref: (id) => `/inventory/mutasi/detail/${id}`,
  },
  opname: {
    label: "Stok Opname",
    color: "blue",
    getHref: (id) => `/inventory/opname/${id}`,
  },
}

function getTipeConfig(tipe: string) {
  const normalized = (tipe || "").toLowerCase()
  return (
    TIPE_CONFIG[normalized] ?? {
      label: tipe || "Transaksi",
      color: "gray" as const,
      getHref: () => "#",
    }
  )
}

function formatReferensi(row: KartuStok): string {
  const anyRow = row as unknown as Record<string, unknown>
  if (typeof anyRow.referensi_no === "string" && anyRow.referensi_no) return anyRow.referensi_no as string
  if (typeof anyRow.referensi === "string" && anyRow.referensi) return anyRow.referensi as string
  if (row.referensi_type && row.referensi_id) {
    const short = String(row.referensi_type).split("\\").pop() || String(row.referensi_type)
    return `${short}-${row.referensi_id}`
  }
  if (row.referensi_id) return `#${row.referensi_id}`
  return "-"
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toDateParam(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function StockCardDrawer({
  open,
  onOpenChange,
  barang,
  initialGudangId,
}: StockCardDrawerProps) {
  const router = useRouter()
  const [gudangFilter, setGudangFilter] = React.useState<string | null>(() =>
    initialGudangId ? String(initialGudangId) : "all"
  )
  const [fromDate, setFromDate] = React.useState(() =>
    toDateParam(addDays(new Date(), -30))
  )
  const [toDate, setToDate] = React.useState(() => toDateParam(new Date()))
  const [tipeFilter, setTipeFilter] = React.useState<string | null>("all")

  const { items: gudangList } = useOptions<Gudang>("gudang", "/gudang")
  const gudangOptions = [
    { value: "all", label: "Semua Gudang" },
    ...toOptions(gudangList),
  ]

  const gudangIdParam =
    gudangFilter && gudangFilter !== "all" ? Number(gudangFilter) : undefined
  const tipeParam = tipeFilter && tipeFilter !== "all" ? tipeFilter : undefined

  // Fetch riwayat mutasi kartu stok untuk barang terpilih
  const { data, isLoading } = useApiList<KartuStok>({
    key: `kartu-stok-barang-${barang?.id}-${gudangFilter}-${fromDate}-${toDate}-${tipeFilter}`,
    url: "/kartu-stok/riwayat",
    params: {
      barang_id: barang?.id,
      gudang_id: gudangIdParam,
      tipe: tipeParam,
      from: fromDate,
      to: toDate,
    },
    enabled: !!barang?.id && open,
  })

  const rawRows = React.useMemo(() => {
    if (!data?.data) return []
    return Array.isArray(data.data) ? data.data : []
  }, [data])

  // Sorting kronologis ascending (dari transaksi terdahulu ke terkini) untuk running balance akurat
  const sortedRows = React.useMemo(() => {
    return [...rawRows].sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime()
      const timeB = new Date(b.created_at || 0).getTime()
      return timeA - timeB
    })
  }, [rawRows])

  // Kalkulasi Saldo Awal, Total Masuk, Total Keluar, dan Saldo Akhir
  const { saldoAwal, totalMasuk, totalKeluar, saldoAkhir, netMutasi } =
    React.useMemo(() => {
      if (sortedRows.length === 0) {
        const currentStok = barang?.total_stok ?? barang?.stok ?? 0
        return {
          saldoAwal: currentStok,
          totalMasuk: 0,
          totalKeluar: 0,
          saldoAkhir: currentStok,
          netMutasi: 0,
        }
      }

      const firstRow = sortedRows[0]
      const lastRow = sortedRows[sortedRows.length - 1]

      const initialBalance = firstRow.saldo_sebelum ?? 0
      let masuk = 0
      let keluar = 0

      for (const row of sortedRows) {
        if (row.qty > 0) {
          masuk += row.qty
        } else if (row.qty < 0) {
          keluar += Math.abs(row.qty)
        }
      }

      const finalBalance =
        lastRow.saldo_sesudah ?? initialBalance + masuk - keluar

      return {
        saldoAwal: initialBalance,
        totalMasuk: masuk,
        totalKeluar: keluar,
        saldoAkhir: finalBalance,
        netMutasi: masuk - keluar,
      }
    }, [sortedRows, barang])

  const satuanNama = barang?.satuan?.singkatan || barang?.satuan?.nama || "Unit"
  const minStok = barang?.min_stok ?? 0
  const maxStok = barang?.max_stok ?? 0

  // Status kesehatan stok
  const getStockHealth = () => {
    if (saldoAkhir <= 0) {
      return {
        label: "Stok Habis",
        color: "red" as const,
        icon: BiErrorCircle,
      }
    }
    if (minStok > 0 && saldoAkhir <= minStok) {
      return {
        label: "Kritis (Di Bawah Min Stok)",
        color: "yellow" as const,
        icon: BiErrorCircle,
      }
    }
    return {
      label: "Stok Aman",
      color: "green" as const,
      icon: BiCheckCircle,
    }
  }

  const stockHealth = getStockHealth()

  const handlePrint = () => {
    window.print()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col border-l border-border bg-background p-0 text-foreground sm:max-w-4xl!"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border/60 bg-card px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-foreground shadow-2xs">
                <BiPackage className="size-6 text-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <SheetTitle className="font-heading text-xl font-bold tracking-tight text-foreground">
                    {barang?.nama || "Detail Kartu Stok"}
                  </SheetTitle>
                  <ColoredBadge color={stockHealth.color}>
                    {stockHealth.label}
                  </ColoredBadge>
                </div>
                <SheetDescription className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                  <span>
                    SKU:{" "}
                    <strong className="font-mono text-foreground">
                      {barang?.sku || "-"}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Kategori:{" "}
                    <strong className="text-foreground">
                      {barang?.kategori?.nama || "-"}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Satuan:{" "}
                    <strong className="text-foreground">{satuanNama}</strong>
                  </span>
                  {minStok > 0 && (
                    <>
                      <span>•</span>
                      <span>
                        Min / Max:{" "}
                        <strong className="text-foreground">
                          {minStok} / {maxStok || "-"}
                        </strong>
                      </span>
                    </>
                  )}
                </SheetDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={handlePrint}
              >
                <BiPrinter className="size-4" />
                Cetak
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onOpenChange(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto bg-muted/30 p-6">
          {/* KPI Summary Cards */}
          {isLoading ? (
            <KpiGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card className="border-border/70 bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Saldo Awal</span>
                  <BiTimeFive className="size-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-xl font-bold tracking-tight text-foreground">
                  {formatNumber(saldoAwal)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {satuanNama}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Posisi per {fromDate}
                </p>
              </Card>

              <Card className="border-border/70 bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <span>Total Masuk</span>
                  <BiTrendingDown className="size-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {`+${formatNumber(totalMasuk)}`}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {satuanNama}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Penerimaan / Mutasi In
                </p>
              </Card>

              <Card className="border-border/70 bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-medium text-rose-600 dark:text-rose-400">
                  <span>Total Keluar</span>
                  <BiTrendingUp className="size-4 text-rose-500" />
                </div>
                <div className="mt-2 text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                  {`-${formatNumber(totalKeluar)}`}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {satuanNama}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Pengiriman / Mutasi Out
                </p>
              </Card>

              <Card className="border-border/70 bg-card p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-medium text-foreground">
                  <span>Saldo Akhir</span>
                  <BiBarChartAlt2 className="size-4 text-blue-500" />
                </div>
                <div className="mt-2 text-xl font-bold tracking-tight text-foreground">
                  {formatNumber(saldoAkhir)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {satuanNama}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Posisi per {toDate}
                </p>
              </Card>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-border/60 bg-card p-3 shadow-2xs">
            <DateRangeFilter
              startDate={fromDate}
              endDate={toDate}
              onStartDateChange={(val) => setFromDate(val)}
              onEndDateChange={(val) => setToDate(val)}
              size="sm"
            />

            <Opsion
              placeholder="Semua Gudang"
              value={gudangFilter ?? ""}
              onValueChange={(val) => setGudangFilter(val || "all")}
              options={gudangOptions}
              className="h-9 text-xs"
            />

            <Opsion
              placeholder="Semua Tipe"
              value={tipeFilter ?? ""}
              onValueChange={(val) => setTipeFilter(val || "all")}
              options={[
                { value: "all", label: "Semua Tipe Transaksi" },
                { value: "in", label: "Barang Masuk" },
                { value: "out", label: "Barang Keluar" },
                { value: "mutasi_in", label: "Mutasi Masuk" },
                { value: "mutasi_out", label: "Mutasi Keluar" },
                { value: "opname", label: "Stok Opname" },
              ]}
              className="h-9 text-xs"
            />
          </div>

          {/* Ledger Table with Running Balance */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xs">
            <Table>
              <TableHeader className="border-b border-border/60 bg-muted/40">
                <TableRow className="h-11 hover:bg-transparent">
                  <TableHead className="w-[140px] pl-4 text-xs font-semibold text-foreground">
                    Waktu & Tanggal
                  </TableHead>
                  <TableHead className="w-[130px] text-xs font-semibold text-foreground">
                    Tipe Transaksi
                  </TableHead>
                  <TableHead className="w-[150px] text-xs font-semibold text-foreground">
                    No. Referensi
                  </TableHead>
                  <TableHead className="w-[140px] text-xs font-semibold text-foreground">
                    Lokasi Gudang
                  </TableHead>
                  <TableHead className="w-[90px] text-right text-xs font-semibold text-foreground">
                    Masuk (+)
                  </TableHead>
                  <TableHead className="w-[90px] text-right text-xs font-semibold text-foreground">
                    Keluar (-)
                  </TableHead>
                  <TableHead className="w-[110px] pr-4 text-right text-xs font-bold text-foreground">
                    Saldo Berjalan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Initial Opening Balance Row */}
                <TableRow className="h-10 border-b border-dashed border-border/60 bg-muted/20 text-xs font-medium">
                  <TableCell className="pl-4 font-mono text-muted-foreground">
                    {fromDate} 00:00
                  </TableCell>
                  <TableCell
                    colSpan={3}
                    className="font-medium text-muted-foreground italic"
                  >
                    Saldo Awal Periode
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    -
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    -
                  </TableCell>
                  <TableCell className="pr-4 text-right font-bold text-foreground">
                    {formatNumber(saldoAwal)} {satuanNama}
                  </TableCell>
                </TableRow>

                {isLoading && <TableSkeletonRows columns={7} rows={6} />}

                {!isLoading && sortedRows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-28 text-center text-xs text-muted-foreground"
                    >
                      Tidak ada pergerakan stok pada periode dan filter yang
                      dipilih.
                    </TableCell>
                  </TableRow>
                )}

                {sortedRows.map((row) => {
                  const tipeConfig = getTipeConfig(row.tipe)
                  const isIn = row.qty > 0
                  const isOut = row.qty < 0
                  const qtyAbs = Math.abs(row.qty)
                  const refLink = row.referensi_id
                    ? tipeConfig.getHref?.(row.referensi_id)
                    : undefined

                  return (
                    <TableRow
                      key={row.id}
                      className="h-12 border-b border-border/40 text-xs transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="pl-4 font-mono text-muted-foreground">
                        {formatDateTime(row.created_at)}
                      </TableCell>
                      <TableCell>
                        <ColoredBadge color={tipeConfig.color}>
                          {tipeConfig.label}
                        </ColoredBadge>
                      </TableCell>
                      <TableCell>
                        {refLink && refLink !== "#" ? (
                            <button
                              type="button"
                              onClick={() => router.push(refLink)}
                              className="cursor-pointer font-medium text-blue-600 hover:underline"
                            >
                              {formatReferensi(row)}
                            </button>
                          ) : (
                            <span className="text-muted-foreground">
                              {formatReferensi(row)}
                            </span>
                          )}
                        </TableCell>
                      <TableCell className="text-foreground">
                        {row.gudang?.nama ?? "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                        {isIn ? `+${formatNumber(qtyAbs)}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-rose-600 dark:text-rose-400">
                        {isOut ? `-${formatNumber(qtyAbs)}` : "-"}
                      </TableCell>
                      <TableCell className="bg-muted/10 pr-4 text-right font-bold text-foreground">
                        {formatNumber(row.saldo_sesudah)} {satuanNama}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 bg-card px-6 py-4">
          <div className="text-xs text-muted-foreground">
            Total Transaksi:{" "}
            <strong className="text-foreground">{sortedRows.length}</strong> |
            Net Perubahan:{" "}
            <strong
              className={cn(
                netMutasi > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : netMutasi < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-foreground"
              )}
            >
              {netMutasi > 0 ? `+${netMutasi}` : netMutasi} {satuanNama}
            </strong>
          </div>
          <Button
            variant="default"
            size="sm"
            className="h-9 px-4 text-xs font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Selesai
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}