"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import {
  BiClipboard,
  BiSolidReport,
  BiCheckCircle,
  BiTimeFive,
  BiCalendar,
  BiShow,
  BiPlay,
} from "react-icons/bi"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface OpnameItem {
  id: string
  noDokumen: string
  tanggal: string
  tanggalLabel: string
  lokasi: string
  scope: string
  totalSku: string
  varianceVal: string
  varianceType: "red" | "green" | "orange" | "none"
  petugas: string
  status: "Dalam Proses" | "Selesai" | "Draft"
  aksiType: "lanjutkan" | "detail" | "mulai"
}

const dummyData: OpnameItem[] = [
  {
    id: "1",
    noDokumen: "SO-202608-001",
    tanggal: "05 Agu 2026",
    tanggalLabel: "05 Agu 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Semua Item",
    totalSku: "6 SKU",
    varianceVal: "4 SKU (-2.4M)",
    varianceType: "red",
    petugas: "Budi Santoso",
    status: "Dalam Proses",
    aksiType: "lanjutkan",
  },
  {
    id: "2",
    noDokumen: "SO-202608-002",
    tanggal: "04 Agu 2026",
    tanggalLabel: "04 Agu 2026",
    lokasi: "Gudang Bahan Baku (GDG-02)",
    scope: "Rak C1 - C4",
    totalSku: "42 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Ahmad Dahlan",
    status: "Dalam Proses",
    aksiType: "lanjutkan",
  },
  {
    id: "3",
    noDokumen: "SO-202607-010",
    tanggal: "31 Jul 2026",
    tanggalLabel: "31 Jul 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Kategori Semen",
    totalSku: "18 SKU",
    varianceVal: "1 SKU (+150k)",
    varianceType: "orange",
    petugas: "Rina Wijaya",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "4",
    noDokumen: "SO-202607-009",
    tanggal: "25 Jul 2026",
    tanggalLabel: "25 Jul 2026",
    lokasi: "Gudang Transit (GDG-03)",
    scope: "Semua Item",
    totalSku: "110 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Budi Santoso",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "5",
    noDokumen: "SO-202608-003",
    tanggal: "08 Agu 2026",
    tanggalLabel: "08 Agu 2026 (Plan)",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Perkakas & Tools",
    totalSku: "25 SKU",
    varianceVal: "Belum Audit",
    varianceType: "none",
    petugas: "Siti Rahma",
    status: "Draft",
    aksiType: "mulai",
  },
  {
    id: "6",
    noDokumen: "SO-202607-008",
    tanggal: "22 Jul 2026",
    tanggalLabel: "22 Jul 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Semua Item",
    totalSku: "30 SKU",
    varianceVal: "2 SKU (-450k)",
    varianceType: "red",
    petugas: "Rina Wijaya",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "7",
    noDokumen: "SO-202607-007",
    tanggal: "18 Jul 2026",
    tanggalLabel: "18 Jul 2026",
    lokasi: "Gudang Transit (GDG-03)",
    scope: "Rak A1 - A5",
    totalSku: "15 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Ahmad Dahlan",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "8",
    noDokumen: "SO-202607-006",
    tanggal: "15 Jul 2026",
    tanggalLabel: "15 Jul 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Kategori Cat",
    totalSku: "12 SKU",
    varianceVal: "1 SKU (+90k)",
    varianceType: "orange",
    petugas: "Budi Santoso",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "9",
    noDokumen: "SO-202607-005",
    tanggal: "10 Jul 2026",
    tanggalLabel: "10 Jul 2026",
    lokasi: "Gudang Bahan Baku (GDG-02)",
    scope: "Semua Item",
    totalSku: "85 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Siti Rahma",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "10",
    noDokumen: "SO-202607-004",
    tanggal: "08 Jul 2026",
    tanggalLabel: "08 Jul 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Rak B1 - B4",
    totalSku: "50 SKU",
    varianceVal: "3 SKU (-1.2M)",
    varianceType: "red",
    petugas: "Budi Santoso",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "11",
    noDokumen: "SO-202607-003",
    tanggal: "05 Jul 2026",
    tanggalLabel: "05 Jul 2026",
    lokasi: "Gudang Transit (GDG-03)",
    scope: "Semua Item",
    totalSku: "95 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Rina Wijaya",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "12",
    noDokumen: "SO-202607-002",
    tanggal: "02 Jul 2026",
    tanggalLabel: "02 Jul 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Kategori Besi",
    totalSku: "40 SKU",
    varianceVal: "2 SKU (+1.8M)",
    varianceType: "orange",
    petugas: "Ahmad Dahlan",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "13",
    noDokumen: "SO-202607-001",
    tanggal: "01 Jul 2026",
    tanggalLabel: "01 Jul 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Semua Item",
    totalSku: "200 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Budi Santoso",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "14",
    noDokumen: "SO-202606-012",
    tanggal: "28 Jun 2026",
    tanggalLabel: "28 Jun 2026",
    lokasi: "Gudang Bahan Baku (GDG-02)",
    scope: "Rak D1 - D3",
    totalSku: "60 SKU",
    varianceVal: "1 SKU (-200k)",
    varianceType: "red",
    petugas: "Siti Rahma",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "15",
    noDokumen: "SO-202606-011",
    tanggal: "25 Jun 2026",
    tanggalLabel: "25 Jun 2026",
    lokasi: "Gudang Transit (GDG-03)",
    scope: "Semua Item",
    totalSku: "75 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Budi Santoso",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "16",
    noDokumen: "SO-202606-010",
    tanggal: "20 Jun 2026",
    tanggalLabel: "20 Jun 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Kategori Kabel",
    totalSku: "18 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Rina Wijaya",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "17",
    noDokumen: "SO-202606-009",
    tanggal: "15 Jun 2026",
    tanggalLabel: "15 Jun 2026",
    lokasi: "Gudang Bahan Baku (GDG-02)",
    scope: "Semua Item",
    totalSku: "90 SKU",
    varianceVal: "2 SKU (-800k)",
    varianceType: "red",
    petugas: "Ahmad Dahlan",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "18",
    noDokumen: "SO-202606-008",
    tanggal: "12 Jun 2026",
    tanggalLabel: "12 Jun 2026",
    lokasi: "Gudang Transit (GDG-03)",
    scope: "Rak E1 - E4",
    totalSku: "35 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Siti Rahma",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "19",
    noDokumen: "SO-202606-007",
    tanggal: "10 Jun 2026",
    tanggalLabel: "10 Jun 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Semua Item",
    totalSku: "120 SKU",
    varianceVal: "4 SKU (+500k)",
    varianceType: "orange",
    petugas: "Budi Santoso",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "20",
    noDokumen: "SO-202606-006",
    tanggal: "08 Jun 2026",
    tanggalLabel: "08 Jun 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Kategori Pipa",
    totalSku: "25 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Rina Wijaya",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "21",
    noDokumen: "SO-202606-005",
    tanggal: "05 Jun 2026",
    tanggalLabel: "05 Jun 2026",
    lokasi: "Gudang Bahan Baku (GDG-02)",
    scope: "Semua Item",
    totalSku: "150 SKU",
    varianceVal: "1 SKU (-350k)",
    varianceType: "red",
    petugas: "Ahmad Dahlan",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "22",
    noDokumen: "SO-202606-004",
    tanggal: "02 Jun 2026",
    tanggalLabel: "02 Jun 2026",
    lokasi: "Gudang Transit (GDG-03)",
    scope: "Rak F1 - F4",
    totalSku: "40 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Siti Rahma",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "23",
    noDokumen: "SO-202606-003",
    tanggal: "01 Jun 2026",
    tanggalLabel: "01 Jun 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Semua Item",
    totalSku: "180 SKU",
    varianceVal: "2 SKU (+1.2M)",
    varianceType: "orange",
    petugas: "Budi Santoso",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "24",
    noDokumen: "SO-202605-010",
    tanggal: "28 Mei 2026",
    tanggalLabel: "28 Mei 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Kategori Paku",
    totalSku: "30 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Rina Wijaya",
    status: "Selesai",
    aksiType: "detail",
  },
]

export default function OpnamePage() {
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
        row.noDokumen.toLowerCase().includes(query) ||
        row.lokasi.toLowerCase().includes(query) ||
        row.petugas.toLowerCase().includes(query) ||
        row.scope.toLowerCase().includes(query)

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

  const renderStatusBadge = (status: "Dalam Proses" | "Selesai" | "Draft") => {
    switch (status) {
      case "Dalam Proses":
        return (
          <span className="inline-flex items-center rounded-[6px] border border-[#FEF3C7] bg-[#FEF3C7] px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-[#D97706]">
            Dalam Proses
          </span>
        )
      case "Selesai":
        return (
          <span className="inline-flex items-center rounded-[6px] border border-[#E2FBE9] bg-[#E2FBE9] px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-[#1E824C]">
            Selesai
          </span>
        )
      case "Draft":
        return (
          <span className="inline-flex items-center rounded-[6px] border border-[#F3F4F6] bg-[#F3F4F6] px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-[#4B5563]">
            Draft
          </span>
        )
      default:
        return null
    }
  }

  const renderVarianceBadge = (
    val: string,
    type: "red" | "green" | "orange" | "none"
  ) => {
    switch (type) {
      case "red":
        return (
          <span className="inline-flex items-center rounded-[6px] border border-[#FEE2E2] bg-[#FEE2E2] px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-[#DC2626]">
            {val}
          </span>
        )
      case "green":
        return (
          <span className="inline-flex items-center rounded-[6px] border border-[#E2FBE9] bg-[#E2FBE9] px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-[#1E824C]">
            {val}
          </span>
        )
      case "orange":
        return (
          <span className="inline-flex items-center rounded-[6px] border border-[#FEF3C7] bg-[#FEF3C7] px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-[#D97706]">
            {val}
          </span>
        )
      case "none":
      default:
        return (
          <span className="font-sans text-sm whitespace-nowrap text-muted-foreground">
            {val}
          </span>
        )
    }
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
            items={[{ label: "Aktivitas Gudang" }, { label: "Stok Opname" }]}
            title="Stok Opname"
            icon={BiClipboard}
            description="Cocokkan stok sistem dengan stok fisik aktual."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black">
              <BiSolidReport className="mr-2" />
              Export (.excel/.pdf)
            </Button>
            <Button variant="default">+ Opname Baru</Button>
          </div>
        </div>
      </div>

      {/* ─── STATS CARDS ─── */}
      <div className="wrapper mt-[35px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Sesi Bulan Ini */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <BiClipboard className="size-4 text-slate-500" />
            <span>Total Sesi Bulan Ini</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              12
            </span>
            <span className="text-xs font-semibold text-slate-400">Sesi</span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-400">
            Audit rutin & insidental
          </div>
        </div>

        {/* Card 2: Dalam Proses Audit */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <BiTimeFive className="size-4 text-amber-600" />
            <span>Dalam Proses Audit</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#D97706]">
              2
            </span>
            <span className="text-xs font-semibold text-[#D97706]/85">
              Sesi
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-400">
            Sedang dihitung auditor
          </div>
        </div>

        {/* Card 3: Selesai (Completed) */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <BiCheckCircle className="size-4 text-emerald-600" />
            <span>Selesai (Completed)</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#1E824C]">
              9
            </span>
            <span className="text-xs font-semibold text-[#1E824C]/85">
              Sesi
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-400">
            Sudah diapprove & diadjust
          </div>
        </div>

        {/* Card 4: Akurasi Stok Rata-rata */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <BiClipboard className="size-4 text-blue-600" />
            <span>Akurasi Stok Rata-rata</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              98.4%
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-emerald-600">
            +0.6% dari bulan lalu
          </div>
        </div>
      </div>

      {/* ─── FILTER ─── */}
      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari NIK, nama, atau nomor HP..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1"
          />
          <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/80 bg-card px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-foreground/80">
            <span>02 Agu 2026</span>
            <BiCalendar className="size-4 text-muted-foreground" />
          </div>
          <Opsion
            placeholder="Semua Status Selisih"
            value={statusFilter || undefined}
            onValueChange={handleStatusChange}
            options={[
              { value: "all", label: "Semua Status Selisih" },
              { value: "Dalam Proses", label: "Dalam Proses" },
              { value: "Selesai", label: "Selesai" },
              { value: "Draft", label: "Draft" },
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
                    No. Dokumen Audit
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Tanggal Audit
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Lokasi Gudang
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Cakupan (Scope)
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Total SKU
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Variance (Selisih)
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Petugas Audit
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Status
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
                      {row.noDokumen}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.tanggalLabel}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.lokasi}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap">
                      <span className="inline-flex items-center rounded-[6px] border border-border/80 bg-muted/40 px-2.5 py-0.5 text-[11px] font-semibold text-[#4B5563]">
                        {row.scope}
                      </span>
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.totalSku}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                      {renderVarianceBadge(row.varianceVal, row.varianceType)}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.petugas}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                      {renderStatusBadge(row.status)}
                    </TableCell>
                    <TableCell className="pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        {row.aksiType === "lanjutkan" && (
                          <button className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] bg-[#18181B] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-black/90">
                            <span>Lanjutkan</span>
                            <span className="text-sm font-light">→</span>
                          </button>
                        )}
                        {row.aksiType === "detail" && (
                          <button className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] border border-border bg-card px-3.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground">
                            <BiShow className="size-4 text-muted-foreground/90" />
                            <span>Detail</span>
                          </button>
                        )}
                        {row.aksiType === "mulai" && (
                          <button className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] border border-border bg-card px-3.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground">
                            <BiPlay className="size-4 text-muted-foreground/90" />
                            <span>Mulai Audit</span>
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedData.length < 6 && (
                  <TableRow
                    style={{ height: `${(6 - paginatedData.length) * 64}px` }}
                    className="pointer-events-none border-none hover:bg-transparent"
                  >
                    <TableCell colSpan={9} className="border-none p-0" />
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
    </>
  )
}
