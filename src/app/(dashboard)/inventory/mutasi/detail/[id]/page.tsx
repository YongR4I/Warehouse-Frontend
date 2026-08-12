"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ImageOff } from "lucide-react"

interface MutasiDetailItem {
  sku: string
  nama: string
  kategori: string
  satuan: string
  qtyMutasi: number
  catatan: string
  gambar: string | null
}

interface MutasiDetailInfo {
  gudangAsal: string
  gudangTujuan: string
  tanggal: string
  waktu: string
  dibuatOleh: string
  status: "disetujui" | "menunggu_approval" | "ditolak" | "draft"
  dokumen: {
    nama: string
    extraCount?: number
  }
}

const detailInfo: Record<string, MutasiDetailInfo> = {
  "MT-2026070031": {
    gudangAsal: "Gudang Pusat",
    gudangTujuan: "Gudang Timur",
    tanggal: "20 Jul 2026",
    waktu: "10:15 WIB",
    dibuatOleh: "Andi Wijaya",
    status: "disetujui",
    dokumen: {
      nama: "surat-mutasi.pdf",
      extraCount: 1,
    },
  },
  "MT-2026070033": {
    gudangAsal: "Gudang Selatan",
    gudangTujuan: "Gudang Pusat",
    tanggal: "21 Jul 2026",
    waktu: "09:40 WIB",
    dibuatOleh: "Rina Sari",
    status: "menunggu_approval",
    dokumen: {
      nama: "-",
    },
  },
  "MT-2026070035": {
    gudangAsal: "Gudang Pusat",
    gudangTujuan: "Gudang Selatan",
    tanggal: "22 Jul 2026",
    waktu: "14:05 WIB",
    dibuatOleh: "Budi Hartono",
    status: "draft",
    dokumen: {
      nama: "-",
    },
  },
  "MT-2026070037": {
    gudangAsal: "Gudang Timur",
    gudangTujuan: "Gudang Pusat",
    tanggal: "23 Jul 2026",
    waktu: "11:30 WIB",
    dibuatOleh: "Andi Wijaya",
    status: "ditolak",
    dokumen: {
      nama: "retur-mutasi.pdf",
      extraCount: 2,
    },
  },
  "MT-2026070039": {
    gudangAsal: "Gudang Pusat",
    gudangTujuan: "Gudang Timur",
    tanggal: "24 Jul 2026",
    waktu: "08:50 WIB",
    dibuatOleh: "Rina Sari",
    status: "disetujui",
    dokumen: {
      nama: "bukti-mutasi.pdf",
    },
  },
  "MT-2026070041": {
    gudangAsal: "Gudang Selatan",
    gudangTujuan: "Gudang Timur",
    tanggal: "24 Jul 2026",
    waktu: "13:20 WIB",
    dibuatOleh: "Budi Hartono",
    status: "menunggu_approval",
    dokumen: {
      nama: "-",
    },
  },
}

const detailItems: Record<string, MutasiDetailItem[]> = {
  "MT-2026070031": [
    {
      sku: "BRG-00121",
      nama: "Semen Portland 50kg",
      kategori: "Bahan Bangunan",
      satuan: "Sak",
      qtyMutasi: 200,
      catatan: "Mutasi rutin bulanan",
      gambar: null,
    },
    {
      sku: "BRG-00087",
      nama: "Besi Beton 10mm",
      kategori: "Bahan Bangunan",
      satuan: "Batang",
      qtyMutasi: 50,
      catatan: "Untuk proyek gedung B",
      gambar: null,
    },
    {
      sku: "BRG-00045",
      nama: "Cat Tembok 5L",
      kategori: "Finishing",
      satuan: "Kaleng",
      qtyMutasi: 30,
      catatan: "",
      gambar: null,
    },
    {
      sku: "BRG-00203",
      nama: "Paku Beton 5cm",
      kategori: "Hardware",
      satuan: "Kg",
      qtyMutasi: 15,
      catatan: "",
      gambar: null,
    },
    {
      sku: "BRG-00156",
      nama: "Pipa PVC 3 Inch",
      kategori: "Plumbing",
      satuan: "Batang",
      qtyMutasi: 40,
      catatan: "Gudang timur kekurangan stok",
      gambar: null,
    },
    {
      sku: "BRG-00412",
      nama: "Keramik 40x40 Putih",
      kategori: "Finishing",
      satuan: "Kotak",
      qtyMutasi: 25,
      catatan: "",
      gambar: null,
    },
  ],
  "MT-2026070033": [
    {
      sku: "BRG-00311",
      nama: "Pasir Silika 25kg",
      kategori: "Bahan Bangunan",
      satuan: "Karung",
      qtyMutasi: 100,
      catatan: "Untuk campuran beton",
      gambar: null,
    },
    {
      sku: "BRG-00620",
      nama: "Seng Gelombang 1.8m",
      kategori: "Atap",
      satuan: "Lembar",
      qtyMutasi: 20,
      catatan: "",
      gambar: null,
    },
    {
      sku: "BRG-00905",
      nama: "Kuas Cat 3 Inch",
      kategori: "Finishing",
      satuan: "Pcs",
      qtyMutasi: 10,
      catatan: "",
      gambar: null,
    },
  ],
  "MT-2026070035": [
    {
      sku: "BRG-00518",
      nama: "Triplek 12mm 4x8",
      kategori: "Kayu",
      satuan: "Lembar",
      qtyMutasi: 15,
      catatan: "Sementara ditahan",
      gambar: null,
    },
    {
      sku: "BRG-01235",
      nama: "Semen Putih 40kg",
      kategori: "Bahan Bangunan",
      satuan: "Sak",
      qtyMutasi: 30,
      catatan: "",
      gambar: null,
    },
  ],
  "MT-2026070037": [
    {
      sku: "BRG-00092",
      nama: "Lem Pipa 500ml",
      kategori: "Plumbing",
      satuan: "Pcs",
      qtyMutasi: 20,
      catatan: "Ditolak: stok tidak mencukupi",
      gambar: null,
    },
    {
      sku: "BRG-01340",
      nama: "Gypsum Board 9mm",
      kategori: "Interior",
      satuan: "Lembar",
      qtyMutasi: 10,
      catatan: "",
      gambar: null,
    },
  ],
  "MT-2026070039": [
    {
      sku: "BRG-01452",
      nama: "Hollow Baja Ringan 4x4",
      kategori: "Struktur",
      satuan: "Batang",
      qtyMutasi: 35,
      catatan: "",
      gambar: null,
    },
    {
      sku: "BRG-01560",
      nama: "Sealant Silicone Clear",
      kategori: "Hardware",
      satuan: "Pcs",
      qtyMutasi: 24,
      catatan: "",
      gambar: null,
    },
    {
      sku: "BRG-00822",
      nama: "Genteng Metal Pasir",
      kategori: "Atap",
      satuan: "Lembar",
      qtyMutasi: 60,
      catatan: "Prioritas tinggi",
      gambar: null,
    },
  ],
  "MT-2026070041": [
    {
      sku: "BRG-01011",
      nama: "Thinner High Gloss 1L",
      kategori: "Finishing",
      satuan: "Liter",
      qtyMutasi: 12,
      catatan: "",
      gambar: null,
    },
    {
      sku: "BRG-01123",
      nama: "Baut Roofing 5cm",
      kategori: "Hardware",
      satuan: "Kg",
      qtyMutasi: 8,
      catatan: "",
      gambar: null,
    },
  ],
}

const statusLabel: Record<MutasiDetailInfo["status"], string> = {
  disetujui: "Disetujui",
  menunggu_approval: "Menunggu Approval",
  ditolak: "Ditolak",
  draft: "Draft",
}

const statusConfig: Record<
  MutasiDetailInfo["status"],
  { color: string; icon: React.ReactNode }
> = {
  disetujui: {
    color: "text-[#16A34A]",
    icon: (
      <svg className="size-5 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  },
  menunggu_approval: {
    color: "text-amber-600",
    icon: (
      <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  ditolak: {
    color: "text-rose-600",
    icon: (
      <svg className="size-5 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    ),
  },
  draft: {
    color: "text-slate-500",
    icon: (
      <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      </svg>
    ),
  },
}

const dotColor: Record<MutasiDetailInfo["status"], string> = {
  disetujui: "bg-[#22C55E]",
  menunggu_approval: "bg-amber-500",
  ditolak: "bg-rose-500",
  draft: "bg-slate-400",
}

const statusGridColor: Record<MutasiDetailInfo["status"], string> = {
  disetujui: "text-[#16A34A]",
  menunggu_approval: "text-amber-600",
  ditolak: "text-rose-600",
  draft: "text-slate-500",
}

export default function MutasiDetailPage() {
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
        row.sku.toLowerCase().includes(query) ||
        row.kategori.toLowerCase().includes(query)
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
          Mutasi dengan nomor referensi {noReferensi} tidak ada.
        </p>
        <Button
          variant="default"
          onClick={() => router.push("/inventory/mutasi")}
        >
          Kembali ke Mutasi Stok
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
              { label: "AKTIVITAS GUDANG" },
              {
                label: "MUTASI STOK",
                href: "/inventory/mutasi",
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

      <div className="wrapper mt-10 flex flex-wrap items-start justify-between gap-x-8 gap-y-6">
        <div>
          <div className="text-xs font-normal text-[#857F78]">
            Gudang Asal
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.gudangAsal}
          </div>
        </div>

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
            Dokumen
          </div>
          <div className="mt-1">
            {info.dokumen.nama !== "-" ? (
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#0284C7] hover:underline"
              >
                <svg
                  className="size-4 shrink-0 text-[#0284C7]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                </svg>
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
              {statusConfig[info.status].icon}
              <span>{statusLabel[info.status]}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[45px]">
        <div className="flex items-center gap-3">
          <InputSearch
            placeholder="Cari nama barang, SKU, atau kategori..."
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
                    Barang
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    SKU
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Kategori
                  </TableHead>
                  <TableHead className="text-center text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Qty Mutasi
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Satuan
                  </TableHead>
                  <TableHead className="pr-6 text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Catatan Item
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row) => (
                  <TableRow
                    key={row.sku}
                    className="h-16 border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="pl-6 font-sans">
                      <div className="flex items-center gap-3">
                        {row.gambar ? (
                          <img
                            src={row.gambar}
                            alt={row.nama}
                            className="size-10 shrink-0 rounded-lg border border-border/40 object-cover"
                          />
                        ) : (
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-muted/30">
                            <ImageOff className="size-4 text-muted-foreground/60" />
                          </div>
                        )}
                        <span className="text-sm font-semibold whitespace-nowrap text-foreground">
                          {row.nama}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-foreground">
                      {row.sku}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-[#857F78]">
                      {row.kategori}
                    </TableCell>
                    <TableCell className="font-sans text-center text-sm whitespace-nowrap text-foreground">
                      {row.qtyMutasi}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.satuan}
                    </TableCell>
                    <TableCell className="font-sans pr-6 text-sm whitespace-nowrap text-[#857F78]">
                      {row.catatan || "-"}
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
