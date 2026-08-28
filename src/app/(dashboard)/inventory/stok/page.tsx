"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ExportModal } from "@/components/export-modal"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useApiList } from "@/hooks/use-api"
import { useOptions, toOptions } from "@/hooks/use-options"
import { formatDateTime, formatNumber } from "@/lib/status"
import { StockCardDrawer } from "@/components/stock-card/stock-card-drawer"
import type { Barang, Gudang, Kategori, KartuStok } from "@/types"
import {
  BiPackage,
  BiSolidReport,
  BiTrendingDown,
  BiErrorCircle,
  BiCheckCircle,
  BiTimeFive,
  BiChevronRight,
  BiGridAlt,
  BiListUl,
} from "react-icons/bi"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { KpiGridSkeleton, TableSkeletonRows } from "@/components/skeletons"
import { cn } from "@/lib/utils"

const TIPE_CONFIG: Record<
  string,
  {
    label: string
    color: "green" | "yellow" | "purple" | "blue" | "gray"
    href: (id: number) => string
  }
> = {
  in: {
    label: "Barang Masuk",
    color: "green",
    href: (id) => `/inventory/barang-masuk/detail/${id}`,
  },
  out: {
    label: "Barang Keluar",
    color: "yellow",
    href: (id) => `/inventory/barang-keluar/${id}`,
  },
  mutasi_in: {
    label: "Mutasi Masuk",
    color: "purple",
    href: (id) => `/inventory/mutasi/detail/${id}`,
  },
  mutasi_out: {
    label: "Mutasi Keluar",
    color: "purple",
    href: (id) => `/inventory/mutasi/detail/${id}`,
  },
  opname: {
    label: "Stok Opname",
    color: "blue",
    href: (id) => `/inventory/opname/${id}`,
  },
}

function getTipeConfig(tipe: string) {
  return (
    TIPE_CONFIG[tipe] ?? {
      label: tipe,
      color: "gray" as const,
      href: () => `/inventory/stok`,
    }
  )
}

export default function StokPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("ringkasan")
  const [exportOpen, setExportOpen] = useState(false)

  // Selected item for Stock Card Drawer
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Filters for Tab 1 (Ringkasan Barang)
  const [searchBarang, setSearchBarang] = useState("")
  const deferredSearchBarang = useDeferredValue(searchBarang)
  const [kategoriFilter, setKategoriFilter] = useState<string | null>("all")
  const [statusStokFilter, setStatusStokFilter] = useState<string | null>("all")
  const [pageBarang, setPageBarang] = useState(1)

  // Filters for Tab 2 (Log Mutasi Global)
  const [searchLog, setSearchLog] = useState("")
  const deferredSearchLog = useDeferredValue(searchLog)
  const [gudangLog, setGudangLog] = useState<string | null>(null)
  const [tipeLog, setTipeLog] = useState<string | null>(null)
  const [pageLog, setPageLog] = useState(1)

  // Options
  const { items: gudangList } = useOptions<Gudang>("gudang", "/gudang")
  const gudangOptions = [
    { value: "all", label: "Semua Gudang" },
    ...toOptions(gudangList),
  ]

  const { items: kategoriList } = useOptions<Kategori>("kategori", "/kategori")
  const kategoriOptions = [
    { value: "all", label: "Semua Kategori" },
    ...toOptions(kategoriList),
  ]

  // Fetch data Barang untuk Tab 1
  const { data: barangData, isLoading: isLoadingBarang } = useApiList<
    Barang & { total_stok?: number; stok?: number }
  >({
    key: `barang-stok-overview-${pageBarang}-${deferredSearchBarang}-${kategoriFilter}`,
    url: "/barang",
    params: {
      page: pageBarang,
      per_page: 15,
      search: deferredSearchBarang || undefined,
      kategori_id:
        kategoriFilter && kategoriFilter !== "all"
          ? Number(kategoriFilter)
          : undefined,
    },
  })

  // Fetch data Kartu Stok Log untuk Tab 2
  const { data: logData, isLoading: isLoadingLog } = useApiList<KartuStok>({
    key: `kartu-stok-global-${pageLog}-${deferredSearchLog}-${gudangLog}-${tipeLog}`,
    url: "/kartu-stok",
    params: {
      page: pageLog,
      per_page: 15,
      search: deferredSearchLog || undefined,
      gudang_id:
        gudangLog && gudangLog !== "all" ? Number(gudangLog) : undefined,
      tipe: tipeLog && tipeLog !== "all" ? tipeLog : undefined,
    },
  })

  const rawBarangs = useMemo(() => barangData?.data ?? [], [barangData?.data])
  const metaBarang = barangData?.meta
  const totalPagesBarang = Math.max(1, metaBarang?.last_page ?? 1)

  // Filter status stok lokal jika ada
  const filteredBarangs = useMemo(() => {
    if (!statusStokFilter || statusStokFilter === "all") return rawBarangs
    return rawBarangs.filter((b) => {
      const stok = b.total_stok ?? b.stok ?? 0
      const min = b.min_stok ?? 0
      if (statusStokFilter === "habis") return stok <= 0
      if (statusStokFilter === "kritis")
        return min > 0 && stok <= min && stok > 0
      if (statusStokFilter === "aman") return stok > min
      return true
    })
  }, [rawBarangs, statusStokFilter])

  const logRows = useMemo(() => logData?.data ?? [], [logData?.data])
  const metaLog = logData?.meta
  const totalPagesLog = Math.max(1, metaLog?.last_page ?? 1)

  // KPI Calculations
  const totalSkuCount = metaBarang?.total ?? rawBarangs.length
  const totalStokFisik = useMemo(() => {
    return rawBarangs.reduce((acc, b) => acc + (b.total_stok ?? b.stok ?? 0), 0)
  }, [rawBarangs])

  const lowStockCount = useMemo(() => {
    return rawBarangs.filter((b) => {
      const stok = b.total_stok ?? b.stok ?? 0
      const min = b.min_stok ?? 0
      return min > 0 && stok <= min
    }).length
  }, [rawBarangs])

  const totalLogCount = metaLog?.total ?? logRows.length

  const handleOpenStockCard = (barang: Barang) => {
    setSelectedBarang(barang)
    setDrawerOpen(true)
  }

  return (
    <>
      {/* Header */}
      <div className="wrapper">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeader
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Aktivitas Gudang" },
              { label: "Kartu Stok & Riwayat" },
            ]}
            title="Kartu Stok & Buku Besar Persediaan"
            icon={BiPackage}
            description="Pantau posisi persediaan barang, riwayat mutasi per SKU, dan running balance secara akurat."
          />
          <div className="flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export Laporan
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="wrapper mt-6">
        {isLoadingBarang || isLoadingLog ? (
          <KpiGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="min-h-[105px] w-full border-border/70 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Total SKU Aktif
                  </span>
                  <BiPackage className="size-5 text-foreground" />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {formatNumber(totalSkuCount)}
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Barang terdaftar di sistem
                  </p>
                </div>
              </div>
            </Card>

            <Card className="min-h-[105px] w-full border-border/70 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                    Total Unit Fisik
                  </span>
                  <BiTrendingDown className="size-5 text-emerald-500" />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                    {formatNumber(totalStokFisik)}
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Akumulasi saldo fisik terkini
                  </p>
                </div>
              </div>
            </Card>

            <Card className="min-h-[105px] w-full border-border/70 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
                    Perlu Restock
                  </span>
                  <BiErrorCircle className="size-5 text-amber-500" />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                    {formatNumber(lowStockCount)}
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    SKU berada di bawah batas minimum
                  </p>
                </div>
              </div>
            </Card>

            <Card className="min-h-[105px] w-full border-border/70 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
                    Log Transaksi
                  </span>
                  <BiTimeFive className="size-5 text-blue-500" />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-blue-600">
                    {formatNumber(totalLogCount)}
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Riwayat mutasi & running balance
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="wrapper mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="bg-muted/70 p-1">
              <TabsTrigger
                value="ringkasan"
                className="gap-2 px-4 py-1.5 text-xs font-medium"
              >
                <BiGridAlt className="size-4" />
                Posisi Stok per Barang (SKU)
              </TabsTrigger>
              <TabsTrigger
                value="log"
                className="gap-2 px-4 py-1.5 text-xs font-medium"
              >
                <BiListUl className="size-4" />
                Semua Log Mutasi & Aktivitas
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: POSISI STOK PER BARANG */}
          <TabsContent value="ringkasan" className="mt-6 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <InputSearch
                placeholder="Cari SKU, barcode, atau nama barang..."
                className="min-w-[240px] flex-1"
                value={searchBarang}
                onChange={(e) => {
                  setSearchBarang(e.target.value)
                  setPageBarang(1)
                }}
              />
              <Opsion
                placeholder="Semua Kategori"
                value={kategoriFilter ?? ""}
                onValueChange={(val) => {
                  setKategoriFilter(val || "all")
                  setPageBarang(1)
                }}
                options={kategoriOptions}
                className="w-[180px]"
              />
              <Opsion
                placeholder="Semua Status Stok"
                value={statusStokFilter ?? ""}
                onValueChange={(val) => {
                  setStatusStokFilter(val || "all")
                  setPageBarang(1)
                }}
                options={[
                  { value: "all", label: "Semua Status Stok" },
                  { value: "aman", label: "Stok Aman" },
                  { value: "kritis", label: "Kritis (Bawah Min)" },
                  { value: "habis", label: "Stok Habis (0)" },
                ]}
                className="w-[180px]"
              />
            </div>

            {/* Table Posisi Stok */}
            <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
              <Table>
                <TableHeader className="border-b border-border/60 bg-card">
                  <TableRow className="h-14 hover:bg-transparent">
                    <TableHead className="w-[120px] pl-6 text-xs font-semibold text-foreground">
                      Kode SKU
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">
                      Nama Barang & Detail
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">
                      Kategori
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-foreground">
                      Batas Min / Max
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-foreground">
                      Stok Aktual
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-foreground">
                      Status Stok
                    </TableHead>
                    <TableHead className="w-[150px] pr-6 text-right text-xs font-semibold text-foreground">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="min-h-[300px]">
                  {isLoadingBarang && <TableSkeletonRows columns={7} rows={15} />}
                  {!isLoadingBarang && filteredBarangs.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-48 text-center text-sm text-muted-foreground"
                      >
                        Tidak ada data barang yang sesuai filter.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredBarangs.map((row) => {
                    const stok = row.total_stok ?? row.stok ?? 0
                    const min = row.min_stok ?? 0
                    const max = row.max_stok ?? 0
                    const satuan =
                      row.satuan?.singkatan || row.satuan?.nama || "Unit"

                    let statusBadge = (
                      <ColoredBadge color="green">
                        <BiCheckCircle className="mr-1 inline-block size-3.5" />
                        Aman
                      </ColoredBadge>
                    )
                    if (stok <= 0) {
                      statusBadge = (
                        <ColoredBadge color="red">
                          <BiErrorCircle className="mr-1 inline-block size-3.5" />
                          Habis
                        </ColoredBadge>
                      )
                    } else if (min > 0 && stok <= min) {
                      statusBadge = (
                        <ColoredBadge color="yellow">
                          <BiErrorCircle className="mr-1 inline-block size-3.5" />
                          Kritis
                        </ColoredBadge>
                      )
                    }

                    return (
                      <TableRow
                        key={row.id}
                        className="h-16 cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30"
                        onClick={() => handleOpenStockCard(row)}
                      >
                        <TableCell className="pl-6 font-mono text-sm font-semibold text-foreground">
                          {row.sku}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          <div className="font-semibold">{row.nama}</div>
                          {row.barcode && (
                            <div className="font-mono text-[11px] text-muted-foreground">
                              Barcode: {row.barcode}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.kategori?.nama || "-"}
                        </TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {min > 0 ? (
                            <span>
                              {min} / {max || "∞"} {satuan}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm font-bold text-foreground">
                          <span
                            className={cn(
                              stok <= 0
                                ? "text-rose-600 dark:text-rose-400"
                                : min > 0 && stok <= min
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                            )}
                          >
                            {formatNumber(stok)}
                          </span>{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            {satuan}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {statusBadge}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-xs font-medium"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenStockCard(row)
                            }}
                          >
                            <BiTimeFive className="size-3.5" />
                            Kartu Stok
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter className="border-t border-border/50 bg-card">
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className="p-0 align-middle">
                      <div className="flex h-14 items-center justify-between bg-card px-6 font-sans text-xs text-muted-foreground">
                        <span>
                          Menampilkan{" "}
                          {metaBarang?.total
                            ? (pageBarang - 1) * (metaBarang.per_page || 15) + 1
                            : 0}
                          -
                          {Math.min(
                            pageBarang * (metaBarang?.per_page || 15),
                            metaBarang?.total ?? 0
                          )}{" "}
                          dari {metaBarang?.total ?? 0} barang
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            className={cn(
                              "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border border-border/70 text-muted-foreground transition-colors hover:bg-muted",
                              pageBarang === 1 &&
                                "pointer-events-none opacity-40"
                            )}
                            onClick={() =>
                              setPageBarang((p) => Math.max(1, p - 1))
                            }
                          >
                            &lt;
                          </button>
                          {Array.from(
                            { length: totalPagesBarang },
                            (_, i) => i + 1
                          ).map((p) => (
                            <button
                              key={p}
                              onClick={() => setPageBarang(p)}
                              className={cn(
                                "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] font-medium transition-colors hover:bg-muted",
                                pageBarang === p
                                  ? "bg-foreground text-background"
                                  : "border border-border/70 text-muted-foreground"
                              )}
                            >
                              {p}
                            </button>
                          ))}
                          <button
                            className={cn(
                              "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border border-border/70 text-muted-foreground transition-colors hover:bg-muted",
                              pageBarang === totalPagesBarang &&
                                "pointer-events-none opacity-40"
                            )}
                            onClick={() =>
                              setPageBarang((p) =>
                                Math.min(totalPagesBarang, p + 1)
                              )
                            }
                          >
                            &gt;
                          </button>
                        </div>
                        <span>{metaBarang?.per_page ?? 15} per halaman</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </TabsContent>

          {/* TAB 2: SEMUA LOG MUTASI GLOBAL */}
          <TabsContent value="log" className="mt-6 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <InputSearch
                placeholder="Cari barang, no referensi transaksi..."
                className="min-w-[240px] flex-1"
                value={searchLog}
                onChange={(e) => {
                  setSearchLog(e.target.value)
                  setPageLog(1)
                }}
              />
              <Opsion
                placeholder="Semua Gudang"
                value={gudangLog || ""}
                onValueChange={(val) => {
                  setGudangLog(val)
                  setPageLog(1)
                }}
                options={gudangOptions}
                className="w-[180px]"
              />
              <Opsion
                placeholder="Semua Tipe"
                value={tipeLog || ""}
                onValueChange={(val) => {
                  setTipeLog(val)
                  setPageLog(1)
                }}
                options={[
                  { value: "all", label: "Semua Tipe" },
                  { value: "in", label: "Barang Masuk" },
                  { value: "out", label: "Barang Keluar" },
                  { value: "mutasi_in", label: "Mutasi Masuk" },
                  { value: "mutasi_out", label: "Mutasi Keluar" },
                  { value: "opname", label: "Stok Opname" },
                ]}
                className="w-[180px]"
              />
            </div>

            {/* Table Log Mutasi */}
            <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
              <Table>
                <TableHeader className="border-b border-border/60 bg-card">
                  <TableRow className="h-14 hover:bg-transparent">
                    <TableHead className="pl-6 text-xs font-semibold text-foreground">
                      Tanggal & Waktu
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">
                      Tipe Transaksi
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">
                      Barang (SKU)
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">
                      No. Referensi
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">
                      Lokasi Gudang
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-foreground">
                      Pergerakan Qty
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-foreground">
                      Saldo Berjalan
                    </TableHead>
                    <TableHead className="w-[110px] pr-6 text-right text-xs font-semibold text-foreground">
                      Detail
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="min-h-[300px]">
                  {isLoadingLog && <TableSkeletonRows columns={8} rows={15} />}
                  {!isLoadingLog && logRows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-48 text-center text-sm text-muted-foreground"
                      >
                        Tidak ada log pergerakan kartu stok.
                      </TableCell>
                    </TableRow>
                  )}
                  {logRows.map((row) => {
                    const tipeConfig = getTipeConfig(row.tipe)
                    return (
                      <TableRow
                        key={row.id}
                        className="h-16 border-b border-border/40 transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="pl-6 font-mono text-xs text-foreground">
                          {formatDateTime(row.created_at)}
                        </TableCell>
                        <TableCell>
                          <ColoredBadge color={tipeConfig.color}>
                            {tipeConfig.label}
                          </ColoredBadge>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-foreground">
                          {row.barang?.nama ?? `Barang #${row.barang_id}`}
                          {row.barang?.sku && (
                            <span className="block font-mono text-xs text-muted-foreground">
                              {row.barang.sku}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-sans text-sm font-medium text-blue-600">
                          {row.referensi_id ? (
                            <button
                              type="button"
                              onClick={() =>
                                router.push(tipeConfig.href(row.referensi_id!))
                              }
                              className="cursor-pointer hover:underline"
                            >
                              {row.referensi_type
                                ? `${row.referensi_type}-${row.referensi_id}`
                                : `#${row.referensi_id}`}
                            </button>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {row.gudang?.nama ?? "-"}
                        </TableCell>
                        <TableCell className="text-center text-sm font-semibold">
                          {row.qty > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400">{`+${formatNumber(row.qty)}`}</span>
                          ) : row.qty < 0 ? (
                            <span className="text-rose-600 dark:text-rose-400">
                              {formatNumber(row.qty)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {formatNumber(row.qty)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="bg-muted/10 text-center text-sm font-bold text-foreground">
                          {`${formatNumber(row.saldo_sesudah)} ${row.barang?.satuan?.nama ?? ""}`.trim()}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          {row.barang && (
                            <button
                              type="button"
                              onClick={() => handleOpenStockCard(row.barang!)}
                              className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              title="Buka Kartu Stok SKU ini"
                            >
                              <BiChevronRight className="size-5" />
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter className="border-t border-border/50 bg-card">
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={8} className="p-0 align-middle">
                      <div className="flex h-14 items-center justify-between bg-card px-6 font-sans text-xs text-muted-foreground">
                        <span>
                          Menampilkan{" "}
                          {metaLog?.total
                            ? (pageLog - 1) * (metaLog.per_page || 15) + 1
                            : 0}
                          -
                          {Math.min(
                            pageLog * (metaLog?.per_page || 15),
                            metaLog?.total ?? 0
                          )}{" "}
                          dari {metaLog?.total ?? 0} data
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            className={cn(
                              "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border border-border/70 text-muted-foreground transition-colors hover:bg-muted",
                              pageLog === 1 && "pointer-events-none opacity-40"
                            )}
                            onClick={() =>
                              setPageLog((p) => Math.max(1, p - 1))
                            }
                          >
                            &lt;
                          </button>
                          {Array.from(
                            { length: totalPagesLog },
                            (_, i) => i + 1
                          ).map((p) => (
                            <button
                              key={p}
                              onClick={() => setPageLog(p)}
                              className={cn(
                                "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] font-medium transition-colors hover:bg-muted",
                                pageLog === p
                                  ? "bg-foreground text-background"
                                  : "border border-border/70 text-muted-foreground"
                              )}
                            >
                              {p}
                            </button>
                          ))}
                          <button
                            className={cn(
                              "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border border-border/70 text-muted-foreground transition-colors hover:bg-muted",
                              pageLog === totalPagesLog &&
                                "pointer-events-none opacity-40"
                            )}
                            onClick={() =>
                              setPageLog((p) => Math.min(totalPagesLog, p + 1))
                            }
                          >
                            &gt;
                          </button>
                        </div>
                        <span>{metaLog?.per_page ?? 15} per halaman</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Interactive Stock Card Drawer */}
      <StockCardDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        barang={selectedBarang}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Buku Besar Kartu Stok"
        totalItemsCount={totalSkuCount}
        totalItemsLabel="Total Item SKU"
        filterLabel="Filter Terpilih"
        exportUrl="/kartu-stok?format=excel"
        checkboxes={[
          { id: "sku", label: "Kode SKU & Barcode", defaultChecked: true },
          { id: "nama", label: "Nama Barang & Satuan", defaultChecked: true },
          { id: "kategori", label: "Kategori Barang", defaultChecked: true },
          {
            id: "stok",
            label: "Posisi Saldo & Batas Min/Max",
            defaultChecked: true,
          },
          {
            id: "mutasi",
            label: "Rincian Transaksi Masuk/Keluar",
            defaultChecked: true,
          },
        ]}
      />
    </>
  )
}