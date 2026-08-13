"use client"

import { ExportModal } from "@/components/export-modal"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { BarangMasukForm } from "@/components/barang-masuk/barang-masuk-form"

import {
  BiDownArrowCircle,
  BiSolidReport,
  BiChevronRight,
  BiDotsVerticalRounded,
  BiFile,
  BiShow,
  BiPrinter,
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

const dummyData = [
  {
    noReferensi: "BM-20260812-004",
    gudangAsal: "Gudang Utama (Pusat)",
    supplier: "PT Mikonos",
    tanggal: "12 Ags 2026",
    totalItem: "1 SKU (4.000 Pcs)",
    dibuatOleh: "Rudi",
    status: "menunggu_approval",
    dokumen: "surat-jalan-mik-04.pdf",
  },
  {
    noReferensi: "BM-20260721-001",
    gudangAsal: "Gudang Utama (Pusat)",
    supplier: "PT Paragon Technology",
    tanggal: "21 Jul 2026",
    totalItem: "2 SKU (184 Pcs)",
    dibuatOleh: "Budi Santoso",
    status: "disetujui",
    dokumen: "sj-paragon-88.pdf",
  },
  {
    noReferensi: "BM-20260722-002",
    gudangAsal: "Gudang Utama (Pusat)",
    supplier: "PT Somethinc Beauty",
    tanggal: "22 Jul 2026",
    totalItem: "1 SKU (110 Pcs)",
    dibuatOleh: "Budi Santoso",
    status: "menunggu_approval",
    dokumen: "sj-somethinc-02.pdf",
  },
  {
    noReferensi: "BM-20260723-003",
    gudangAsal: "Gudang Utama (Pusat)",
    supplier: "PT Paragon Technology",
    tanggal: "22 Jul 2026",
    totalItem: "1 SKU (45 Pcs)",
    dibuatOleh: "Rudi",
    status: "draft",
    dokumen: "-",
  },
  {
    noReferensi: "BM-20260724-004",
    gudangAsal: "Gudang Timur",
    supplier: "PT Arista Latindo",
    tanggal: "24 Jul 2026",
    totalItem: "1 SKU (120 Pcs)",
    dibuatOleh: "Rina Wijaya",
    status: "ditolak",
    dokumen: "sj-arista-qc.pdf",
  },
] as const

export default function BarangMasukPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Aktivitas Gudang" },
              { label: "Terima Barang (In)" },
            ]}
            title="Terima Barang (In)"
            icon={BiDownArrowCircle}
            description="Catat penerimaan stok barang masuk ke gudang."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
            <Button variant="default" onClick={() => setDrawerOpen(true)}>
              + Barang Masuk Baru
            </Button>
          </div>
        </div>
      </div>

      <BarangMasukForm open={drawerOpen} onOpenChange={setDrawerOpen} />

      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch placeholder="Cari no. referensi atau supplier..." className="flex-1" />
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
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                No. Referensi
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Gudang asal
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Supplier
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Tanggal
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Total Item
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Dibuat Oleh
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Status
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Dokumen
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="min-h-[300px]">
            {dummyData.map((row) => (
              <TableRow
                key={row.noReferensi}
                className="h-16 border-b border-border/40 hover:bg-muted/30"
              >
                <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                  {row.noReferensi}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.gudangAsal}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.supplier}
                </TableCell>
                <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                  {row.tanggal}
                </TableCell>
                <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                  {row.totalItem}
                </TableCell>
                <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                  {row.dibuatOleh}
                </TableCell>
                <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                  <ColoredBadge
                    color={
                      row.status === "disetujui"
                        ? "green"
                        : row.status === "menunggu_approval"
                          ? "yellow"
                          : row.status === "ditolak"
                            ? "red"
                            : "gray"
                    }
                  >
                    {row.status === "disetujui"
                      ? "Disetujui"
                      : row.status === "menunggu_approval"
                        ? "Menunggu Approval"
                        : row.status === "ditolak"
                          ? "Ditolak"
                          : "Draft"}
                  </ColoredBadge>
                </TableCell>
                <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                  {row.dokumen !== "-" ? (
                    <span className="inline-flex cursor-pointer items-center gap-0.5 rounded-[4px] border border-border/80 bg-card px-1.5 py-0.5 text-[11px] leading-none whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent/10">
                      <BiFile className="size-3 text-muted-foreground/80" />
                      <span>{row.dokumen}</span>
                    </span>
                  ) : (
                    <span className="font-sans whitespace-nowrap text-muted-foreground">
                      -
                    </span>
                  )}
                </TableCell>
                <TableCell className="pr-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1 text-muted-foreground">
                    <button
                      className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted"
                      onClick={() =>
                        router.push(
                          `/inventory/barang-masuk/detail/${row.noReferensi}`
                        )
                      }
                    >
                      <BiChevronRight className="size-4 text-foreground/75" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted outline-none">
                        <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Aksi Penerimaan</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/inventory/barang-masuk/detail/${row.noReferensi}`
                            )
                          }
                        >
                          <BiShow />
                          <span>Lihat Detail</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BiPrinter />
                          <span>Cetak Label</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          <BiTrash />
                          <span>Batalkan</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {dummyData.length < 5 && (
              <TableRow
                style={{ height: `${300 - dummyData.length * 64}px` }}
                className="pointer-events-none border-none hover:bg-transparent"
              >
                <TableCell colSpan={9} className="border-none p-0" />
              </TableRow>
            )}
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={9} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>Menampilkan 1-6 dari 19 data</span>
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
    
      
    
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Barang Masuk"
        totalItemsCount={dummyData.length}
        totalItemsLabel="Total Penerimaan"
        filterLabel="Filter Aktif"
        exportUrl="/barang-masuk/export/excel"
        checkboxes={[
        {
          "id": "noPo",
          "label": "No. Purchase Order",
          "defaultChecked": true
        },
        {
          "id": "supplier",
          "label": "Supplier Asal",
          "defaultChecked": true
        },
        {
          "id": "barang",
          "label": "Detail Barang & Qty",
          "defaultChecked": true
        },
        {
          "id": "petugas",
          "label": "Petugas Penerima",
          "defaultChecked": true
        }
      ]}
      />
    </>
  )
}
