import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { StatusBadge } from "@/components/badge"

import {
  BiPackage,
  BiSolidReport,
  BiChevronRight,
  BiDotsVerticalRounded,
  BiFile,
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

const dummyData = [
  {
    kodeBarang: "BRG-001",
    namaBarang: "Semen Portland 50kg",
    kategori: "Material Bangunan",
    gudang: "Gudang Pusat",
    stok: 500,
    stokMinimal: 100,
    satuan: "Sak",
    status: "disetujui",
    dokumen: "1 File",
  },
  {
    kodeBarang: "BRG-002",
    namaBarang: "Besi Beton 10mm",
    kategori: "Material Bangunan",
    gudang: "Gudang Timur",
    stok: 1200,
    stokMinimal: 200,
    satuan: "Batang",
    status: "menunggu_approval",
    dokumen: "-",
  },
  {
    kodeBarang: "BRG-003",
    namaBarang: "Cat Tembok 5L",
    kategori: "Cat & Finishing",
    gudang: "Gudang Selatan",
    stok: 300,
    stokMinimal: 50,
    satuan: "Kaleng",
    status: "draft",
    dokumen: "-",
  },
  {
    kodeBarang: "BRG-004",
    namaBarang: "Pipa PVC 3 inch",
    kategori: "Pipa & Fitting",
    gudang: "Gudang Pusat",
    stok: 450,
    stokMinimal: 100,
    satuan: "Batang",
    status: "ditolak",
    dokumen: "1 File",
  },
  {
    kodeBarang: "BRG-005",
    namaBarang: "Paku Beton 5cm",
    kategori: "Material Bangunan",
    gudang: "Gudang Timur",
    stok: 2500,
    stokMinimal: 500,
    satuan: "Kg",
    status: "disetujui",
    dokumen: "1 File",
  },
  {
    kodeBarang: "BRG-006",
    namaBarang: "Kabel NYM 2x1.5",
    kategori: "Elektrikal",
    gudang: "Gudang Pusat",
    stok: 180,
    stokMinimal: 50,
    satuan: "Meter",
    status: "menunggu_approval",
    dokumen: "-",
  },
] as const

export default function StokPage() {
  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Inventory" },
              { label: "Stok" },
            ]}
            title="Stok"
            icon={BiPackage}
            description="Kelola data stok barang dan pantau ketersediaan inventory."
          />
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline-black">
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
            <Button variant="default">+ Tambah Barang</Button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch placeholder="Cari barang..." className="flex-1" />
          <Opsion
            options={[
              { value: "all", label: "Semua Gudang" },
              { value: "1", label: "Gudang Pusat" },
              { value: "2", label: "Gudang Timur" },
              { value: "3", label: "Gudang Selatan" },
            ]}
          />
          <Opsion
            placeholder="Semua Kategori"
            options={[
              { value: "all", label: "Semua Kategori" },
              { value: "material", label: "Material Bangunan" },
              { value: "cat", label: "Cat & Finishing" },
              { value: "pipa", label: "Pipa & Fitting" },
              { value: "elektrikal", label: "Elektrikal" },
            ]}
          />
        </div>
      </div>

      <div className="wrapper mt-[25px]">
        <Table>
          <TableHeader className="bg-white border-b border-border/60">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold text-foreground normal-case tracking-normal">
                Kode Barang
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Nama Barang
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Kategori
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Gudang
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Stok
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Stok Minimal
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Satuan
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal text-center">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal text-center">
                Dokumen
              </TableHead>
              <TableHead className="pr-6 text-xs font-semibold text-foreground normal-case tracking-normal text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="min-h-[300px]">
            {dummyData.map((row) => (
              <TableRow
                key={row.kodeBarang}
                className="h-16 hover:bg-muted/30 border-b border-border/40"
              >
                <TableCell className="pl-6 text-sm font-sans text-foreground">
                  {row.kodeBarang}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground">
                  {row.namaBarang}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground">
                  {row.kategori}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground">
                  {row.gudang}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground">
                  {row.stok.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground">
                  {row.stokMinimal.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground">
                  {row.satuan}
                </TableCell>
                <TableCell className="text-sm font-sans text-center">
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-sm font-sans text-center">
                  {row.dokumen !== "-" ? (
                    <span className="inline-flex items-center gap-0.5 border border-border/80 rounded-[4px] px-1.5 py-0.5 bg-card hover:bg-accent/10 transition-colors text-[11px] leading-none cursor-pointer text-muted-foreground whitespace-nowrap">
                      <BiFile className="size-3 text-muted-foreground/80" />
                      <span>{row.dokumen}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-sans">-</span>
                  )}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <div className="flex items-center justify-end gap-1 text-muted-foreground">
                    <button className="p-1 hover:bg-muted rounded-md transition-colors cursor-pointer">
                      <BiChevronRight className="size-4 text-foreground/75" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded-md transition-colors cursor-pointer">
                      <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={10} className="p-0 align-middle">
                <div className="bg-white h-14 px-6 flex items-center justify-between text-xs text-muted-foreground font-sans">
                  <span>Menampilkan 1-6 dari 24 data</span>
                  <div className="flex items-center">
                    <div className="flex items-center border border-border/80 rounded-lg overflow-hidden bg-background">
                      <button className="h-8 w-8 flex items-center justify-center hover:bg-muted text-muted-foreground border-r border-border/80 transition-colors cursor-pointer">
                        &lt;
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center bg-muted/60 text-foreground font-medium border-r border-border/80 transition-colors cursor-pointer">
                        1
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center hover:bg-muted text-muted-foreground border-r border-border/80 transition-colors cursor-pointer">
                        2
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center hover:bg-muted text-muted-foreground border-r border-border/80 transition-colors cursor-pointer">
                        3
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center hover:bg-muted text-muted-foreground border-r border-border/80 transition-colors cursor-pointer">
                        4
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
                        &gt;
                      </button>
                    </div>
                  </div>
                  <span>10 per halaman</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </>
  )
}
