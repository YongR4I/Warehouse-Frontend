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
  "BK-2026070014": {
    gudangTujuan: "Gudang Pusat",
    customer: "Toko Bangunan Jaya",
    disetujuiOleh: "Budi Hartono",
    tanggal: "18 Jul 2026",
    waktu: "10:30 WIB",
    dibuatOleh: "Andi Wijaya",
    status: "disetujui",
    dokumen: {
      nama: "surat-jalan.pdf",
      extraCount: 2,
    },
  },
  "BK-2026070017": {
    gudangTujuan: "Gudang Pusat",
    customer: "CV Mitra Konstruksi",
    disetujuiOleh: "-",
    tanggal: "19 Jul 2026",
    waktu: "14:20 WIB",
    dibuatOleh: "Rina Sari",
    status: "menunggu_approval",
    dokumen: {
      nama: "-",
    },
  },
  "BK-2026070019": {
    gudangTujuan: "Gudang Pusat",
    customer: "Toko Bangunan Jaya",
    disetujuiOleh: "-",
    tanggal: "20 Jul 2026",
    waktu: "09:15 WIB",
    dibuatOleh: "Andi Wijaya",
    status: "draft",
    dokumen: {
      nama: "-",
    },
  },
  "BK-2026070021": {
    gudangTujuan: "Gudang Pusat",
    customer: "PT Graha Sentosa",
    disetujuiOleh: "-",
    tanggal: "22 Jul 2026",
    waktu: "09:00 WIB",
    dibuatOleh: "Budi Hartono",
    status: "ditolak",
    dokumen: {
      nama: "retur.pdf",
      extraCount: 1,
    },
  },
  "BK-2026070023": {
    gudangTujuan: "Gudang Timur",
    customer: "CV Mitra Konstruksi",
    disetujuiOleh: "Andi Wijaya",
    tanggal: "23 Jul 2026",
    waktu: "11:15 WIB",
    dibuatOleh: "Rina Sari",
    status: "disetujui",
    dokumen: {
      nama: "bukti-keluar.pdf",
    },
  },
  "BK-2026070025": {
    gudangTujuan: "Gudang Selatan",
    customer: "Toko Bangunan Jaya",
    disetujuiOleh: "-",
    tanggal: "24 Jul 2026",
    waktu: "08:45 WIB",
    dibuatOleh: "Budi Hartono",
    status: "menunggu_approval",
    dokumen: {
      nama: "-",
    },
  },
}

const detailItems: Record<string, BarangKeluarDetailItem[]> = {
  "BK-2026070014": [
    { sku: "BRG-00412", nama: "Keramik 40x40 Putih", rak: "B-03-01", qty: 60, hargaSatuan: 58000, subtotal: 3480000 },
    { sku: "BRG-00518", nama: "Triplek 12mm 4x8", rak: "F-01-01", qty: 15, hargaSatuan: 115000, subtotal: 1725000 },
    { sku: "BRG-00905", nama: "Kuas Cat 3 Inch", rak: "B-01-05", qty: 30, hargaSatuan: 12000, subtotal: 360000 },
    { sku: "BRG-01011", nama: "Thinner High Gloss 1L", rak: "B-01-06", qty: 15, hargaSatuan: 38000, subtotal: 570000 },
    { sku: "BRG-00156", nama: "Pipa PVC 3 Inch", rak: "C-01-01", qty: 40, hargaSatuan: 52000, subtotal: 2080000 },
  ],
  "BK-2026070017": [
    { sku: "BRG-00822", nama: "Genteng Metal Pasir", rak: "E-02-01", qty: 100, hargaSatuan: 42000, subtotal: 4200000 },
    { sku: "BRG-01123", nama: "Baut Roofing 5cm", rak: "B-02-04", qty: 200, hargaSatuan: 500, subtotal: 100000 },
  ],
  "BK-2026070019": [
    { sku: "BRG-00121", nama: "Semen Portland 50kg", rak: "A-01-01", qty: 50, hargaSatuan: 65000, subtotal: 3250000 },
    { sku: "BRG-00087", nama: "Besi Beton 10mm", rak: "A-02-03", qty: 30, hargaSatuan: 82000, subtotal: 2460000 },
    { sku: "BRG-00045", nama: "Cat Tembok 5L", rak: "B-01-02", qty: 20, hargaSatuan: 145000, subtotal: 2900000 },
    { sku: "BRG-00203", nama: "Paku Beton 5cm", rak: "B-02-01", qty: 100, hargaSatuan: 18000, subtotal: 1800000 },
  ],
  "BK-2026070021": [
    { sku: "BRG-01340", nama: "Gypsum Board 9mm", rak: "F-02-01", qty: 20, hargaSatuan: 72000, subtotal: 1440000 },
    { sku: "BRG-01452", nama: "Hollow Baja Ringan 4x4", rak: "A-03-01", qty: 40, hargaSatuan: 32000, subtotal: 1280000 },
    { sku: "BRG-01560", nama: "Sealant Silicone Clear", rak: "B-02-05", qty: 12, hargaSatuan: 45000, subtotal: 540000 },
    { sku: "BRG-00311", nama: "Pasir Silika 25kg", rak: "D-01-01", qty: 80, hargaSatuan: 35000, subtotal: 2800000 },
    { sku: "BRG-00620", nama: "Seng Gelombang 1.8m", rak: "E-01-01", qty: 25, hargaSatuan: 62000, subtotal: 1550000 },
    { sku: "BRG-00092", nama: "Lem Pipa 500ml", rak: "C-01-03", qty: 25, hargaSatuan: 27000, subtotal: 675000 },
  ],
  "BK-2026070023": [
    { sku: "BRG-00121", nama: "Semen Portland 50kg", rak: "A-01-01", qty: 40, hargaSatuan: 65000, subtotal: 2600000 },
    { sku: "BRG-00092", nama: "Lem Pipa 500ml", rak: "C-01-03", qty: 25, hargaSatuan: 27000, subtotal: 675000 },
    { sku: "BRG-00045", nama: "Cat Tembok 5L", rak: "B-01-02", qty: 10, hargaSatuan: 145000, subtotal: 1450000 },
  ],
  "BK-2026070025": [
    { sku: "BRG-00412", nama: "Keramik 40x40 Putih", rak: "B-03-01", qty: 40, hargaSatuan: 58000, subtotal: 2320000 },
    { sku: "BRG-00518", nama: "Triplek 12mm 4x8", rak: "F-01-01", qty: 10, hargaSatuan: 115000, subtotal: 1150000 },
    { sku: "BRG-00905", nama: "Kuas Cat 3 Inch", rak: "B-01-05", qty: 50, hargaSatuan: 12000, subtotal: 600000 },
    { sku: "BRG-01011", nama: "Thinner High Gloss 1L", rak: "B-01-06", qty: 20, hargaSatuan: 38000, subtotal: 760000 },
    { sku: "BRG-00156", nama: "Pipa PVC 3 Inch", rak: "C-01-01", qty: 30, hargaSatuan: 52000, subtotal: 1560000 },
    { sku: "BRG-00087", nama: "Besi Beton 10mm", rak: "A-02-03", qty: 25, hargaSatuan: 82000, subtotal: 2050000 },
    { sku: "BRG-00203", nama: "Paku Beton 5cm", rak: "B-02-01", qty: 150, hargaSatuan: 18000, subtotal: 2700000 },
    { sku: "BRG-00822", nama: "Genteng Metal Pasir", rak: "E-02-01", qty: 50, hargaSatuan: 42000, subtotal: 2100000 },
    { sku: "BRG-01123", nama: "Baut Roofing 5cm", rak: "B-02-04", qty: 300, hargaSatuan: 500, subtotal: 150000 },
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
