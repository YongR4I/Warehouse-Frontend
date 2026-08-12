"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  BiStoreAlt,
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
import api from "@/lib/api"

interface BarangMasukDetailItem {
  sku: string
  nama: string
  rak: string
  qty: number
  hargaSatuan: number
  subtotal: number
}

interface BarangMasukDetailInfo {
  gudangTujuan: string
  supplier: string
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

const detailInfo: Record<string, BarangMasukDetailInfo> = {
  "BM-2026070001": {
    gudangTujuan: "Gudang Pusat",
    supplier: "PT Sumber Makmur",
    disetujuiOleh: "Budi Hartono",
    tanggal: "21 Jul 2026",
    waktu: "10:15 WIB",
    dibuatOleh: "Andi Wijaya",
    status: "disetujui",
    dokumen: {
      nama: "surat-jalan.pdf",
      extraCount: 2,
    },
  },
  "BM-2026070002": {
    gudangTujuan: "Gudang Timur",
    supplier: "CV Indo Perkasa",
    disetujuiOleh: "Andi Wijaya",
    tanggal: "21 Jul 2026",
    waktu: "09:40 WIB",
    dibuatOleh: "Rina Sari",
    status: "menunggu_approval",
    dokumen: {
      nama: "faktur-pengiriman.pdf",
      extraCount: 1,
    },
  },
  "BM-2026070003": {
    gudangTujuan: "Gudang Pusat",
    supplier: "PT Sumber Makmur",
    disetujuiOleh: "-",
    tanggal: "22 Jul 2026",
    waktu: "14:05 WIB",
    dibuatOleh: "Andi Wijaya",
    status: "draft",
    dokumen: {
      nama: "-",
    },
  },
  "BM-2026070004": {
    gudangTujuan: "Gudang Selatan",
    supplier: "PT Karya Baja",
    disetujuiOleh: "Budi Hartono",
    tanggal: "22 Jul 2026",
    waktu: "11:30 WIB",
    dibuatOleh: "Budi Hartono",
    status: "ditolak",
    dokumen: {
      nama: "lampiran-retur.pdf",
      extraCount: 3,
    },
  },
  "BM-2026070005": {
    gudangTujuan: "Gudang Pusat",
    supplier: "CV Indo Perkasa",
    disetujuiOleh: "Budi Hartono",
    tanggal: "23 Jul 2026",
    waktu: "08:50 WIB",
    dibuatOleh: "Rina Sari",
    status: "disetujui",
    dokumen: {
      nama: "surat-jalan.pdf",
      extraCount: 2,
    },
  },
  "BM-2026070006": {
    gudangTujuan: "Gudang Timur",
    supplier: "PT Karya Baja",
    disetujuiOleh: "Andi Wijaya",
    tanggal: "24 Jul 2026",
    waktu: "13:20 WIB",
    dibuatOleh: "Budi Hartono",
    status: "menunggu_approval",
    dokumen: {
      nama: "-",
    },
  },
}

const detailItems: Record<string, BarangMasukDetailItem[]> = {
  "BM-2026070001": [
    {
      sku: "BRG-00121",
      nama: "Semen Portland 50kg",
      rak: "PT Sumber Makmur",
      qty: 100,
      hargaSatuan: 65000,
      subtotal: 6500000,
    },
    {
      sku: "BRG-00087",
      nama: "Besi Beton 10mm",
      rak: "CV Indo Perkasa",
      qty: 250,
      hargaSatuan: 82000,
      subtotal: 20500000,
    },
    {
      sku: "BRG-00045",
      nama: "Cat Tembok 5L",
      rak: "PT Sumber Makmur",
      qty: 40,
      hargaSatuan: 145000,
      subtotal: 5800000,
    },
    {
      sku: "BRG-00203",
      nama: "Paku Beton 5cm",
      rak: "PT Karya Baja",
      qty: 80,
      hargaSatuan: 18000,
      subtotal: 1440000,
    },
    {
      sku: "BRG-00156",
      nama: "Pipa PVC 3 Inch",
      rak: "CV Indo Perkasa",
      qty: 60,
      hargaSatuan: 52000,
      subtotal: 3120000,
    },
    {
      sku: "BRG-00092",
      nama: "Lem Pipa 500ml",
      rak: "PT Karya Baja",
      qty: 30,
      hargaSatuan: 27000,
      subtotal: 810000,
    },
    {
      sku: "BRG-00311",
      nama: "Pasir Silika 25kg",
      rak: "PT Sumber Makmur",
      qty: 50,
      hargaSatuan: 35000,
      subtotal: 1750000,
    },
    {
      sku: "BRG-00412",
      nama: "Keramik 40x40 Putih",
      rak: "CV Indo Perkasa",
      qty: 120,
      hargaSatuan: 58000,
      subtotal: 6960000,
    },
    {
      sku: "BRG-00518",
      nama: "Triplek 12mm 4x8",
      rak: "PT Sumber Makmur",
      qty: 45,
      hargaSatuan: 115000,
      subtotal: 5175000,
    },
    {
      sku: "BRG-00620",
      nama: "Seng Gelombang 1.8m",
      rak: "PT Karya Baja",
      qty: 70,
      hargaSatuan: 62000,
      subtotal: 4340000,
    },
    {
      sku: "BRG-00714",
      nama: "Kawat Bendrat 10kg",
      rak: "CV Indo Perkasa",
      qty: 25,
      hargaSatuan: 185000,
      subtotal: 4625000,
    },
    {
      sku: "BRG-00822",
      nama: "Genteng Metal Pasir",
      rak: "PT Karya Baja",
      qty: 150,
      hargaSatuan: 42000,
      subtotal: 6300000,
    },
    {
      sku: "BRG-00905",
      nama: "Kuas Cat 3 Inch",
      rak: "PT Sumber Makmur",
      qty: 80,
      hargaSatuan: 12000,
      subtotal: 960000,
    },
    {
      sku: "BRG-01011",
      nama: "Thinner High Gloss 1L",
      rak: "CV Indo Perkasa",
      qty: 40,
      hargaSatuan: 38000,
      subtotal: 1520000,
    },
    {
      sku: "BRG-01123",
      nama: "Baut Roofing 5cm",
      rak: "PT Karya Baja",
      qty: 500,
      hargaSatuan: 500,
      subtotal: 250000,
    },
    {
      sku: "BRG-01235",
      nama: "Semen Putih 40kg",
      rak: "PT Sumber Makmur",
      qty: 35,
      hargaSatuan: 88000,
      subtotal: 3080000,
    },
    {
      sku: "BRG-01340",
      nama: "Gypsum Board 9mm",
      rak: "CV Indo Perkasa",
      qty: 60,
      hargaSatuan: 72000,
      subtotal: 4320000,
    },
    {
      sku: "BRG-01452",
      nama: "Hollow Baja Ringan 4x4",
      rak: "PT Karya Baja",
      qty: 90,
      hargaSatuan: 32000,
      subtotal: 2880000,
    },
    {
      sku: "BRG-01560",
      nama: "Sealant Silicone Clear",
      rak: "PT Sumber Makmur",
      qty: 24,
      hargaSatuan: 45000,
      subtotal: 1080000,
    },
  ],
}

const formatCurrency = (val: number) => {
  return `Rp${val.toLocaleString("id-ID")}`
}

export default function BarangMasukDetailPage() {
  const router = useRouter()
  const { id: noReferensi } = useParams() as { id: string }

  const info = detailInfo[noReferensi]
  const items = useMemo(() => detailItems[noReferensi] || [], [noReferensi])

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return items.slice(start, end)
  }, [items, currentPage])

  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsPrinting(true)
    try {
      const response = await api.get(`/barang-masuk/${noReferensi}/print-surat-jalan`, {
        responseType: "blob",
      })
      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      window.open(url, "_blank")
    } catch (error: any) {
      console.error("Print error:", error)
      if (error.response?.status === 403) {
        alert("Anda tidak memiliki izin (permission: barang-masuk-print) untuk mencetak surat jalan.")
      } else if (error.response?.status === 401) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.")
      } else {
        alert("Gagal mengunduh PDF Surat Jalan. Mohon coba beberapa saat lagi.")
      }
    } finally {
      setIsPrinting(false)
    }
  }

  if (!info) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Dokumen Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground">
          Penerimaan barang dengan nomor referensi {noReferensi} tidak ada.
        </p>
        <Button
          variant="default"
          onClick={() => router.push("/inventory/barang-masuk")}
        >
          Kembali ke Terima Barang (In)
        </Button>
      </div>
    )
  }

  return (
    <div className="font-sans">
      {/* ─── HEADER ─── */}
      <div className="wrapper">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <PageHeader
            items={[
              { label: "AKTIVITAS GUDANG" },
              { label: "TERIMA BARANG (IN)", href: "/inventory/barang-masuk" },
              { label: noReferensi },
            ]}
            title={
              <span className="flex items-center gap-2.5">
                <span>{noReferensi}</span>
                <span
                  className={cn(
                    "inline-block size-3 rounded-full shrink-0",
                    info.status === "disetujui" && "bg-[#22C55E]",
                    info.status === "menunggu_approval" && "bg-amber-500",
                    info.status === "ditolak" && "bg-rose-500",
                    info.status === "draft" && "bg-slate-400"
                  )}
                />
              </span>
            }
            icon={BiStoreAlt}
            description={`Dibuat oleh ${info.dibuatOleh} · ${info.tanggal} · ${info.waktu}`}
          />
        </div>
      </div>

      {/* ─── METADATA SECTION ─── */}
      <div className="wrapper mt-10 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        {/* Gudang Tujuan */}
        <div>
          <div className="text-xs font-normal text-[#857F78]">
            Gudang Tujuan
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.gudangTujuan}
          </div>
        </div>

        {/* Supplier */}
        <div>
          <div className="text-xs font-normal text-[#857F78]">
            Supplier
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.supplier}
          </div>
        </div>

        {/* Disetujui oleh */}
        <div>
          <div className="text-xs font-normal text-[#857F78]">
            Disetujui oleh
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.disetujuiOleh}
          </div>
        </div>

        {/* Dokumen */}
        <div>
          <div className="text-xs font-normal text-[#857F78]">
            Dokumen
          </div>
          <div className="mt-1">
            {info.dokumen.nama !== "-" ? (
              <a
                href="#"
                onClick={handlePrint}
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-semibold text-[#0284C7] hover:underline",
                  isPrinting && "opacity-50 pointer-events-none"
                )}
              >
                <BiFileBlank className="size-4 shrink-0 text-[#0284C7]" />
                <span>{isPrinting ? "Membuka PDF..." : info.dokumen.nama}</span>
                {info.dokumen.extraCount && !isPrinting ? (
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

        {/* Status */}
        <div>
          <div className="text-xs font-normal text-[#857F78]">
            Status
          </div>
          <div className="mt-1">
            {info.status === "disetujui" && (
              <div className="flex items-center gap-1 text-sm font-bold text-[#16A34A]">
                <BiCheck className="size-5 stroke-[1.5]" />
                <span>Disetujui</span>
              </div>
            )}
            {info.status === "menunggu_approval" && (
              <div className="flex items-center gap-1 text-sm font-bold text-amber-600">
                <BiTimeFive className="size-4.5" />
                <span>Menunggu Approval</span>
              </div>
            )}
            {info.status === "ditolak" && (
              <div className="flex items-center gap-1 text-sm font-bold text-rose-600">
                <BiX className="size-5 stroke-[1.5]" />
                <span>Ditolak</span>
              </div>
            )}
            {info.status === "draft" && (
              <div className="flex items-center gap-1 text-sm font-bold text-slate-500">
                <BiFile className="size-4.5" />
                <span>Draft</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── TABLE ─── */}
      <div className="wrapper mt-[45px]">
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
                        {items.length > 0
                          ? (currentPage - 1) * itemsPerPage + 1
                          : 0}
                        -
                        {Math.min(
                          currentPage * itemsPerPage,
                          items.length
                        )}{" "}
                        dari {items.length} data
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
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
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
