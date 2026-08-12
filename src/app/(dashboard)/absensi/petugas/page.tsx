"use client"

import { ExportModal } from "@/components/export-modal"
import { useState, useMemo } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import {
  BiUser,
  BiUserPlus,
  BiDownload,
  BiDotsVerticalRounded,
  BiChevronRight,
} from "react-icons/bi"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { PetugasForm } from "@/components/petugas/petugas-form"

interface PetugasGudang {
  id: string
  kodePegawai: string
  tanggungJawab: string
  namaLengkap: string
  areaKerja: string
  nomorTelepon: string
  tanggalBergabung: string
  statusOperasional: "Aktif" | "Cuti" | "Non-Aktif"
}

const initialData: PetugasGudang[] = [
  {
    id: "1",
    kodePegawai: "PG-001",
    tanggungJawab: "Operator Forklift",
    namaLengkap: "Ahmad Fauzi",
    areaKerja: "Area Inbound - Rak A",
    nomorTelepon: "0812-3456-7890",
    tanggalBergabung: "12 Jan 2024",
    statusOperasional: "Aktif",
  },
  {
    id: "2",
    kodePegawai: "PG-002",
    tanggungJawab: "Admin Inbound",
    namaLengkap: "Budi Santoso",
    areaKerja: "Meja Penerimaan Barang",
    nomorTelepon: "0813-9876-5432",
    tanggalBergabung: "05 Mar 2024",
    statusOperasional: "Aktif",
  },
  {
    id: "3",
    kodePegawai: "PG-003",
    tanggungJawab: "Packer Outbound",
    namaLengkap: "Dedi Kurniawan",
    areaKerja: "Area Packing 2",
    nomorTelepon: "0857-1122-3344",
    tanggalBergabung: "10 Agu 2024",
    statusOperasional: "Cuti",
  },
  {
    id: "4",
    kodePegawai: "PG-004",
    tanggungJawab: "Staff Quality Control",
    namaLengkap: "Eko Prasetyo",
    areaKerja: "Area Inspeksi QC",
    nomorTelepon: "0878-5566-7788",
    tanggalBergabung: "01 Nov 2024",
    statusOperasional: "Non-Aktif",
  },
]

export default function DaftarPetugasPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [data] = useState<PetugasGudang[]>(initialData)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const itemsPerPage = 10

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const query = searchQuery.toLowerCase()
      return (
        item.namaLengkap.toLowerCase().includes(query) ||
        item.kodePegawai.toLowerCase().includes(query) ||
        item.tanggungJawab.toLowerCase().includes(query) ||
        item.areaKerja.toLowerCase().includes(query)
      )
    })
  }, [data, searchQuery])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredData.slice(start, start + itemsPerPage)
  }, [filteredData, currentPage])

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const renderStatusBadge = (status: PetugasGudang["statusOperasional"]) => {
    switch (status) {
      case "Aktif":
        return <ColoredBadge color="green">Aktif</ColoredBadge>
      case "Cuti":
        return <ColoredBadge color="yellow">Cuti</ColoredBadge>
      case "Non-Aktif":
        return <ColoredBadge color="gray">Non-Aktif</ColoredBadge>
    }
  }

  const renderPaginationButtons = () => {
    const buttons = []
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 font-medium transition-colors last:border-r-0 ${
            currentPage === i
              ? "bg-muted/60 text-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {i}
        </button>
      )
    }
    return buttons
  }

  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "SDM & Kehadiran" },
              { label: "Daftar Petugas Gudang" },
            ]}
            title="Daftar Petugas Gudang"
            icon={BiUser}
            description="Kelola data karyawan dan status operasional."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiDownload className="mr-2" />
              Export (.excel/.pdf)
            </Button>
            <Button variant="default" onClick={() => setDrawerOpen(true)}>
              <BiUserPlus className="mr-2" />
              Tambah Petugas
            </Button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari nama, kode petugas, atau area..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="flex-1"
          />
        </div>
      </div>

      <div className="wrapper mt-[25px]">
        <div className="rounded-[15px] border border-zinc-200 bg-white shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="border-b border-border/60 bg-white">
              <TableRow className="h-14 hover:bg-transparent">
                <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                  Kode Pegawai
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                  Tanggung Jawab
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                  Nama Lengkap
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                  Area Kerja
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                  Nomor Telepon
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                  Tanggal Bergabung
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                  Status Operasional
                </TableHead>
                <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-16 border-b border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-sans text-sm text-foreground">
                    {row.kodePegawai}
                  </TableCell>
                  <TableCell className="font-sans text-sm">
                    <ColoredBadge color="gray">{row.tanggungJawab}</ColoredBadge>
                  </TableCell>
                  <TableCell className="font-sans text-sm whitespace-nowrap text-foreground font-medium">
                    {row.namaLengkap}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.areaKerja}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.nomorTelepon}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.tanggalBergabung}
                  </TableCell>
                  <TableCell className="font-sans text-sm">
                    {renderStatusBadge(row.statusOperasional)}
                  </TableCell>
                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                        <BiChevronRight className="size-4 text-foreground/75" />
                      </button>
                      <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                        <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                    Tidak ada data petugas ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
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
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
            <span>10 per halaman</span>
          </div>
        </div>
      </div>

      <PetugasForm open={drawerOpen} onOpenChange={setDrawerOpen} />
    
      
    
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Daftar Petugas"
        totalItemsCount={initialData.length}
        totalItemsLabel="Total Petugas"
        filterLabel="Filter Aktif"
        checkboxes={[
        {
          "id": "nama",
          "label": "Nama & NIP",
          "defaultChecked": true
        },
        {
          "id": "kontak",
          "label": "Informasi Kontak",
          "defaultChecked": true
        },
        {
          "id": "status",
          "label": "Status Keaktifan",
          "defaultChecked": true
        }
      ]}
      />
    </>
  )
}
