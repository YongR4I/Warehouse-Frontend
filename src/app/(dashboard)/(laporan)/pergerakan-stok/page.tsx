"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { ExportModal } from "@/components/export-modal"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch, DateRangeFilter } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { Card } from "@/components/ui/card"
import { useApiList } from "@/hooks/use-api"
import { useOptions, toOptions } from "@/hooks/use-options"
import { formatDate, formatNumber } from "@/lib/status"
import type { Gudang, LaporanRow } from "@/types"
import {
  BiSolidReport,
  BiBarChartAlt2,
  BiChevronRight,
  BiChevronLeft,
  BiTrendingDown,
  BiTrendingUp,
  BiTransfer,
  BiPackage,
} from "react-icons/bi"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

interface MutasiStokRow {
  id?: number
  no_referensi?: string
  tanggal?: string
  tipe?: string
  sku?: string
  nama_barang?: string
  lokasi_asal?: string
  lokasi_tujuan?: string
  qty?: number
  satuan?: string
  petugas?: string
  barang?: {
    sku?: string
    nama?: string
    satuan?: { nama?: string } | null
  } | null
  gudang_asal_id?: number | null
  gudang_tujuan_id?: number | null
  gudang_asal?: { id?: number; nama?: string } | null
  gudang_tujuan?: { id?: number; nama?: string } | null
  user?: { name?: string } | null
}

type ArusTipe = "masuk" | "keluar" | "mutasi" | "lain"

function unwrapRows<T>(data: unknown): T[] {
  const body = data as { data?: unknown } | T[] | null | undefined
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === "object" && Array.isArray(body.data)) {
    return body.data as T[]
  }
  return []
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

function detectArus(row: MutasiStokRow): ArusTipe {
  const tipe = (row.tipe ?? "").toLowerCase()
  const ref = (row.no_referensi ?? "").toLowerCase()
  if (tipe.includes("masuk") || ref.startsWith("bm")) return "masuk"
  if (tipe.includes("keluar") || ref.startsWith("bk")) return "keluar"
  if (tipe.includes("mutasi") || ref.startsWith("mt")) return "mutasi"
  return "lain"
}

function renderArusBadge(arus: ArusTipe) {
  if (arus === "masuk")
    return <ColoredBadge color="green">Barang Masuk</ColoredBadge>
  if (arus === "keluar")
    return <ColoredBadge color="red">Barang Keluar</ColoredBadge>
  if (arus === "mutasi")
    return <ColoredBadge color="purple">Mutasi Rak</ColoredBadge>
  return <ColoredBadge color="gray">Transaksi</ColoredBadge>
}

export default function LaporanPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [gudangFilter, setGudangFilter] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState(() =>
    toDateParam(addDays(new Date(), -30))
  )
  const [toDate, setToDate] = useState(() => toDateParam(new Date()))
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const deferredSearch = useDeferredValue(searchQuery)
  const gudangOptions = useOptions<Gudang>("gudang", "/gudang")

  const gudangId =
    gudangFilter && gudangFilter !== "all" ? gudangFilter : undefined

  const mutasiParams = useMemo(
    () => ({ gudang_id: gudangId, from: fromDate, to: toDate, per_page: 100 }),
    [gudangId, fromDate, toDate]
  )

  const mutasiQuery = useApiList<MutasiStokRow>({
    key: "laporan-mutasi",
    url: "/laporan/mutasi-stok",
    params: mutasiParams,
  })
  const masukQuery = useApiList<LaporanRow>({
    key: "laporan-masuk",
    url: "/laporan/barang-masuk",
    params: mutasiParams,
  })
  const keluarQuery = useApiList<LaporanRow>({
    key: "laporan-keluar",
    url: "/laporan/barang-keluar",
    params: mutasiParams,
  })
  const opnameQuery = useApiList<Record<string, unknown>>({
    key: "laporan-opname-selisih",
    url: "/laporan/stok-opname",
    params: mutasiParams,
  })

  const rawMutasi = unwrapRows<MutasiStokRow>(mutasiQuery.data)
  const rawMasuk = unwrapRows<LaporanRow>(masukQuery.data)
  const rawKeluar = unwrapRows<LaporanRow>(keluarQuery.data)
  const rawOpname = unwrapRows<Record<string, unknown>>(opnameQuery.data)

  const gudangFilteredMutasi = useMemo(() => {
    if (!gudangId) return rawMutasi
    const gid = String(gudangId)
    return rawMutasi.filter((row) => {
      const asalId = row.gudang_asal_id ?? row.gudang_asal?.id
      const tujuanId = row.gudang_tujuan_id ?? row.gudang_tujuan?.id
      return String(asalId ?? "") === gid || String(tujuanId ?? "") === gid
    })
  }, [rawMutasi, gudangId])

  const rows = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim()
    if (!query) return gudangFilteredMutasi
    return gudangFilteredMutasi.filter((row) => {
      const nama = row.nama_barang ?? row.barang?.nama ?? ""
      const sku = row.sku ?? row.barang?.sku ?? ""
      return (
        (row.no_referensi ?? "").toLowerCase().includes(query) ||
        nama.toLowerCase().includes(query) ||
        sku.toLowerCase().includes(query)
      )
    })
  }, [gudangFilteredMutasi, deferredSearch])

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return rows.slice(start, start + itemsPerPage)
  }, [rows, currentPage])

  const totalMasuk = useMemo(
    () => rawMasuk.reduce((acc, row) => acc + (row.total_qty ?? 0), 0),
    [rawMasuk]
  )
  const totalKeluar = useMemo(
    () => rawKeluar.reduce((acc, row) => acc + (row.total_qty ?? 0), 0),
    [rawKeluar]
  )
  const totalMutasi = useMemo(
    () => gudangFilteredMutasi.filter((row) => detectArus(row) === "mutasi").length,
    [gudangFilteredMutasi]
  )
  const totalSelisih = useMemo(
    () =>
      rawOpname.reduce((acc, row) => {
        const selisih = (row.selisih as number | undefined) ?? 0
        return acc + Math.abs(selisih)
      }, 0),
    [rawOpname]
  )

  const isLoading =
    mutasiQuery.isLoading || masukQuery.isLoading || keluarQuery.isLoading

  const exportUrl = `/laporan/mutasi-stok?format=excel&from=${fromDate}&to=${toDate}${
    gudangId ? `&gudang_id=${gudangId}` : ""
  }`

  return (
    <>
      {/* Header Section */}
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Aktivitas Gudang" },
              { label: "Pergerakan Stok" },
            ]}
            title="Pergerakan Stok"
            icon={BiBarChartAlt2}
            description="Laporan arus keluar-masuk dan mutasi stok barang secara real-time."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export (.excel/.pdf)
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Section - Plain Boxes without color accents */}
      <div className="wrapper mt-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {/* Card 1: Total Barang Masuk */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiTrendingDown className="size-4 text-emerald-500" />
                <span className="text-sm font-medium text-foreground">
                  Total Barang Masuk
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {isLoading ? "-" : formatNumber(totalMasuk)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Unit / {formatNumber(rawMasuk.length)} Transaksi
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Berdasarkan laporan barang masuk
                </p>
              </div>
            </div>
          </Card>

          {/* Card 2: Total Barang Keluar */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiTrendingUp className="size-4 text-rose-500" />
                <span className="text-sm font-medium text-foreground">
                  Total Barang Keluar
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {isLoading ? "-" : formatNumber(totalKeluar)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Unit / {formatNumber(rawKeluar.length)} Transaksi
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Berdasarkan laporan barang keluar
                </p>
              </div>
            </div>
          </Card>

          {/* Card 3: Internal Mutasi Rak */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiTransfer className="size-4 text-blue-500" />
                <span className="text-sm font-medium text-foreground">
                  Internal Mutasi Rak
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {isLoading ? "-" : formatNumber(totalMutasi)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Log Mutasi
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pergerakan antar lokasi penyimpanan
                </p>
              </div>
            </div>
          </Card>

          {/* Card 4: Retur / Selisih Stok */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiPackage className="size-4 text-zinc-500" />
                <span className="text-sm font-medium text-foreground">
                  Retur / Selisih Stok
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {opnameQuery.isLoading ? "-" : formatNumber(totalSelisih)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Unit Selisih Opname
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total selisih dari hasil stok opname
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filter Section */}
      <div className="wrapper mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <InputSearch
            placeholder="Cari no. referensi, nama barang, atau SKU..."
            className="flex-1"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
          <DateRangeFilter
            startDate={fromDate}
            endDate={toDate}
            onStartDateChange={(val) => {
              setFromDate(val)
              setCurrentPage(1)
            }}
            onEndDateChange={(val) => {
              setToDate(val)
              setCurrentPage(1)
            }}
            onChange={({ startDate, endDate }) => {
              setFromDate(startDate)
              setToDate(endDate)
              setCurrentPage(1)
            }}
          />
          <Opsion
            placeholder="Semua Gudang"
            value={gudangFilter ?? ""}
            onValueChange={(val) => {
              setGudangFilter(val || null)
              setCurrentPage(1)
            }}
            options={[
              { value: "all", label: "Semua Gudang" },
              ...toOptions(gudangOptions.items),
            ]}
          />
        </div>
      </div>

      {/* Table Section - scrollable container with min-w to prevent overlapping and keep layout locked */}
      <div className="wrapper mt-[25px] w-full min-w-0">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1560px] table-fixed caption-bottom text-sm">
              <TableHeader className="border-b border-border/60 bg-white">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="w-[150px] pl-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Waktu & Tanggal
                  </TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    No. Referensi
                  </TableHead>
                  <TableHead className="w-[130px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Tipe Arus
                  </TableHead>
                  <TableHead className="w-[110px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Kode SKU
                  </TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Nama Barang
                  </TableHead>
                  <TableHead className="w-[200px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Lokasi Asal
                  </TableHead>
                  <TableHead className="w-[200px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Lokasi Tujuan
                  </TableHead>
                  <TableHead className="w-[90px] text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Jumlah (Qty)
                  </TableHead>
                  <TableHead className="w-[80px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Satuan
                  </TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Petugas Penanggung Jawab
                  </TableHead>
                  <TableHead className="w-[56px] pr-6 text-right text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    {/* Action column header */}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="min-h-[300px]">
                {isLoading && (
                  <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                    <TableCell
                      colSpan={11}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Memuat data...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && paginatedRows.length === 0 && (
                  <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                    <TableCell
                      colSpan={11}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data pergerakan stok.
                    </TableCell>
                  </TableRow>
                )}
                {paginatedRows.map((row) => {
                  const arus = detectArus(row)
                  const qty = row.qty ?? 0
                  const nama = row.nama_barang ?? row.barang?.nama ?? "-"
                  const sku = row.sku ?? row.barang?.sku ?? "-"
                  const satuan = row.satuan ?? row.barang?.satuan?.nama ?? "-"
                  const asal = row.lokasi_asal ?? row.gudang_asal?.nama ?? "-"
                  const tujuan =
                    row.lokasi_tujuan ?? row.gudang_tujuan?.nama ?? "-"
                  const petugas = row.petugas ?? row.user?.name ?? "-"
                  return (
                    <TableRow
                      key={
                        row.id ?? row.no_referensi ?? `${row.tanggal}-${sku}`
                      }
                      className="h-16 border-b border-border/40 hover:bg-muted/30"
                    >
                      <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                        {formatDate(row.tanggal)}
                      </TableCell>
                      <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-foreground">
                        {row.no_referensi ?? "-"}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap">
                        {renderArusBadge(arus)}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                        {sku}
                      </TableCell>
                      <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-foreground">
                        {nama}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        {asal}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        {tujuan}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm font-semibold whitespace-nowrap">
                        {qty > 0 ? (
                          <span className="text-emerald-600">
                            +{formatNumber(qty)}
                          </span>
                        ) : qty < 0 ? (
                          <span className="text-rose-600">
                            {formatNumber(qty)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {formatNumber(qty)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                        {satuan}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        {petugas}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <button className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                          <BiChevronRight className="size-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {paginatedRows.length > 0 && paginatedRows.length < 5 && (
                  <TableRow
                    style={{ height: `${300 - paginatedRows.length * 64}px` }}
                    className="pointer-events-none border-none hover:bg-transparent"
                  >
                    <TableCell colSpan={11} className="border-none p-0" />
                  </TableRow>
                )}
              </TableBody>
            </table>
          </div>
          <div className="flex h-14 items-center justify-between border-t border-border/50 bg-white px-6 font-sans text-xs text-muted-foreground">
            <span>
              Menampilkan{" "}
              {rows.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
              {Math.min(currentPage * itemsPerPage, rows.length)} dari{" "}
              {rows.length} data
            </span>
            {totalPages > 1 && (
              <div className="flex items-center">
                <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    <BiChevronLeft className="size-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 font-medium transition-colors last:border-r-0 ${
                          currentPage === page
                            ? "bg-muted/60 text-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    <BiChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
            <span>{itemsPerPage} per halaman</span>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Pergerakan Stok"
        totalItemsCount={rows.length}
        totalItemsLabel="Total Log"
        filterLabel="Filter Aktif"
        exportUrl={exportUrl}
        checkboxes={[
          {
            id: "waktuTanggal",
            label: "Waktu & Tanggal",
            defaultChecked: true,
          },
          {
            id: "noReferensi",
            label: "No. Referensi",
            defaultChecked: true,
          },
          {
            id: "tipeArus",
            label: "Tipe Arus",
            defaultChecked: true,
          },
          {
            id: "barang",
            label: "Detail Barang & Qty",
            defaultChecked: true,
          },
          {
            id: "lokasi",
            label: "Lokasi Asal/Tujuan",
            defaultChecked: true,
          },
          {
            id: "petugas",
            label: "Petugas Pelaksana",
            defaultChecked: true,
          },
        ]}
      />
    </>
  )
}
