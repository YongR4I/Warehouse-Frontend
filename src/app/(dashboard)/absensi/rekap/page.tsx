"use client"

import { ExportModal } from "@/components/export-modal"
import { useMemo, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch, DateRangeFilter } from "@/components/input"
import { Opsion } from "@/components/opsion"
import {
  BiChevronRight,
  BiSolidReport,
  BiClipboard,
  BiCheckCircle,
  BiTimeFive,
  BiUserX,
} from "react-icons/bi"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { useApiList } from "@/hooks/use-api"
import { formatDate, statusColor, statusLabel } from "@/lib/status"
import type { Absensi } from "@/types"

function unwrapRows<T>(data: unknown): T[] {
  const body = data as { data?: unknown } | T[] | null | undefined
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === "object" && Array.isArray(body.data)) {
    return body.data as T[]
  }
  return []
}

function firstOfMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}

function toDateParam(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseTime(t: string | null | undefined): number | null {
  if (!t) return null
  const match = t.match(/(\d{1,2}):(\d{2})/)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

function durasiText(
  masuk: string | null | undefined,
  pulang: string | null | undefined
): string {
  const a = parseTime(masuk)
  const b = parseTime(pulang)
  if (a === null || b === null) return "0j"
  let diff = b - a
  if (diff < 0) diff += 24 * 60
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m > 0 ? `${h}j ${m}m` : `${h}j`
}

function keterlambatanText(row: Absensi): string {
  if (row.status !== "terlambat") return "-"
  const masuk = parseTime(row.jam_masuk)
  const jadwal = parseTime(row.shift?.jam_masuk)
  if (masuk === null || jadwal === null) return "-"
  const late = masuk - jadwal
  if (late <= 0) return "0m"
  return `${late}m`
}

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status Kehadiran" },
  { value: "hadir", label: "Hadir" },
  { value: "terlambat", label: "Terlambat" },
  { value: "izin", label: "Izin" },
  { value: "cuti", label: "Cuti" },
  { value: "sakit", label: "Sakit" },
  { value: "alpha", label: "Alpha" },
]

export default function RekapPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState(() => firstOfMonth())
  const [toDate, setToDate] = useState(() => toDateParam(new Date()))
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const absensiQuery = useApiList<Absensi>({
    key: "absensi",
    url: "/absensi",
    params: { from: fromDate, to: toDate, per_page: 100 },
  })

  const rawRows = unwrapRows<Absensi>(absensiQuery.data)

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return rawRows.filter((row) => {
      const nama = row.user?.name ?? ""
      const nik = row.user?.no_pegawai ?? ""
      const shift = row.shift?.nama ?? ""
      const matchesSearch =
        !query ||
        nama.toLowerCase().includes(query) ||
        nik.toLowerCase().includes(query) ||
        shift.toLowerCase().includes(query)

      const matchesStatus =
        !statusFilter || statusFilter === "all" || row.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [rawRows, searchQuery, statusFilter])

  const totalSesi = filteredData.length
  const hadirCount = filteredData.filter((row) => row.status === "hadir").length
  const terlambatCount = filteredData.filter(
    (row) => row.status === "terlambat"
  ).length
  const alphaCount = filteredData.filter((row) => row.status === "alpha").length
  const hadirPct = totalSesi > 0 ? (hadirCount / totalSesi) * 100 : 0
  const terlambatPct = totalSesi > 0 ? (terlambatCount / totalSesi) * 100 : 0
  const alphaPct = totalSesi > 0 ? (alphaCount / totalSesi) * 100 : 0

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredData.slice(start, end)
  }, [filteredData, currentPage])

  const renderStatusBadge = (status: string) => {
    return (
      <ColoredBadge color={statusColor(status)}>
        {statusLabel(status)}
      </ColoredBadge>
    )
  }

  const renderDurasiText = (durasi: string) => {
    const hours = Number(durasi.match(/^(\d+)/)?.[1] ?? 0)
    let textColor = "text-muted-foreground"
    if (hours >= 9) {
      textColor = "text-[#DC2626]"
    } else if (hours >= 1) {
      textColor = "text-[#2563EB]"
    }
    return (
      <span className={cn("font-sans text-sm font-semibold", textColor)}>
        {durasi}
      </span>
    )
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleStatusChange = (val: string | null) => {
    setStatusFilter(val)
    setCurrentPage(1)
  }

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const maxButtons = 5
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxButtons - 1)
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 font-medium transition-colors last:border-r-0",
            currentPage === i
              ? "bg-muted/60 text-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {i}
        </button>
      )
    }
    return buttons
  }

  const exportUrl = `/laporan/absensi?format=excel&from=${fromDate}&to=${toDate}`

  return (
    <>
      {/* ─── HEADER ─── */}
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Aktivitas Gudang" },
              { label: "Rekap Kehadiran" },
            ]}
            title="Rekap Kehadiran"
            icon={BiClipboard}
            description="Ringkasan laporan kehadiran karyawan per periode."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export (.excel/.pdf)
            </Button>
          </div>
        </div>
      </div>

      {/* ─── STATS CARDS ─── */}
      <div className="wrapper mt-[35px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Presensi Dicatat */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <BiClipboard className="size-4 text-muted-foreground" />
            <span>Total Presensi Dicatat</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {absensiQuery.isLoading ? "-" : totalSesi}
            </span>
            <span className="text-xs font-semibold text-muted-foreground/70">
              Sesi / Periode Ini
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-muted-foreground/60">
            {formatDate(fromDate)} – {formatDate(toDate)}
          </div>
        </div>

        {/* Card 2: Kehadiran Tepat Waktu */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <BiCheckCircle className="size-4 text-muted-foreground" />
            <span>Kehadiran Tepat Waktu</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {absensiQuery.isLoading ? "-" : `${hadirPct.toFixed(1)}%`}
            </span>
            <span className="text-xs font-semibold text-muted-foreground/70">
              {hadirCount} Sesi
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-muted-foreground/60">
            Sesuai dengan Jadwal Shift
          </div>
        </div>

        {/* Card 3: Total Terlambat */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <BiTimeFive className="size-4 text-muted-foreground" />
            <span>Total Terlambat</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {absensiQuery.isLoading ? "-" : terlambatCount}
            </span>
            <span className="text-xs font-semibold text-muted-foreground/70">
              Sesi ({terlambatPct.toFixed(1)}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-muted-foreground/60">
            Status Terlambat pada Periode
          </div>
        </div>

        {/* Card 4: Mangkir / Alfa */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <BiUserX className="size-4 text-muted-foreground" />
            <span>Mangkir / Alfa</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {absensiQuery.isLoading ? "-" : alphaCount}
            </span>
            <span className="text-xs font-semibold text-muted-foreground/70">
              Sesi ({alphaPct.toFixed(1)}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-muted-foreground/60">
            Tanpa Catatan Cuti atau Izin
          </div>
        </div>
      </div>

      {/* ─── FILTER ─── */}
      <div className="wrapper mt-[50px]">
        <div className="flex flex-wrap items-center gap-2">
          <InputSearch
            placeholder="Cari NIK atau nama petugas..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1"
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
            placeholder="Semua Status Kehadiran"
            value={statusFilter || ""}
            onValueChange={handleStatusChange}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      {/* ─── TABLE ─── */}
      <div className="wrapper mt-[25px]">
        <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <TableHeader className="border-b border-border/60 bg-white">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Tanggal
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    NIK Petugas
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Nama Petugas
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Gudang Penugasan
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Nama Shift
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Jadwal Masuk
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Jadwal Keluar
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Check-In Realita
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Check-Out Realita
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Durasi Kerja
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Keterlambatan
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Status Kehadiran
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Petugas Audit
                  </TableHead>
                  <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="min-h-[300px]">
                {absensiQuery.isLoading && (
                  <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                    <TableCell
                      colSpan={14}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Memuat data...
                    </TableCell>
                  </TableRow>
                )}
                {!absensiQuery.isLoading && paginatedData.length === 0 && (
                  <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                    <TableCell
                      colSpan={14}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data rekap kehadiran.
                    </TableCell>
                  </TableRow>
                )}
                {paginatedData.map((row) => {
                  const durasi = durasiText(row.jam_masuk, row.jam_pulang)
                  const keterlambatan = keterlambatanText(row)
                  return (
                    <TableRow
                      key={row.id}
                      className="h-16 border-b border-border/40 hover:bg-muted/30"
                    >
                      <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                        {formatDate(row.tanggal)}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        <ColoredBadge color="gray">
                          {row.user?.no_pegawai ?? "-"}
                        </ColoredBadge>
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        {row.user?.name ?? `User #${row.user_id}`}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground/80">
                        {row.gudang?.nama ?? "-"}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap">
                        <ColoredBadge color="gray">
                          {row.shift?.nama ?? "-"}
                        </ColoredBadge>
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                        {row.shift?.jam_masuk ?? "-"}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                        {row.shift?.jam_pulang ?? "-"}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                        {row.jam_masuk ?? "-"}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                        {row.jam_pulang ?? "-"}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                        {renderDurasiText(durasi)}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                        <span
                          className={cn(
                            "font-sans text-sm",
                            keterlambatan === "0m" || keterlambatan === "-"
                              ? "text-muted-foreground"
                              : "text-foreground"
                          )}
                        >
                          {keterlambatan}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                        {renderStatusBadge(row.status)}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        {row.user?.name ?? "-"}
                      </TableCell>
                      <TableCell className="pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 text-muted-foreground">
                          <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                            <BiChevronRight className="size-4 text-foreground/75" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {paginatedData.length > 0 && paginatedData.length < 6 && (
                  <TableRow
                    style={{ height: `${(6 - paginatedData.length) * 64}px` }}
                    className="pointer-events-none border-none hover:bg-transparent"
                  >
                    <TableCell colSpan={14} className="border-none p-0" />
                  </TableRow>
                )}
              </TableBody>
            </table>
          </div>

          {/* Pagination outside of scrollable table wrapper */}
          <div className="flex h-14 items-center justify-between border-t border-border/50 bg-white px-6 font-sans text-xs text-muted-foreground select-none">
            <span>
              Menampilkan{" "}
              {filteredData.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}
              -{Math.min(currentPage * itemsPerPage, filteredData.length)} dari{" "}
              {filteredData.length} data
            </span>
            {totalPages > 1 && (
              <div className="flex items-center">
                <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    &lt;
                  </button>
                  {renderPaginationButtons()}
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    &gt;
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
        title="Ekspor Rekap Absensi"
        totalItemsCount={filteredData.length}
        totalItemsLabel="Total Rekap"
        filterLabel="Filter Aktif"
        exportUrl={exportUrl}
        checkboxes={[
          {
            id: "nama",
            label: "Nama & NIP",
            defaultChecked: true,
          },
          {
            id: "kehadiran",
            label: "Ringkasan Hadir/Sakit/Izin/Alfa",
            defaultChecked: true,
          },
          {
            id: "persentase",
            label: "Persentase Kehadiran",
            defaultChecked: true,
          },
        ]}
      />
    </>
  )
}
