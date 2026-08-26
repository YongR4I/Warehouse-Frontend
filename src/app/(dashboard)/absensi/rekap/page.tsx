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

const GROUP_BY_OPTIONS = [
  { value: "petugas", label: "Per Petugas" },
  { value: "gudang", label: "Per Gudang" },
]

interface RekapPetugas {
  // "p{petugas_id}" utk karyawan native, "u{user_id}" utk akun (kontrak v3)
  key: string
  nama: string
  nik: string
  gudang: string
  hadir: number
  terlambat: number
  alpha: number
  izin: number
  sakit: number
  cuti: number
  total: number
  pctHadir: number
}

interface RekapGudang {
  key: number
  nama: string
  totalPetugas: number
  hadir: number
  terlambat: number
  alpha: number
  izin: number
  sakit: number
  cuti: number
  total: number
  pctHadir: number
}

export default function RekapPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState(() => firstOfMonth())
  const [toDate, setToDate] = useState(() => toDateParam(new Date()))
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"detail" | "ringkasan">("detail")
  const [groupBy, setGroupBy] = useState<"petugas" | "gudang">("petugas")
  const itemsPerPage = 6

  const absensiQuery = useApiList<Absensi>({
    key: "absensi",
    url: "/laporan/absensi",
    params: { from: fromDate, to: toDate, per_page: 100 },
  })

  const rawRows = unwrapRows<Absensi>(absensiQuery.data)

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return rawRows.filter((row) => {
      // Kontrak v3: baris bisa milik karyawan native (petugas) atau akun
      const nama = row.nama ?? row.user?.name ?? ""
      const nik = row.petugas?.kode ?? row.user?.no_pegawai ?? ""
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

  const rekapData = useMemo(() => {
    if (groupBy === "petugas") {
      const map = new Map<
        string,
        {
          key: string
          nama: string
          nik: string
          gudang: string
          hadir: number
          terlambat: number
          alpha: number
          izin: number
          sakit: number
          cuti: number
          total: number
        }
      >()
      for (const row of filteredData) {
        // Kontrak v3: subjek = karyawan native ATAU akun — id-space beda,
        // jadi kunci pakai prefix.
        const key = row.petugas_id ? `p${row.petugas_id}` : `u${row.user_id}`
        if (!map.has(key)) {
          map.set(key, {
            key,
            nama:
              row.nama ??
              row.user?.name ??
              row.petugas?.nama ??
              `Subjek #${key}`,
            nik: row.petugas?.kode ?? row.user?.no_pegawai ?? "-",
            gudang: row.gudang?.nama ?? "-",
            hadir: 0,
            terlambat: 0,
            alpha: 0,
            izin: 0,
            sakit: 0,
            cuti: 0,
            total: 0,
          })
        }
        const g = map.get(key)!
        g.total++
        if (row.status === "hadir") g.hadir++
        else if (row.status === "terlambat") g.terlambat++
        else if (row.status === "alpha") g.alpha++
        else if (row.status === "izin") g.izin++
        else if (row.status === "sakit") g.sakit++
        else if (row.status === "cuti") g.cuti++
      }
      return Array.from(map.values()).map((g) => ({
        ...g,
        pctHadir: g.total > 0 ? (g.hadir / g.total) * 100 : 0,
      }))
    }
    const map = new Map<
      number,
      {
        key: number
        nama: string
        petugasSet: Set<string>
        hadir: number
        terlambat: number
        alpha: number
        izin: number
        sakit: number
        cuti: number
        total: number
      }
    >()
    for (const row of filteredData) {
      const id = row.gudang_id
      if (!map.has(id)) {
        map.set(id, {
          key: id,
          nama: row.gudang?.nama ?? `Gudang #${id}`,
          petugasSet: new Set(),
          hadir: 0,
          terlambat: 0,
          alpha: 0,
          izin: 0,
          sakit: 0,
          cuti: 0,
          total: 0,
        })
      }
      const g = map.get(id)!
      g.petugasSet.add(
        row.petugas_id ? `p${row.petugas_id}` : `u${row.user_id}`
      )
      g.total++
      if (row.status === "hadir") g.hadir++
      else if (row.status === "terlambat") g.terlambat++
      else if (row.status === "alpha") g.alpha++
      else if (row.status === "izin") g.izin++
      else if (row.status === "sakit") g.sakit++
      else if (row.status === "cuti") g.cuti++
    }
    return Array.from(map.values()).map((g) => ({
      key: g.key,
      nama: g.nama,
      totalPetugas: g.petugasSet.size,
      hadir: g.hadir,
      terlambat: g.terlambat,
      alpha: g.alpha,
      izin: g.izin,
      sakit: g.sakit,
      cuti: g.cuti,
      total: g.total,
      pctHadir: g.total > 0 ? (g.hadir / g.total) * 100 : 0,
    }))
  }, [filteredData, groupBy])

  const paginatedRekap = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return rekapData.slice(start, start + itemsPerPage)
  }, [rekapData, currentPage])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredData.slice(start, end)
  }, [filteredData, currentPage])

  const totalPages = Math.max(
    1,
    Math.ceil(
      (viewMode === "ringkasan" ? rekapData.length : filteredData.length) /
        itemsPerPage
    )
  )

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
            <div className="flex overflow-hidden rounded-lg border border-border/80 bg-background">
              <button
                onClick={() => {
                  setViewMode("detail")
                  setCurrentPage(1)
                }}
                className={cn(
                  "flex h-9 items-center px-3 text-xs font-medium transition-colors",
                  viewMode === "detail"
                    ? "bg-muted/60 text-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                Detail
              </button>
              <button
                onClick={() => {
                  setViewMode("ringkasan")
                  setCurrentPage(1)
                }}
                className={cn(
                  "flex h-9 items-center px-3 text-xs font-medium transition-colors",
                  viewMode === "ringkasan"
                    ? "bg-muted/60 text-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                Ringkasan
              </button>
            </div>
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
          {viewMode === "ringkasan" && (
            <Opsion
              placeholder="Kelompokkan"
              value={groupBy}
              onValueChange={(val) => {
                if (val === "petugas" || val === "gudang") {
                  setGroupBy(val)
                  setCurrentPage(1)
                }
              }}
              options={GROUP_BY_OPTIONS}
            />
          )}
        </div>
      </div>

      {/* ─── TABLE ─── */}
      {viewMode === "detail" && (
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
                    <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                      Sumber
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
                        colSpan={15}
                        className="text-center text-sm text-muted-foreground"
                      >
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  )}
                  {!absensiQuery.isLoading && paginatedData.length === 0 && (
                    <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                      <TableCell
                        colSpan={15}
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
                            {row.petugas?.kode ?? row.user?.no_pegawai ?? "-"}
                          </ColoredBadge>
                        </TableCell>
                        <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                          {row.nama ?? row.user?.name ?? "-"}
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
                        <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <ColoredBadge
                              color={row.sumber === "manual" ? "gray" : "blue"}
                            >
                              {row.sumber === "manual" ? "Manual" : "Scan QR"}
                            </ColoredBadge>
                            {row.di_luar_jadwal && (
                              <ColoredBadge color="yellow">
                                Di Luar Jadwal
                              </ColoredBadge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                          {row.nama ?? row.user?.name ?? "-"}
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
                      <TableCell colSpan={15} className="border-none p-0" />
                    </TableRow>
                  )}
                </TableBody>
              </table>
            </div>

            <div className="flex h-14 items-center justify-between border-t border-border/50 bg-white px-6 font-sans text-xs text-muted-foreground select-none">
              <span>
                Menampilkan{" "}
                {filteredData.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}
                -{Math.min(currentPage * itemsPerPage, filteredData.length)}{" "}
                dari {filteredData.length} data
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
      )}

      {/* ─── TABLE RINGKASAN ─── */}
      {viewMode === "ringkasan" && (
        <div className="wrapper mt-[25px]">
          <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-card">
            <div className="w-full overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <TableHeader className="border-b border-border/60 bg-white">
                  <TableRow className="h-14 hover:bg-transparent">
                    {groupBy === "petugas" ? (
                      <>
                        <TableHead className="pl-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                          NIK
                        </TableHead>
                        <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                          Nama Petugas
                        </TableHead>
                        <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                          Gudang
                        </TableHead>
                      </>
                    ) : (
                      <TableHead className="pl-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                        Gudang
                      </TableHead>
                    )}
                    {groupBy === "gudang" && (
                      <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                        Total Petugas
                      </TableHead>
                    )}
                    <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                      Hadir
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                      Terlambat
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                      Alpha
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                      Izin
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                      Sakit
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                      Cuti
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                      % Hadir
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="min-h-[300px]">
                  {absensiQuery.isLoading && (
                    <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                      <TableCell
                        colSpan={groupBy === "petugas" ? 10 : 9}
                        className="text-center text-sm text-muted-foreground"
                      >
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  )}
                  {!absensiQuery.isLoading && paginatedRekap.length === 0 && (
                    <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                      <TableCell
                        colSpan={groupBy === "petugas" ? 10 : 9}
                        className="text-center text-sm text-muted-foreground"
                      >
                        Tidak ada data rekap kehadiran.
                      </TableCell>
                    </TableRow>
                  )}
                  {paginatedRekap.map((row) => (
                    <TableRow
                      key={row.key}
                      className="h-16 border-b border-border/40 hover:bg-muted/30"
                    >
                      {groupBy === "petugas" ? (
                        <>
                          <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                            <ColoredBadge color="gray">
                              {(row as RekapPetugas).nik}
                            </ColoredBadge>
                          </TableCell>
                          <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                            {row.nama}
                          </TableCell>
                          <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground/80">
                            {(row as RekapPetugas).gudang}
                          </TableCell>
                        </>
                      ) : (
                        <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                          {row.nama}
                        </TableCell>
                      )}
                      {groupBy === "gudang" && (
                        <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                          {(row as RekapGudang).totalPetugas}
                        </TableCell>
                      )}
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                        <span className="font-semibold text-[#16a34a]">
                          {row.hadir}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                        <span className="font-semibold text-[#ca8a04]">
                          {row.terlambat}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                        <span className="font-semibold text-[#6b7280]">
                          {row.alpha}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                        <span className="font-semibold text-[#2563eb]">
                          {row.izin}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                        <span className="font-semibold text-[#dc2626]">
                          {row.sakit}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                        <span className="font-semibold text-[#9333ea]">
                          {row.cuti}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                        <span
                          className={cn(
                            "font-semibold",
                            row.pctHadir >= 90
                              ? "text-[#16a34a]"
                              : row.pctHadir >= 70
                                ? "text-[#ca8a04]"
                                : "text-[#dc2626]"
                          )}
                        >
                          {row.pctHadir.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedRekap.length > 0 && paginatedRekap.length < 6 && (
                    <TableRow
                      style={{
                        height: `${(6 - paginatedRekap.length) * 64}px`,
                      }}
                      className="pointer-events-none border-none hover:bg-transparent"
                    >
                      <TableCell
                        colSpan={groupBy === "petugas" ? 10 : 9}
                        className="border-none p-0"
                      />
                    </TableRow>
                  )}
                </TableBody>
              </table>
            </div>

            <div className="flex h-14 items-center justify-between border-t border-border/50 bg-white px-6 font-sans text-xs text-muted-foreground select-none">
              <span>
                Menampilkan{" "}
                {rekapData.length > 0
                  ? (currentPage - 1) * itemsPerPage + 1
                  : 0}
                -{Math.min(currentPage * itemsPerPage, rekapData.length)} dari{" "}
                {rekapData.length} data
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
      )}

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
