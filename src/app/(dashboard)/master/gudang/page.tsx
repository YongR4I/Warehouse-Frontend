"use client"

import { ExportModal } from "@/components/export-modal"
import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Opsion } from "@/components/opsion"
import {
  BiBuildings,
  BiChevronRight,
  BiDotsVerticalRounded,
  BiSolidReport,
  BiShow,
  BiEditAlt,
  BiTrash,
} from "react-icons/bi"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import { GudangForm } from "@/components/gudang/gudang-form"
import { RakForm } from "@/components/gudang/rak-form"

interface WarehouseItem {
  kode: string
  nama: string
  alamat: string
  penanggungJawab: string
  status: "aktif" | "nonaktif"
}

interface RackItem {
  kodeRak: string
  gudang: string
  baris: string
  level: string
  keterangan: string
}

const gudangData: WarehouseItem[] = [
  {
    kode: "GDG-001",
    nama: "Gudang Utama (Pusat)",
    alamat: "Jl. Industri No. 45, Jakarta Barat",
    penanggungJawab: "Ahmad Subagja",
    status: "aktif",
  },
  {
    kode: "GDG-002",
    nama: "Gudang Transit",
    alamat: "Kawasan Logistik Blok B3, Cikarang",
    penanggungJawab: "Budi Santoso",
    status: "aktif",
  },
  {
    kode: "GDG-003",
    nama: "Gudang Area Timur",
    alamat: "Jl. Rungkut Industri III No. 12, Surabaya",
    penanggungJawab: "Hendra Wijaya",
    status: "nonaktif",
  },
]

const rakData: RackItem[] = [
  {
    kodeRak: "RAK-A1-01",
    gudang: "Gudang Utama (Pusat)",
    baris: "Lorong A1",
    level: "Level 1 (Bawah)",
    keterangan: "Area barang berat (Semen/Besi)",
  },
  {
    kodeRak: "RAK-A1-02",
    gudang: "Gudang Utama (Pusat)",
    baris: "Lorong A1",
    level: "Level 2 (Tengah)",
    keterangan: "Area barang sedang",
  },
  {
    kodeRak: "RAK-B2-01",
    gudang: "Gudang Transit",
    baris: "Lorong B2",
    level: "Level 1 (Bawah)",
    keterangan: "Area penyimpanan sementara",
  },
]

export default function GudangPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [gudangDrawerOpen, setGudangDrawerOpen] = useState(false)
  const [rakDrawerOpen, setRakDrawerOpen] = useState(false)

  const totalGudang = gudangData.length
  const aktifGudang = gudangData.filter((g) => g.status === "aktif").length
  const nonAktifGudang = totalGudang - aktifGudang
  const totalRak = rakData.length

  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[{ label: "Data Master" }, { label: "Daftar Gudang & Rak" }]}
            title="Daftar Gudang & Rak"
            icon={BiBuildings}
            description="Kelola data gudang dan lokasi rak."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[35px]">
        <Button variant="default" onClick={() => setGudangDrawerOpen(true)}>
          + Tambah Gudang
        </Button>
      </div>

      <div className="wrapper mt-[15px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Kode
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Nama Gudang
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Alamat / Lokasi
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Penanggung Jawab
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Status
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gudangData.map((row) => (
              <TableRow
                key={row.kode}
                className="h-16 border-b border-border/40 hover:bg-muted/30"
              >
                <TableCell className="pl-6 font-sans text-sm text-foreground">
                  {row.kode}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.nama}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground/80">
                  {row.alamat}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.penanggungJawab}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  <ColoredBadge
                    color={row.status === "aktif" ? "green" : "gray"}
                  >
                    {row.status === "aktif" ? "Aktif" : "Non-Aktif"}
                  </ColoredBadge>
                </TableCell>
                <TableCell className="pr-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1 text-muted-foreground">
                    <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                      <BiChevronRight className="size-4 text-foreground/75" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted outline-none">
                        <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Aksi Gudang</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <BiShow />
                          <span>Lihat Detail</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setGudangDrawerOpen(true)}>
                          <BiEditAlt />
                          <span>Ubah Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          <BiTrash />
                          <span>Hapus</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Total Gudang: {totalGudang} Gudang ({aktifGudang} Aktif,{" "}
                    {nonAktifGudang} Non-Aktif)
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="wrapper mt-[40px]">
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={() => setRakDrawerOpen(true)}>
            + Tambah Rak
          </Button>
          <Opsion
            placeholder="Semua gudang"
            options={[
              { value: "all", label: "Semua gudang" },
              { value: "1", label: "Gudang Utama (Pusat)" },
              { value: "2", label: "Gudang Transit" },
              { value: "3", label: "Gudang Area Timur" },
            ]}
          />
        </div>
      </div>

      <div className="wrapper mt-[15px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Kode Rak / Bin
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Gudang
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Baris / Aisle
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Level / Tingkat
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Keterangan
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rakData.map((row) => (
              <TableRow
                key={row.kodeRak}
                className="h-16 border-b border-border/40 hover:bg-muted/30"
              >
                <TableCell className="pl-6 font-sans text-sm text-foreground">
                  {row.kodeRak}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.gudang}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.baris}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.level}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground/80">
                  {row.keterangan}
                </TableCell>
                <TableCell className="pr-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1 text-muted-foreground">
                    <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                      <BiChevronRight className="size-4 text-foreground/75" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted outline-none">
                        <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Aksi Rak</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <BiShow />
                          <span>Lihat Detail</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRakDrawerOpen(true)}>
                          <BiEditAlt />
                          <span>Ubah Data</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          <BiTrash />
                          <span>Hapus</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>Total Lokasi Rak: {totalRak} Lokasi Rak / Bin</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <GudangForm open={gudangDrawerOpen} onOpenChange={setGudangDrawerOpen} />
      <RakForm open={rakDrawerOpen} onOpenChange={setRakDrawerOpen} />
    
      
    
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Daftar Gudang"
        totalItemsCount={gudangData.length}
        totalItemsLabel="Total Gudang"
        filterLabel="Filter Aktif"
        checkboxes={[
        {
          "id": "nama",
          "label": "Nama Gudang",
          "defaultChecked": true
        },
        {
          "id": "lokasi",
          "label": "Alamat / Lokasi",
          "defaultChecked": true
        },
        {
          "id": "kapasitas",
          "label": "Kapasitas Unit",
          "defaultChecked": true
        }
      ]}
      />
    </>
  )
}
