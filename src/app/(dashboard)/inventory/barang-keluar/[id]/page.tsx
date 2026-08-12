"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import {
  BiCheck,
  BiTimeFive,
  BiX,
  BiFile,
  BiFileBlank,
} from "react-icons/bi"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface BarangKeluarDetailItem {
  sku: string
  nama: string
  rak: string
  qty: number
  hargaSatuan: number
  subtotal: number
}

interface BarangKeluarDetailInfo {
  gudangTujuan: string
  customer: string
  disetujuiOleh: string
  tanggal: string
  waktu: string
  dibuatOleh: string
  status: "disetujui" | "menunggu_approval" | "ditolak" | "draft"
  dokumen: {
    nama: string
    extraCount?: number
  }
}

const detailInfo: Record<string, BarangKeluarDetailInfo> = {
  "BK-20260718-014": {
    gudangTujuan: "Gudang Utama (Pusat)",
    customer: "Guardian Indonesia",
    disetujuiOleh: "Rudi",
    tanggal: "18 Jul 2026",
    waktu: "10:30 WIB",
    dibuatOleh: "Budi Santoso",
    status: "disetujui",
    dokumen: {
      nama: "invoice-guardian-14.pdf",
      extraCount: 2,
    },
  },
  "BK-20260723-023": {
    gudangTujuan: "Gudang Timur",
    customer: "Watsons Pharmacy",
    disetujuiOleh: "Rina Wijaya",
    tanggal: "23 Jul 2026",
    waktu: "11:15 WIB",
    dibuatOleh: "Rina Wijaya",
    status: "disetujui",
    dokumen: {
      nama: "invoice-watsons-23.pdf",
    },
  },
  "BK-20260719-017": {
    gudangTujuan: "Gudang Utama (Pusat)",
    customer: "CV Beauty Cosmindo",
    disetujuiOleh: "-",
    tanggal: "19 Jul 2026",
    waktu: "14:20 WIB",
    dibuatOleh: "Budi Santoso",
    status: "menunggu_approval",
    dokumen: {
      nama: "PO-beauty-17.pdf",
    },
  },
  "BK-20260720-019": {
    gudangTujuan: "Gudang Utama (Pusat)",
    customer: "Toko Parfum Sejahtera",
    disetujuiOleh: "-",
    tanggal: "20 Jul 2026",
    waktu: "09:15 WIB",
    dibuatOleh: "Budi Santoso",
    status: "draft",
    dokumen: {
      nama: "-",
    },
  },
  "BK-20260722-021": {
    gudangTujuan: "Gudang Utama (Pusat)",
    customer: "CV Beauty Cosmindo",
    disetujuiOleh: "Ahmad Dahlan",
    tanggal: "22 Jul 2026",
    waktu: "09:00 WIB",
    dibuatOleh: "Ahmad Dahlan",
    status: "ditolak",
    dokumen: {
      nama: "PO-beauty-ret.pdf",
    },
  },
}

const detailItems: Record<string, BarangKeluarDetailItem[]> = {
  "BK-20260718-014": [
    { sku: "SOM-NIA-20", nama: "Somethinc Niacinamide 20ml", rak: "RAK-A-02", qty: 50, hargaSatuan: 120000, subtotal: 6000000 },
    { sku: "WRD-MLC-05", nama: "Wardah Matte Lip Cream", rak: "RAK-A-02", qty: 100, hargaSatuan: 60000, subtotal: 6000000 },
  ],
  "BK-20260723-023": [
    { sku: "MIK-MON-50", nama: "Mikonos Monaco 50ml", rak: "RAK-B-01", qty: 30, hargaSatuan: 150000, subtotal: 4500000 },
  ],
  "BK-20260719-017": [
    { sku: "MIK-MON-50", nama: "Mikonos Monaco 50ml", rak: "RAK-A-01", qty: 30, hargaSatuan: 150000, subtotal: 4500000 },
    { sku: "SOM-NIA-20", nama: "Somethinc Niacinamide 20ml", rak: "RAK-A-02", qty: 50, hargaSatuan: 120000, subtotal: 6000000 },
  ],
  "BK-20260720-019": [
    { sku: "MIK-MON-50", nama: "Mikonos Monaco 50ml", rak: "RAK-A-01", qty: 10, hargaSatuan: 150000, subtotal: 1500000 },
  ],
  "BK-20260722-021": [
    { sku: "MIK-MON-50", nama: "Mikonos Monaco 50ml", rak: "RAK-A-01", qty: 50, hargaSatuan: 150000, subtotal: 7500000 },
    { sku: "SOM-NIA-20", nama: "Somethinc Niacinamide 20ml", rak: "RAK-A-02", qty: 40, hargaSatuan: 120000, subtotal: 4800000 },
    { sku: "KHF-FW-100", nama: "Kahf Face Wash 100ml", rak: "RAK-B-01", qty: 50, hargaSatuan: 45000, subtotal: 2250000 },
  ],
}

const formatCurrency = (val: number) => {
  return `Rp${val.toLocaleString("id-ID")}`
}

const statusLabel: Record<BarangKeluarDetailInfo["status"], string> = {
  disetujui: "Disetujui",
  menunggu_approval: "Menunggu Approval",
  ditolak: "Ditolak",
  draft: "Draft",
}

const dotColor: Record<BarangKeluarDetailInfo["status"], string> = {
  disetujui: "bg-[#22C55E]",
  menunggu_approval: "bg-amber-500",
  ditolak: "bg-rose-500",
  draft: "bg-slate-400",
}

const statusGridColor: Record<BarangKeluarDetailInfo["status"], string> = {
  disetujui: "text-[#16A34A]",
  menunggu_approval: "text-amber-600",
  ditolak: "text-rose-600",
  draft: "text-slate-500",
}

export default function BarangKeluarDetailPage() {
  const router = useRouter()
  const { id: noReferensi } = useParams() as { id: string }

  const info = detailInfo[noReferensi]
  const items = useMemo(
    () => detailItems[noReferensi] || [],
    [noReferensi]
  )

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return items.filter(
      (row) =>
        !query ||
        row.nama.toLowerCase().includes(query) ||
        row.sku.toLowerCase().includes(query)
    )
  }, [items, searchQuery])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / itemsPerPage)
  )

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredData.slice(start, end)
  }, [filteredData, currentPage])

  if (!info) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Dokumen Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground">
          Pengeluaran barang dengan nomor referensi {noReferensi} tidak ada.
        </p>
        <Button
          variant="default"
          onClick={() => router.push("/inventory/barang-keluar")}
        >
          Kembali ke Keluar Barang (Out)
        </Button>
      </div>
    )
  }

  return (
    <div className="font-sans">
      <div className="wrapper">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <PageHeader
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Aktivitas Gudang" },
              {
                label: "Keluar Barang (Out)",
                href: "/inventory/barang-keluar",
              },
              { label: noReferensi },
            ]}
            title={
              <span className="flex items-center gap-2.5">
                <span>{noReferensi}</span>
                <span
                  className={cn(
                    "inline-block size-3 rounded-full shrink-0",
                    dotColor[info.status]
                  )}
                />
              </span>
            }
            description={`Dibuat oleh ${info.dibuatOleh} · ${info.tanggal} · ${info.waktu}`}
          />
        </div>
      </div>

      <div className="wrapper mt-10 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <div className="text-xs font-normal text-[#857F78]">
            Gudang Tujuan
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.gudangTujuan}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-[#857F78]">
            Customer
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.customer}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-[#857F78]">
            Disetujui oleh
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.disetujuiOleh}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-[#857F78]">
            Dokumen
          </div>
          <div className="mt-1">
            {info.dokumen.nama !== "-" ? (
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#0284C7] hover:underline"
              >
                <BiFileBlank className="size-4 shrink-0 text-[#0284C7]" />
                <span>{info.dokumen.nama}</span>
                {info.dokumen.extraCount ? (
                  <span className="font-semibold text-xs text-[#0284C7]">
                    +{info.dokumen.extraCount}
                  </span>
                ) : null}
              </a>
            ) : (
              <span className="text-sm font-bold text-foreground">-</span>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-[#857F78]">
            Status
          </div>
          <div className="mt-1">
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-bold",
                statusGridColor[info.status]
              )}
            >
              {info.status === "disetujui" && (
                <BiCheck className="size-5 stroke-[1.5]" />
              )}
              {info.status === "menunggu_approval" && (
                <BiTimeFive className="size-4.5" />
              )}
              {info.status === "ditolak" && (
                <BiX className="size-5 stroke-[1.5]" />
              )}
              {info.status === "draft" && (
                <BiFile className="size-4.5" />
              )}
              <span>{statusLabel[info.status]}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[45px]">
        <div className="flex items-center gap-3">
          <InputSearch
            placeholder="Cari nama barang atau SKU..."
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
        <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-white shadow-xs">
          <div className="w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <TableHeader className="border-b border-border/40 bg-white">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    SKU
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Nama barang
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Lokasi rak
                  </TableHead>
                  <TableHead className="text-center text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Qty
                  </TableHead>
                  <TableHead className="text-right text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Harga satuan
                  </TableHead>
                  <TableHead className="pr-6 text-right text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Subtotal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row) => (
                  <TableRow
                    key={row.sku}
                    className="h-16 border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="pl-6 font-sans text-sm font-medium whitespace-nowrap text-foreground">
                      {row.sku}
                    </TableCell>
                    <TableCell className="font-sans text-sm font-semibold whitespace-nowrap text-foreground">
                      {row.nama}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-pre-line leading-tight text-[#857F78]">
                      {row.rak}
                    </TableCell>
                    <TableCell className="font-sans text-center text-sm whitespace-nowrap text-foreground">
                      {row.qty}
                    </TableCell>
                    <TableCell className="font-sans text-right text-sm whitespace-nowrap text-foreground tabular-nums">
                      {formatCurrency(row.hargaSatuan)}
                    </TableCell>
                    <TableCell className="font-sans pr-6 text-right text-sm font-normal whitespace-nowrap text-foreground tabular-nums">
                      {formatCurrency(row.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="font-sans h-48 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data barang.
                    </TableCell>
                  </TableRow>
                )}
                {paginatedData.length > 0 &&
                  paginatedData.length < itemsPerPage && (
                    <TableRow
                      style={{
                        height: `${(itemsPerPage - paginatedData.length) * 64}px`,
                      }}
                      className="pointer-events-none border-none hover:bg-transparent"
                    >
                      <TableCell colSpan={6} className="border-none p-0" />
                    </TableRow>
                  )}
              </TableBody>
              <TableFooter className="border-t border-border/40 bg-white">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="p-0 align-middle">
                    <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground select-none">
                      <span>
                        Menampilkan{" "}
                        {filteredData.length > 0
                          ? (currentPage - 1) * itemsPerPage + 1
                          : 0}
                        -
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredData.length
                        )}{" "}
                        dari {filteredData.length} data
                      </span>
                      <div className="flex items-center">
                        <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                          >
                            &lt;
                          </button>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setCurrentPage(p)}
                              className={cn(
                                "flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 transition-colors",
                                currentPage === p
                                  ? "bg-muted/60 font-medium text-foreground"
                                  : "text-muted-foreground hover:bg-muted"
                              )}
                            >
                              {p}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPage((p) =>
                                Math.min(totalPages, p + 1)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                          >
                            &gt;
                          </button>
                        </div>
                      </div>
                      <span>{itemsPerPage} per halaman</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
