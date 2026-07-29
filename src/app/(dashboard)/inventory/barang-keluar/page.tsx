import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { StatusBadge } from "@/components/badge"

import {
  BiUpArrowCircle,
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
    noReferensi: "BK-2026070014",
    gudangTujuan: "Gudang Pusat",
    customer: "Toko Bangunan Jaya",
    tanggal: "18 Jul 2026",
    totalItem: "5 SKU",
    dibuatOleh: "Andi Wijaya",
    status: "disetujui",
    dokumen: "2 File",
  },
  {
    noReferensi: "BK-2026070017",
    gudangTujuan: "Gudang Pusat",
    customer: "CV Mitra Konstruksi",
    tanggal: "19 Jul 2026",
    totalItem: "2 SKU",
    dibuatOleh: "Rina Sari",
    status: "menunggu_approval",
    dokumen: "1 File",
  },
  {
    noReferensi: "BK-2026070019",
    gudangTujuan: "Gudang Pusat",
    customer: "Toko Bangunan Jaya",
    tanggal: "20 Jul 2026",
    totalItem: "4 SKU",
    dibuatOleh: "Andi Wijaya",
    status: "draft",
    dokumen: "-",
  },
  {
    noReferensi: "BK-2026070021",
    gudangTujuan: "Gudang Pusat",
    customer: "PT Graha Sentosa",
    tanggal: "22 Jul 2026",
    totalItem: "6 SKU",
    dibuatOleh: "Budi Hartono",
    status: "ditolak",
    dokumen: "1 File",
  },
  {
    noReferensi: "BK-2026070023",
    gudangTujuan: "Gudang Timur",
    customer: "CV Mitra Konstruksi",
    tanggal: "23 Jul 2026",
    totalItem: "3 SKU",
    dibuatOleh: "Rina Sari",
    status: "disetujui",
    dokumen: "1 File",
  },
  {
    noReferensi: "BK-2026070025",
    gudangTujuan: "Gudang Selatan",
    customer: "Toko Bangunan Jaya",
    tanggal: "24 Jul 2026",
    totalItem: "9 SKU",
    dibuatOleh: "Budi Hartono",
    status: "menunggu_approval",
    dokumen: "-",
  },
] as const

export default function BarangKeluarPage() {
  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Aktivitas Gudang" },
              { label: "Keluar Barang (Out)" },
            ]}
            title="Keluar Barang (Out)"
            icon={BiUpArrowCircle}
            description="Catat pengeluaran stok barang keluar dari gudang.."
          />
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline-black">
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
            <Button variant="default">+ Barang Keluar Baru</Button>
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
            placeholder="Semua Status"
            options={[
              { value: "all", label: "Semua Status" },
              { value: "disetujui", label: "Disetujui" },
              { value: "menunggu", label: "Menunggu Approval" },
              { value: "ditolak", label: "Ditolak" },
              { value: "draft", label: "Draft" },
            ]}
          />
        </div>
      </div>

      <div className="wrapper mt-[25px] min-w-0">
        <Table>
          <TableHeader className="bg-white border-b border-border/60">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold text-foreground normal-case tracking-normal">
                No. referensi
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Gudang Tujuan
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Customer
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Tanggal
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Total Item
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Dibuat Oleh
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
                key={row.noReferensi}
                className="h-16 hover:bg-muted/30 border-b border-border/40"
              >
                <TableCell className="pl-6 text-sm font-sans text-foreground whitespace-nowrap">
                  {row.noReferensi}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground">
                  {row.gudangTujuan}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground">
                  {row.customer}
                </TableCell>
                <TableCell className="text-sm font-sans text-muted-foreground whitespace-nowrap">
                  {row.tanggal}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground whitespace-nowrap">
                  {row.totalItem}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground whitespace-nowrap">
                  {row.dibuatOleh}
                </TableCell>
                <TableCell className="text-sm font-sans text-center whitespace-nowrap">
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-sm font-sans text-center whitespace-nowrap">
                  {row.dokumen !== "-" ? (
                    <span className="inline-flex items-center gap-0.5 border border-border/80 rounded-[4px] px-1.5 py-0.5 bg-card hover:bg-accent/10 transition-colors text-[11px] leading-none cursor-pointer text-muted-foreground whitespace-nowrap">
                      <BiFile className="size-3 text-muted-foreground/80" />
                      <span>{row.dokumen}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-sans whitespace-nowrap">-</span>
                  )}
                </TableCell>
                <TableCell className="pr-6 text-right whitespace-nowrap">
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
              <TableCell colSpan={9} className="p-0 align-middle">
                <div className="bg-white h-14 px-6 flex items-center justify-between text-xs text-muted-foreground font-sans">
                  <span>Menampilkan 1-6 dari 19 data</span>
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
