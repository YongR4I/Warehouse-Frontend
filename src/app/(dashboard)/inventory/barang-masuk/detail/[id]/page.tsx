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
import axios from "axios"

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
  "BM-20260812-004": {
    gudangTujuan: "Gudang Utama (Pusat)",
    supplier: "PT Mikonos",
    disetujuiOleh: "-",
    tanggal: "12 Ags 2026",
    waktu: "10:15 WIB",
    dibuatOleh: "Rudi",
    status: "menunggu_approval",
    dokumen: {
      nama: "surat-jalan-mik-04.pdf",
      extraCount: 1,
    },
  },
  "BM-20260721-001": {
    gudangTujuan: "Gudang Utama (Pusat)",
    supplier: "PT Paragon Technology",
    disetujuiOleh: "Rudi",
    tanggal: "21 Jul 2026",
    waktu: "09:40 WIB",
    dibuatOleh: "Budi Santoso",
    status: "disetujui",
    dokumen: {
      nama: "sj-paragon-88.pdf",
      extraCount: 2,
    },
  },
  "BM-20260722-002": {
    gudangTujuan: "Gudang Utama (Pusat)",
    supplier: "PT Somethinc Beauty",
    disetujuiOleh: "-",
    tanggal: "22 Jul 2026",
    waktu: "14:05 WIB",
    dibuatOleh: "Budi Santoso",
    status: "menunggu_approval",
    dokumen: {
      nama: "sj-somethinc-02.pdf",
      extraCount: 1,
    },
  },
  "BM-20260723-003": {
    gudangTujuan: "Gudang Utama (Pusat)",
    supplier: "PT Paragon Technology",
    disetujuiOleh: "-",
    tanggal: "22 Jul 2026",
    waktu: "16:10 WIB",
    dibuatOleh: "Rudi",
    status: "draft",
    dokumen: {
      nama: "-",
    },
  },
  "BM-20260724-004": {
    gudangTujuan: "Gudang Timur",
    supplier: "PT Arista Latindo",
    disetujuiOleh: "Rina Wijaya",
    tanggal: "24 Jul 2026",
    waktu: "11:30 WIB",
    dibuatOleh: "Rina Wijaya",
    status: "ditolak",
    dokumen: {
      nama: "sj-arista-qc.pdf",
      extraCount: 1,
    },
  },
}

const detailItems: Record<string, BarangMasukDetailItem[]> = {
  "BM-20260812-004": [
    {
      sku: "MIK-MON-50",
      nama: "Mikonos Monaco 50ml",
      rak: "RAK-A-01",
      qty: 4000,
      hargaSatuan: 150000,
      subtotal: 600000000,
    },
  ],
  "BM-20260721-001": [
    {
      sku: "KHF-FW-100",
      nama: "Kahf Face Wash 100ml",
      rak: "RAK-B-01",
      qty: 100,
      hargaSatuan: 45000,
      subtotal: 4500000,
    },
    {
      sku: "WRD-MLC-05",
      nama: "Wardah Matte Lip Cream",
      rak: "RAK-A-02",
      qty: 84,
      hargaSatuan: 60000,
      subtotal: 5040000,
    },
  ],
  "BM-20260722-002": [
    {
      sku: "SOM-NIA-20",
      nama: "Somethinc Niacinamide 20ml",
      rak: "RAK-A-02",
      qty: 110,
      hargaSatuan: 120000,
      subtotal: 13200000,
    },
  ],
  "BM-20260723-003": [
    {
      sku: "KHF-FW-100",
      nama: "Kahf Face Wash 100ml",
      rak: "RAK-B-01",
      qty: 45,
      hargaSatuan: 45000,
      subtotal: 2025000,
    },
  ],
  "BM-20260724-004": [
    {
      sku: "SNS-MSK-3P",
      nama: "Sensi Mask 3-Ply Earloop",
      rak: "RAK-B-01",
      qty: 120,
      hargaSatuan: 80000,
      subtotal: 9600000,
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
    } catch (error) {
      console.error("Print error:", error)
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      if (status === 403) {
        alert("Anda tidak memiliki izin (permission: barang-masuk-print) untuk mencetak surat jalan.")
      } else if (status === 401) {
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
