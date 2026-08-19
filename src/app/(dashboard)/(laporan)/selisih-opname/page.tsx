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
import {
  formatDate,
  formatNumber,
  statusColor,
  statusLabel,
} from "@/lib/status"
import type { Gudang } from "@/types"
import {
  BiSolidReport,
  BiBarChartAlt2,
  BiChevronRight,
  BiChevronLeft,
  BiTrendingDown,
  BiTrendingUp,
  BiPackage,
  BiTargetLock,
} from "react-icons/bi"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

interface OpnameRow {
  id?: number
  no_referensi?: string
  tanggal?: string
  gudang?: string
  status?: string
  kode_rak?: string
  sku?: string
  nama?: string
  kategori?: string
  satuan?: string
  stok_sistem?: number
  stok_fisik?: number
  selisih?: number
  petugas?: string
  barang?: {
    sku?: string
    nama?: string
    kategori?: { nama?: string } | null
    satuan?: { nama?: string } | null
  } | null
}

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

function getSelisih(row: OpnameRow): number | undefined {
  if (row.selisih !== undefined) return row.selisih
  if (row.stok_fisik !== undefined && row.stok_sistem !== undefined) {
    return row.stok_fisik - row.stok_sistem
  }
  return undefined
}

type RekonsStatus = "defisit" | "surplus" | "akurat" | "unknown"

function getRekonsStatus(row: OpnameRow): RekonsStatus {
  const selisih = getSelisih(row)
  if (selisih === undefined) return "unknown"
  if (selisih < 0) return "defisit"
  if (selisih > 0) return "surplus"
  return "akurat"
}

function renderRekonsBadge(status: RekonsStatus, row: OpnameRow) {
  if (status === "defisit") {
    return <ColoredBadge color="red">Defisit (Kurang)</ColoredBadge>
  }
  if (status === "surplus") {
    return <ColoredBadge color="blue">Surplus (Lebih)</ColoredBadge>
  }
  if (status === "akurat") {
    return <ColoredBadge color="green">Akurat (Klop)</ColoredBadge>
  }
  return (
    <ColoredBadge color={statusColor(row.status)}>
      {statusLabel(row.status)}
    </ColoredBadge>
  )
}

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Pending" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Disetujui" },
  { value: "completed", label: "Selesai" },
  { value: "rejected", label: "Ditolak" },
]

export default function LaporanSelisihOpnamePage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [gudangFilter, setGudangFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
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
  const status =
    statusFilter && statusFilter !== "all" ? statusFilter : undefined

  const params = useMemo(
    () => ({
      gudang_id: gudangId,
      status,
      from: fromDate,
      to: toDate,
      per_page: 100,
    }),
    [gudangId, status, fromDate, toDate]
  )

  const query = useApiList<OpnameRow>({
    key: "laporan-opname",
    url: "/laporan/stok-opname",
    params,
  })

  const rawRows = unwrapRows<OpnameRow>(query.data)

  const rows = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim()
    if (!q) return rawRows
    return rawRows.filter((row) => {
      const nama = row.nama ?? row.barang?.nama ?? ""
      const sku = row.sku ?? row.barang?.sku ?? ""
      const rak = row.kode_rak ?? ""
      return (
        (row.no_referensi ?? "").toLowerCase().includes(q) ||
        nama.toLowerCase().includes(q) ||
        sku.toLowerCase().includes(q) ||
        rak.toLowerCase().includes(q)
      )
    })
  }, [rawRows, deferredSearch])

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return rows.slice(start, start + itemsPerPage)
  }, [rows, currentPage])

  const totalMinus = useMemo(
    () => rows.reduce((acc, row) => acc + Math.min(getSelisih(row) ?? 0, 0), 0),
    [rows]
  )
  const totalPlus = useMemo(
    () => rows.reduce((acc, row) => acc + Math.max(getSelisih(row) ?? 0, 0), 0),
    [rows]
  )
  const akuratCount = useMemo(
    () => rows.filter((row) => getSelisih(row) === 0).length,
    [rows]
  )
  const akurasi = rows.length > 0 ? (akuratCount / rows.length) * 100 : 0

  const exportUrl = `/laporan/stok-opname?format=excel&from=${fromDate}&to=${toDate}${
    gudangId ? `&gudang_id=${gudangId}` : ""
  }${status ? `&status=${status}` : ""}`

  return (
    <>
      {/* Header Section */}
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[{ label: "Aktivitas Gudang" }, { label: "Selisih Opname" }]}
            title="Laporan Selisih Opname"
            icon={BiBarChartAlt2}
            description="Laporan perbedaan stok sistem versus fisik."
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
          {/* Card 1: Total Item Diperiksa */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiPackage className="size-4 text-zinc-500" />
                <span className="text-sm font-medium text-foreground">
                  Total Item Diperiksa
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {query.isLoading ? "-" : formatNumber(rows.length)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Baris Selisih
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sesi audit pada periode terpilih
                </p>
              </div>
            </div>
          </Card>

          {/* Card 2: Total Selisih Minus (Defisit) */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiTrendingDown className="size-4 text-rose-500" />
                <span className="text-sm font-medium text-foreground">
                  Total Selisih Minus (Defisit)
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {query.isLoading ? "-" : formatNumber(totalMinus)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Unit (Defisit)
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total kekurangan stok fisik
                </p>
              </div>
            </div>
          </Card>

          {/* Card 3: Total Selisih Plus (Surplus) */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiTrendingUp className="size-4 text-emerald-500" />
                <span className="text-sm font-medium text-foreground">
                  Total Selisih Plus (Surplus)
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {query.isLoading ? "-" : `+${formatNumber(totalPlus)}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Unit (Surplus)
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total kelebihan stok fisik
                </p>
              </div>
            </div>
          </Card>

          {/* Card 4: Tingkat Akurasi Stok */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiTargetLock className="size-4 text-blue-500" />
                <span className="text-sm font-medium text-foreground">
                  Tingkat Akurasi Stok
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {query.isLoading ? "-" : `${akurasi.toFixed(1)}%`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Sesuai Fisik
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNumber(akuratCount)} SKU Klop Sesuai Sistem
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
            placeholder="Cari no. opname, nama barang, SKU, atau kode rak..."
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
          <Opsion
            placeholder="Semua Status"
            value={statusFilter ?? ""}
            onValueChange={(val) => {
              setStatusFilter(val || null)
              setCurrentPage(1)
            }}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      {/* Table Section - scrollable container with min-w to prevent overlapping and keep layout locked */}
      <div className="wrapper mt-[25px] w-full min-w-0">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1756px] table-fixed caption-bottom text-sm">
              <TableHeader className="border-b border-border/60 bg-white">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="w-[120px] pl-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Tanggal Audit
                  </TableHead>
                  <TableHead className="w-[160px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    No. Opname
                  </TableHead>
                  <TableHead className="w-[140px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Nama Gudang
                  </TableHead>
                  <TableHead className="w-[110px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Kode Rak
                  </TableHead>
                  <TableHead className="w-[130px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Kode SKU
                  </TableHead>
                  <TableHead className="w-[220px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Nama Barang
                  </TableHead>
                  <TableHead className="w-[120px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Kategori
                  </TableHead>
                  <TableHead className="w-[100px] text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Stok Sistem
                  </TableHead>
                  <TableHead className="w-[100px] text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Stok Fisik
                  </TableHead>
                  <TableHead className="w-[100px] text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Selisih (Qty)
                  </TableHead>
                  <TableHead className="w-[90px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Satuan
                  </TableHead>
                  <TableHead className="w-[160px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Status Rekons.
                  </TableHead>
                  <TableHead className="w-[150px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Petugas Audit
                  </TableHead>
                  <TableHead className="w-[56px] pr-6 text-right text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    {/* Action column header */}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="min-h-[300px]">
                {query.isLoading && (
                  <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                    <TableCell
                      colSpan={14}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Memuat data...
                    </TableCell>
                  </TableRow>
                )}
                {!query.isLoading && paginatedRows.length === 0 && (
                  <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                    <TableCell
                      colSpan={14}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data selisih opname.
                    </TableCell>
                  </TableRow>
                )}
                {paginatedRows.map((row) => {
                  const selisih = getSelisih(row)
                  const rekons = getRekonsStatus(row)
                  const nama = row.nama ?? row.barang?.nama ?? "-"
                  const sku = row.sku ?? row.barang?.sku ?? "-"
                  const kategori =
                    row.kategori ?? row.barang?.kategori?.nama ?? "-"
                  const satuan = row.satuan ?? row.barang?.satuan?.nama ?? "-"
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
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        {row.gudang ?? "-"}
                      </TableCell>
                      <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-muted-foreground">
                        {row.kode_rak ?? "-"}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                        {sku}
                      </TableCell>
                      <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-foreground">
                        {nama}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                        {kategori}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                        {row.stok_sistem !== undefined
                          ? formatNumber(row.stok_sistem)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                        {row.stok_fisik !== undefined
                          ? formatNumber(row.stok_fisik)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm font-semibold whitespace-nowrap">
                        {selisih === undefined ? (
                          <span className="text-muted-foreground">-</span>
                        ) : selisih > 0 ? (
                          <span className="text-blue-600">
                            +{formatNumber(selisih)}
                          </span>
                        ) : selisih < 0 ? (
                          <span className="text-rose-600">
                            {formatNumber(selisih)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {formatNumber(selisih)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                        {satuan}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap">
                        {renderRekonsBadge(rekons, row)}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        {row.petugas ?? "-"}
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
                    <TableCell colSpan={14} className="border-none p-0" />
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
        title="Ekspor Laporan Selisih Opname"
        totalItemsCount={rows.length}
        totalItemsLabel="Total Selisih"
        filterLabel="Filter Aktif"
        exportUrl={exportUrl}
        checkboxes={[
          {
            id: "noDokumen",
            label: "No. Dokumen Opname",
            defaultChecked: true,
          },
          {
            id: "barang",
            label: "Detail Barang & SKU",
            defaultChecked: true,
          },
          {
            id: "selisih",
            label: "Kuantitas Selisih",
            defaultChecked: true,
          },
          {
            id: "nominal",
            label: "Nilai Selisih (Rupiah)",
            defaultChecked: true,
          },
          {
            id: "keterangan",
            label: "Keterangan / Alasan",
            defaultChecked: true,
          },
        ]}
      />
    </>
  )
}
