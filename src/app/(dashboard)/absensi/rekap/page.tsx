"use client"

import { ExportModal } from "@/components/export-modal"
import { useState, useMemo } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import {
  BiCalendar,
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

interface AttendanceItem {
  id: string
  tanggal: string
  nik: string
  nama: string
  gudang: string
  shift: string
  jadwalMasuk: string
  jadwalKeluar: string
  checkIn: string
  checkOut: string
  durasi: string
  durasiColor: "red" | "blue" | "gray"
  keterlambatan: string
  status: "Hadir" | "Terlambat" | "Izin / Cuti" | "Mangkir"
  petugasAudit: string
}

const dummyData: AttendanceItem[] = [
  {
    id: "1",
    tanggal: "29 Jul 2026",
    nik: "PET-2024-001",
    nama: "Budi Santoso",
    gudang: "Gudang",
    shift: "Shift Pagi (A)",
    jadwalMasuk: "08:00",
    jadwalKeluar: "17:00",
    checkIn: "07:52",
    checkOut: "17:05",
    durasi: "9j 13m",
    durasiColor: "red",
    keterlambatan: "0m",
    status: "Hadir",
    petugasAudit: "Budi Santoso",
  },
  {
    id: "2",
    tanggal: "29 Jul 2026",
    nik: "PET-2024-004",
    nama: "Dedi Kurniawan",
    gudang: "Gudang",
    shift: "Shift Pagi (A)",
    jadwalMasuk: "08:00",
    jadwalKeluar: "17:00",
    checkIn: "08:18",
    checkOut: "17:02",
    durasi: "8j 44m",
    durasiColor: "blue",
    keterlambatan: "18m",
    status: "Terlambat",
    petugasAudit: "Dedi Kurniawan",
  },
  {
    id: "3",
    tanggal: "29 Jul 2026",
    nik: "PET-2024-008",
    nama: "Ahmad Fauzi",
    gudang: "Gudang",
    shift: "Shift Siang (B)",
    jadwalMasuk: "13:00",
    jadwalKeluar: "21:00",
    checkIn: "12:55",
    checkOut: "21:10",
    durasi: "8j 15m",
    durasiColor: "red",
    keterlambatan: "0m",
    status: "Hadir",
    petugasAudit: "Ahmad Fauzi",
  },
  {
    id: "4",
    tanggal: "29 Jul 2026",
    nik: "PET-2024-012",
    nama: "Siti Aminah",
    gudang: "Gudang",
    shift: "Shift Pagi (A)",
    jadwalMasuk: "08:00",
    jadwalKeluar: "17:00",
    checkIn: "-",
    checkOut: "-",
    durasi: "0j",
    durasiColor: "gray",
    keterlambatan: "-",
    status: "Izin / Cuti",
    petugasAudit: "Eko Prasetyo",
  },
  {
    id: "5",
    tanggal: "28 Jul 2026",
    nik: "PET-2024-019",
    nama: "Rian Hidayat",
    gudang: "Gudang",
    shift: "Shift Malam (C)",
    jadwalMasuk: "21:00",
    jadwalKeluar: "06:00",
    checkIn: "-",
    checkOut: "-",
    durasi: "0j",
    durasiColor: "gray",
    keterlambatan: "-",
    status: "Mangkir",
    petugasAudit: "Rian Hidayat",
  },
  {
    id: "6",
    tanggal: "28 Jul 2026",
    nik: "PET-2024-002",
    nama: "Eko Prasetyo",
    gudang: "Gudang",
    shift: "Shift Pagi (A)",
    jadwalMasuk: "08:00",
    jadwalKeluar: "17:00",
    checkIn: "07:55",
    checkOut: "17:01",
    durasi: "9j 6m",
    durasiColor: "red",
    keterlambatan: "0m",
    status: "Hadir",
    petugasAudit: "Budi Santoso",
  },
  {
    id: "7",
    tanggal: "28 Jul 2026",
    nik: "PET-2024-003",
    nama: "Hendra Wijaya",
    gudang: "Gudang",
    shift: "Shift Siang (B)",
    jadwalMasuk: "13:00",
    jadwalKeluar: "21:00",
    checkIn: "13:12",
    checkOut: "21:05",
    durasi: "7j 53m",
    durasiColor: "blue",
    keterlambatan: "12m",
    status: "Terlambat",
    petugasAudit: "Ahmad Fauzi",
  },
  {
    id: "8",
    tanggal: "28 Jul 2026",
    nik: "PET-2024-005",
    nama: "Rina Lestari",
    gudang: "Gudang",
    shift: "Shift Pagi (A)",
    jadwalMasuk: "08:00",
    jadwalKeluar: "17:00",
    checkIn: "07:50",
    checkOut: "17:00",
    durasi: "9j 10m",
    durasiColor: "red",
    keterlambatan: "0m",
    status: "Hadir",
    petugasAudit: "Dedi Kurniawan",
  },
  {
    id: "9",
    tanggal: "27 Jul 2026",
    nik: "PET-2024-006",
    nama: "Adi Syahputra",
    gudang: "Gudang",
    shift: "Shift Malam (C)",
    jadwalMasuk: "21:00",
    jadwalKeluar: "06:00",
    checkIn: "20:58",
    checkOut: "06:02",
    durasi: "9j 4m",
    durasiColor: "red",
    keterlambatan: "0m",
    status: "Hadir",
    petugasAudit: "Rian Hidayat",
  },
  {
    id: "10",
    tanggal: "27 Jul 2026",
    nik: "PET-2024-007",
    nama: "Yudi Hermawan",
    gudang: "Gudang",
    shift: "Shift Pagi (A)",
    jadwalMasuk: "08:00",
    jadwalKeluar: "17:00",
    checkIn: "08:05",
    checkOut: "17:00",
    durasi: "8j 55m",
    durasiColor: "blue",
    keterlambatan: "5m",
    status: "Terlambat",
    petugasAudit: "Budi Santoso",
  },
  {
    id: "11",
    tanggal: "27 Jul 2026",
    nik: "PET-2024-009",
    nama: "Mega Utami",
    gudang: "Gudang",
    shift: "Shift Siang (B)",
    jadwalMasuk: "13:00",
    jadwalKeluar: "21:00",
    checkIn: "12:59",
    checkOut: "21:01",
    durasi: "8j 2m",
    durasiColor: "blue",
    keterlambatan: "0m",
    status: "Hadir",
    petugasAudit: "Eko Prasetyo",
  },
  {
    id: "12",
    tanggal: "27 Jul 2026",
    nik: "PET-2024-010",
    nama: "Joko Susilo",
    gudang: "Gudang",
    shift: "Shift Malam (C)",
    jadwalMasuk: "21:00",
    jadwalKeluar: "06:00",
    checkIn: "-",
    checkOut: "-",
    durasi: "0j",
    durasiColor: "gray",
    keterlambatan: "-",
    status: "Mangkir",
    petugasAudit: "Dedi Kurniawan",
  },
  {
    id: "13",
    tanggal: "26 Jul 2026",
    nik: "PET-2024-011",
    nama: "Fitriani",
    gudang: "Gudang",
    shift: "Shift Pagi (A)",
    jadwalMasuk: "08:00",
    jadwalKeluar: "17:00",
    checkIn: "-",
    checkOut: "-",
    durasi: "0j",
    durasiColor: "gray",
    keterlambatan: "-",
    status: "Izin / Cuti",
    petugasAudit: "Ahmad Fauzi",
  },
  {
    id: "14",
    tanggal: "26 Jul 2026",
    nik: "PET-2024-013",
    nama: "Bambang Pamungkas",
    gudang: "Gudang",
    shift: "Shift Siang (B)",
    jadwalMasuk: "13:00",
    jadwalKeluar: "21:00",
    checkIn: "12:50",
    checkOut: "21:03",
    durasi: "8j 13m",
    durasiColor: "red",
    keterlambatan: "0m",
    status: "Hadir",
    petugasAudit: "Rian Hidayat",
  },
  {
    id: "15",
    tanggal: "26 Jul 2026",
    nik: "PET-2024-014",
    nama: "Dewi Sartika",
    gudang: "Gudang",
    shift: "Shift Malam (C)",
    jadwalMasuk: "21:00",
    jadwalKeluar: "06:00",
    checkIn: "20:55",
    checkOut: "06:05",
    durasi: "9j 10m",
    durasiColor: "red",
    keterlambatan: "0m",
    status: "Hadir",
    petugasAudit: "Budi Santoso",
  },
  {
    id: "16",
    tanggal: "25 Jul 2026",
    nik: "PET-2024-015",
    nama: "Anton Wibowo",
    gudang: "Gudang",
    shift: "Shift Pagi (A)",
    jadwalMasuk: "08:00",
    jadwalKeluar: "17:00",
    checkIn: "08:25",
    checkOut: "17:00",
    durasi: "8j 35m",
    durasiColor: "blue",
    keterlambatan: "25m",
    status: "Terlambat",
    petugasAudit: "Eko Prasetyo",
  },
  {
    id: "17",
    tanggal: "25 Jul 2026",
    nik: "PET-2024-016",
    nama: "Kurniawan",
    gudang: "Gudang",
    shift: "Shift Siang (B)",
    jadwalMasuk: "13:00",
    jadwalKeluar: "21:00",
    checkIn: "12:58",
    checkOut: "21:00",
    durasi: "8j 2m",
    durasiColor: "blue",
    keterlambatan: "0m",
    status: "Hadir",
    petugasAudit: "Ahmad Fauzi",
  },
  {
    id: "18",
    tanggal: "25 Jul 2026",
    nik: "PET-2024-017",
    nama: "Lia Ananta",
    gudang: "Gudang",
    shift: "Shift Malam (C)",
    jadwalMasuk: "21:00",
    jadwalKeluar: "06:00",
    checkIn: "20:50",
    checkOut: "06:00",
    durasi: "9j 10m",
    durasiColor: "red",
    keterlambatan: "0m",
    status: "Hadir",
    petugasAudit: "Dedi Kurniawan",
  },
  {
    id: "19",
    tanggal: "25 Jul 2026",
    nik: "PET-2024-018",
    nama: "Surya Paloh",
    gudang: "Gudang",
    shift: "Shift Pagi (A)",
    jadwalMasuk: "08:00",
    jadwalKeluar: "17:00",
    checkIn: "-",
    checkOut: "-",
    durasi: "0j",
    durasiColor: "gray",
    keterlambatan: "-",
    status: "Izin / Cuti",
    petugasAudit: "Rian Hidayat",
  },
]

export default function RekapPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleStatusChange = (val: string | null) => {
    setStatusFilter(val)
    setCurrentPage(1)
  }

  const filteredData = useMemo(() => {
    return dummyData.filter((row) => {
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        row.nama.toLowerCase().includes(query) ||
        row.nik.toLowerCase().includes(query) ||
        row.shift.toLowerCase().includes(query)

      const matchesStatus =
        !statusFilter || statusFilter === "all" || row.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredData.slice(start, end)
  }, [filteredData, currentPage])

  const renderShiftBadge = (shift: string) => {
    if (shift.includes("Pagi")) {
      return <ColoredBadge color="sky">{shift}</ColoredBadge>
    }
    if (shift.includes("Siang")) {
      return <ColoredBadge color="yellow">{shift}</ColoredBadge>
    }
    return <ColoredBadge color="purple">{shift}</ColoredBadge>
  }

  const renderStatusBadge = (
    status: "Hadir" | "Terlambat" | "Izin / Cuti" | "Mangkir"
  ) => {
    switch (status) {
      case "Hadir":
        return <ColoredBadge color="green">Hadir</ColoredBadge>
      case "Terlambat":
        return <ColoredBadge color="yellow">Terlambat</ColoredBadge>
      case "Izin / Cuti":
        return <ColoredBadge color="purple">Izin / Cuti</ColoredBadge>
      case "Mangkir":
        return <ColoredBadge color="red">Mangkir</ColoredBadge>
      default:
        return null
    }
  }

  const renderDurasiText = (durasi: string, color: "red" | "blue" | "gray") => {
    let textColor = "text-foreground"
    if (color === "red") {
      textColor = "text-[#DC2626]"
    } else if (color === "blue") {
      textColor = "text-[#2563EB]"
    } else if (color === "gray") {
      textColor = "text-muted-foreground"
    }
    return (
      <span className={cn("font-sans text-sm font-semibold", textColor)}>
        {durasi}
      </span>
    )
  }

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const renderPaginationButtons = () => {
    const buttons = []
    for (let i = 1; i <= totalPages; i++) {
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
              124
            </span>
            <span className="text-xs font-semibold text-muted-foreground/70">
              Sesi / Periode Ini
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-muted-foreground/60">
            Total 24 Petugas Aktif Gudang
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
              94.3%
            </span>
            <span className="text-xs font-semibold text-muted-foreground/70">
              117 Sesi
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
              5
            </span>
            <span className="text-xs font-semibold text-muted-foreground/70">
              Sesi (4.0%)
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-muted-foreground/60">
            Rata-rata Keterlambatan: 14 Menit
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
              2
            </span>
            <span className="text-xs font-semibold text-muted-foreground/70">
              Sesi (1.6%)
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-muted-foreground/60">
            Tanpa Catatan Cuti atau Izin
          </div>
        </div>
      </div>

      {/* ─── FILTER ─── */}
      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari NIK atau nama petugas..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1"
          />
          <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/80 bg-card px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-foreground/80">
            <span>02 Agu 2026</span>
            <BiCalendar className="size-4 text-muted-foreground" />
          </div>
          <Opsion
            placeholder="Semua Status Kehadiran"
            value={statusFilter || ""}
            onValueChange={handleStatusChange}
            options={[
              { value: "all", label: "Semua Status Kehadiran" },
              { value: "Hadir", label: "Hadir" },
              { value: "Terlambat", label: "Terlambat" },
              { value: "Izin / Cuti", label: "Izin / Cuti" },
              { value: "Mangkir", label: "Mangkir" },
            ]}
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
                {paginatedData.map((row) => (
                  <TableRow
                    key={row.id}
                    className="h-16 border-b border-border/40 hover:bg-muted/30"
                  >
                    <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                      {row.tanggal}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      <ColoredBadge color="gray">{row.nik}</ColoredBadge>
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.nama}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground/80">
                      {row.gudang}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap">
                      {renderShiftBadge(row.shift)}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                      {row.jadwalMasuk}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                      {row.jadwalKeluar}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                      {row.checkIn}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                      {row.checkOut}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                      {renderDurasiText(row.durasi, row.durasiColor)}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                      <span
                        className={cn(
                          "font-sans text-sm",
                          row.keterlambatan === "0m" ||
                            row.keterlambatan === "-"
                            ? "text-muted-foreground"
                            : "text-foreground"
                        )}
                      >
                        {row.keterlambatan}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                      {renderStatusBadge(row.status)}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.petugasAudit}
                    </TableCell>
                    <TableCell className="pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 text-muted-foreground">
                        <span className="mr-1 font-sans text-sm whitespace-nowrap text-foreground">
                          {row.petugasAudit}
                        </span>
                        <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                          <BiChevronRight className="size-4 text-foreground/75" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedData.length < 6 && (
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
            <span>10 per halaman</span>
          </div>
        </div>
      </div>
    
      
    
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Rekap Absensi"
        totalItemsCount={dummyData.length}
        totalItemsLabel="Total Rekap"
        filterLabel="Filter Aktif"
        checkboxes={[
        {
          "id": "nama",
          "label": "Nama & NIP",
          "defaultChecked": true
        },
        {
          "id": "kehadiran",
          "label": "Ringkasan Hadir/Sakit/Izin/Alfa",
          "defaultChecked": true
        },
        {
          "id": "persentase",
          "label": "Persentase Kehadiran",
          "defaultChecked": true
        }
      ]}
      />
    </>
  )
}
