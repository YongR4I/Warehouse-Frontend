"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ExportModal } from "@/components/export-modal"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import {
  BiPackage,
  BiSolidReport,
  BiChevronLeft,
  BiChevronRight,
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
import { ColoredBadge } from "@/components/ui/colored-badge"

interface StockMovement {
  tanggal: string
  tipeTransaksi:
    "Stok Opname" | "Keluar Barang" | "Mutasi Stok" | "Terima Barang"
  noReferensi: string
  lokasiGudang: { asal: string; tujuan?: string }
  pergerakanQty: number
  saldoAkhir: number
  satuan: string
  dibuatOleh: string
}

const dummyData: StockMovement[] = [
  {
    tanggal: "12 Ags 2026 10:15 WIB",
    tipeTransaksi: "Terima Barang",
    noReferensi: "BM-20260812-004",
    lokasiGudang: { asal: "Gudang Utama (Pusat)" },
    pergerakanQty: 4000,
    saldoAkhir: 4150,
    satuan: "Pcs",
    dibuatOleh: "Rudi",
  },
  {
    tanggal: "05 Agu 2026 14:20 WIB",
    tipeTransaksi: "Stok Opname",
    noReferensi: "SO-202608-001",
    lokasiGudang: { asal: "Gudang Utama (Pusat)" },
    pergerakanQty: -5,
    saldoAkhir: 150,
    satuan: "Pcs",
    dibuatOleh: "Budi Santoso",
  },
  {
    tanggal: "23 Jul 2026 11:15 WIB",
    tipeTransaksi: "Keluar Barang",
    noReferensi: "BK-20260723-023",
    lokasiGudang: { asal: "Gudang Timur" },
    pergerakanQty: -30,
    satuan: "Pcs",
    saldoAkhir: 50,
    dibuatOleh: "Rina Wijaya",
  },
  {
    tanggal: "21 Jul 2026 09:40 WIB",
    tipeTransaksi: "Terima Barang",
    noReferensi: "BM-20260721-001",
    lokasiGudang: { asal: "Gudang Utama (Pusat)" },
    pergerakanQty: 100,
    saldoAkhir: 180,
    satuan: "Pcs",
    dibuatOleh: "Budi Santoso",
  },
  {
    tanggal: "20 Jul 2026 08:30 WIB",
    tipeTransaksi: "Mutasi Stok",
    noReferensi: "MT-20260720-031",
    lokasiGudang: { asal: "Gudang Utama (Pusat)", tujuan: "Gudang Timur" },
    pergerakanQty: -50,
    saldoAkhir: 80,
    satuan: "Pcs",
    dibuatOleh: "Rina Wijaya",
  },
  {
    tanggal: "18 Jul 2026 16:50 WIB",
    tipeTransaksi: "Keluar Barang",
    noReferensi: "BK-20260718-014",
    lokasiGudang: { asal: "Gudang Utama (Pusat)" },
    pergerakanQty: -50,
    saldoAkhir: 130,
    satuan: "Pcs",
    dibuatOleh: "Budi Santoso",
  },
]

function getDetailHref(tipeTransaksi: StockMovement["tipeTransaksi"], noReferensi: string) {
  switch (tipeTransaksi) {
    case "Stok Opname":
      return `/inventory/opname/${noReferensi}`
    case "Keluar Barang":
      return `/inventory/stok/keluar-barang/${noReferensi}`
    case "Mutasi Stok":
      return `/inventory/mutasi/detail/${noReferensi}`
    case "Terima Barang":
      return `/inventory/barang-masuk/detail/${noReferensi}`
  }
}

export default function StokPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const router = useRouter()
  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Aktivitas Gudang" },
              { label: "Kartu Stok & Riwayat" },
            ]}
            title="Kartu Stok & Riwayat"
            icon={BiPackage}
            description="Lihat riwayat pergerakan stok tiap barang "
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
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
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Tanggal & Waktu
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Tipe Transaksi
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                No. Referensi
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Lokasi Gudang
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Pergerakan Qty
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Saldo Akhir
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Dibuat Oleh
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="min-h-[300px]">
            {dummyData.map((row) => (
              <TableRow
                key={row.noReferensi}
                className="h-16 border-b border-border/40 hover:bg-muted/30 cursor-pointer"
                onClick={() => router.push(getDetailHref(row.tipeTransaksi, row.noReferensi))}
              >
                <TableCell className="pl-6 font-sans text-sm text-foreground">
                  {row.tanggal}
                </TableCell>
                <TableCell className="font-sans text-sm">
                  {row.tipeTransaksi === "Stok Opname" && (
                    <ColoredBadge color="blue">Stok Opname</ColoredBadge>
                  )}
                  {row.tipeTransaksi === "Keluar Barang" && (
                    <ColoredBadge color="yellow">Keluar Barang</ColoredBadge>
                  )}
                  {row.tipeTransaksi === "Mutasi Stok" && (
                    <ColoredBadge color="purple">Mutasi Stok</ColoredBadge>
                  )}
                  {row.tipeTransaksi === "Terima Barang" && (
                    <ColoredBadge color="green">Terima Barang</ColoredBadge>
                  )}
                </TableCell>
                <TableCell className="font-sans text-sm font-medium text-[#3B82F6]">
                  {row.noReferensi}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.lokasiGudang.tujuan ? (
                    <div className="flex items-center gap-1.5">
                      <span>{row.lokasiGudang.asal}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{row.lokasiGudang.tujuan}</span>
                    </div>
                  ) : (
                    <span>{row.lokasiGudang.asal}</span>
                  )}
                </TableCell>
                <TableCell className="text-center font-sans text-sm font-semibold">
                  {row.pergerakanQty > 0 ? (
                    <span className="text-[#10B981]">{`+${row.pergerakanQty}`}</span>
                  ) : row.pergerakanQty < 0 ? (
                    <span className="text-[#F97316]">{row.pergerakanQty}</span>
                  ) : (
                    <span className="text-muted-foreground">
                      {row.pergerakanQty}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  {`${row.saldoAkhir} ${row.satuan}`}
                </TableCell>
                <TableCell className="pr-6 text-right font-sans text-sm text-foreground">
                  {row.dibuatOleh}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>Menampilkan 1-6 dari 19 data</span>
                  <div className="flex items-center">
                    <div className="flex items-center gap-1.5">
                      <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border border-border/70 text-muted-foreground transition-colors hover:bg-muted">
                        <BiChevronLeft className="size-4" />
                      </button>
                      <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] font-semibold text-foreground transition-colors hover:bg-muted">
                        1
                      </button>
                      <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] font-medium text-muted-foreground transition-colors hover:bg-muted">
                        2
                      </button>
                      <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] font-medium text-muted-foreground transition-colors hover:bg-muted">
                        3
                      </button>
                      <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] font-medium text-muted-foreground transition-colors hover:bg-muted">
                        4
                      </button>
                      <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border border-border/70 text-muted-foreground transition-colors hover:bg-muted">
                        <BiChevronRight className="size-4" />
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
        title="Ekspor Ringkasan Stok Barang"
        totalItemsCount={dummyData.length}
        totalItemsLabel="Total Stok"
        filterLabel="Filter Aktif"
        checkboxes={[
        {
          "id": "sku",
          "label": "Kode SKU & Barcode",
          "defaultChecked": true
        },
        {
          "id": "kategori",
          "label": "Kategori & Unit",
          "defaultChecked": true
        },
        {
          "id": "stok",
          "label": "Rincian Stok Min/Max",
          "defaultChecked": true
        }
      ]}
      />
    </>
  )
}
