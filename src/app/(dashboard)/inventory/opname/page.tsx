import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { StatusBadge } from "@/components/badge"

import {
  BiClipboard,
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
    noReferensi: "OP-2026070001",
    barang: "Semen Portland 50kg",
    gudang: "Gudang Pusat",
    stokSistem: 500,
    stokFisik: 498,
    selisih: -2,
    tanggal: "20 Jul 2026",
    dibuatOleh: "Andi Wijaya",
    status: "disetujui",
    dokumen: "1 File",
  },
  {
    noReferensi: "OP-2026070002",
    barang: "Besi Beton 10mm",
    gudang: "Gudang Timur",
    stokSistem: 1200,
    stokFisik: 1205,
    selisih: 5,
    tanggal: "21 Jul 2026",
    dibuatOleh: "Rina Sari",
    status: "menunggu_approval",
    dokumen: "-",
  },
  {
    noReferensi: "OP-2026070003",
    barang: "Cat Tembok 5L",
    gudang: "Gudang Selatan",
    stokSistem: 300,
    stokFisik: 300,
    selisih: 0,
    tanggal: "22 Jul 2026",
    dibuatOleh: "Budi Hartono",
    status: "draft",
    dokumen: "-",
  },
  {
    noReferensi: "OP-2026070004",
    barang: "Pipa PVC 3 inch",
    gudang: "Gudang Pusat",
    stokSistem: 450,
    stokFisik: 442,
    selisih: -8,
    tanggal: "23 Jul 2026",
    dibuatOleh: "Andi Wijaya",
    status: "ditolak",
    dokumen: "1 File",
  },
  {
    noReferensi: "OP-2026070005",
    barang: "Paku Beton 5cm",
    gudang: "Gudang Timur",
    stokSistem: 2500,
    stokFisik: 2500,
    selisih: 0,
    tanggal: "24 Jul 2026",
    dibuatOleh: "Rina Sari",
    status: "disetujui",
    dokumen: "1 File",
  },
  {
    noReferensi: "OP-2026070006",
    barang: "Kabel NYM 2x1.5",
    gudang: "Gudang Pusat",
    stokSistem: 180,
    stokFisik: 183,
    selisih: 3,
    tanggal: "25 Jul 2026",
    dibuatOleh: "Budi Hartono",
    status: "menunggu_approval",
    dokumen: "-",
  },
] as const

export default function OpnamePage() {
  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Aktivitas Gudang" },
              { label: "Stok Opname" },
            ]}
            title="Stok Opname"
            icon={BiClipboard}
            description="Catat hasil pengecekan stok barang secara berkala."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black">
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
            <Button variant="default">+ Opname Baru</Button>
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
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                No. referensi
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Barang
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Gudang
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Stok Sistem
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Stok Fisik
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Selisih
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Tanggal
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Dibuat oleh
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Status
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Dokumen
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="min-h-[300px]">
            {dummyData.map((row) => (
              <TableRow
                key={row.noReferensi}
                className="h-16 border-b border-border/40 hover:bg-muted/30"
              >
                <TableCell className="pl-6 font-sans text-sm text-foreground">
                  {row.noReferensi}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.barang}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.gudang}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.stokSistem.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.stokFisik.toLocaleString("id-ID")}
                </TableCell>
                <TableCell
                  className={`font-sans text-sm ${
                    row.selisih === 0
                      ? "text-foreground"
                      : row.selisih < 0
                        ? "text-red-500"
                        : "text-green-500"
                  }`}
                >
                  {row.selisih > 0 ? "+" : ""}
                  {row.selisih.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="font-sans text-sm text-muted-foreground">
                  {row.tanggal}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.dibuatOleh}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  {row.dokumen !== "-" ? (
                    <span className="inline-flex cursor-pointer items-center gap-0.5 rounded-[4px] border border-border/80 bg-card px-1.5 py-0.5 text-[11px] leading-none whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent/10">
                      <BiFile className="size-3 text-muted-foreground/80" />
                      <span>{row.dokumen}</span>
                    </span>
                  ) : (
                    <span className="font-sans text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="pr-6 text-right">
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
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={11} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>Menampilkan 1-6 dari 24 data</span>
                  <div className="flex items-center">
                    <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                      <button className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted">
                        &lt;
                      </button>
                      <button className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 bg-muted/60 font-medium text-foreground transition-colors">
                        1
                      </button>
                      <button className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted">
                        2
                      </button>
                      <button className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted">
                        3
                      </button>
                      <button className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted">
                        4
                      </button>
                      <button className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted">
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
