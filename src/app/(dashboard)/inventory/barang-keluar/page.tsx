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
    noReferensi: "BK-2026070001",
    penerima: "Bagian Produksi",
    barang: "Semen Portland 50kg",
    qty: 50,
    gudang: "Gudang Pusat",
    tanggal: "20 Jul 2026",
    dibuatOleh: "Andi Wijaya",
    status: "disetujui",
    dokumen: "1 File",
  },
  {
    noReferensi: "BK-2026070002",
    penerima: "Proyek Jembatan",
    barang: "Besi Beton 10mm",
    qty: 150,
    gudang: "Gudang Timur",
    tanggal: "21 Jul 2026",
    dibuatOleh: "Rina Sari",
    status: "menunggu_approval",
    dokumen: "-",
  },
  {
    noReferensi: "BK-2026070003",
    penerima: "Bagian Marketing",
    barang: "Cat Tembok 5L",
    qty: 20,
    gudang: "Gudang Selatan",
    tanggal: "22 Jul 2026",
    dibuatOleh: "Budi Hartono",
    status: "draft",
    dokumen: "-",
  },
  {
    noReferensi: "BK-2026070004",
    penerima: "Proyek Perumahan",
    barang: "Pipa PVC 3 inch",
    qty: 60,
    gudang: "Gudang Pusat",
    tanggal: "23 Jul 2026",
    dibuatOleh: "Andi Wijaya",
    status: "ditolak",
    dokumen: "1 File",
  },
  {
    noReferensi: "BK-2026070005",
    penerima: "Bagian Produksi",
    barang: "Paku Beton 5cm",
    qty: 300,
    gudang: "Gudang Timur",
    tanggal: "24 Jul 2026",
    dibuatOleh: "Rina Sari",
    status: "disetujui",
    dokumen: "2 File",
  },
  {
    noReferensi: "BK-2026070006",
    penerima: "Proyek Gedung",
    barang: "Kabel NYM 2x1.5",
    qty: 10,
    gudang: "Gudang Pusat",
    tanggal: "25 Jul 2026",
    dibuatOleh: "Budi Hartono",
    status: "menunggu_approval",
    dokumen: "1 File",
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
              { label: "Inventory" },
              { label: "Barang Keluar" },
            ]}
            title="Barang Keluar"
            icon={BiUpArrowCircle}
            description="Catat pengeluaran stok barang dari gudang."
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

      <div className="wrapper mt-[25px]">
        <Table>
          <TableHeader className="bg-white border-b border-border/60">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold text-foreground normal-case tracking-normal">
                No. referensi
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Barang
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Penerima
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Qty
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Gudang
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Tanggal
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">
                Dibuat oleh
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
                <TableCell className="pl-6 text-sm font-sans text-foreground">
                  {row.noReferensi}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground">
                  {row.barang}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground">
                  {row.penerima}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground">
                  {row.qty}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground">
                  {row.gudang}
                </TableCell>
                <TableCell className="text-sm font-sans text-muted-foreground">
                  {row.tanggal}
                </TableCell>
                <TableCell className="text-sm font-sans text-foreground">
                  {row.dibuatOleh}
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
