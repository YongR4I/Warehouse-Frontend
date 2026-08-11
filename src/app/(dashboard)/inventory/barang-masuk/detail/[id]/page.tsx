"use client"

import { useState, useMemo, use } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { BiDownArrowCircle, BiFile } from "react-icons/bi"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface PageProps {
  params: Promise<{ id: string }> | { id: string }
}

interface BarangMasukDetailItem {
  sku: string
  nama: string
  kategori: string
  rak: string
  satuan: string
  qty: number
  hargaSatuan: number
}

interface BarangMasukDetailInfo {
  gudangAsal: string
  supplier: string
  tanggal: string
  waktu: string
  dibuatOleh: string
  status: "disetujui" | "menunggu_approval" | "ditolak" | "draft"
  dokumen: string
}

const detailInfo: Record<string, BarangMasukDetailInfo> = {
  "BM-2026070001": {
    gudangAsal: "Gudang Pusat",
    supplier: "PT Sumber Makmur",
    tanggal: "21 Jul 2026",
    waktu: "10:15 WIB",
    dibuatOleh: "Andi Wijaya",
    status: "disetujui",
    dokumen: "2 file",
  },
  "BM-2026070002": {
    gudangAsal: "Gudang Timur",
    supplier: "CV Indo Perkasa",
    tanggal: "21 Jul 2026",
    waktu: "09:40 WIB",
    dibuatOleh: "Rina Sari",
    status: "menunggu_approval",
    dokumen: "1 file",
  },
  "BM-2026070003": {
    gudangAsal: "Gudang Pusat",
    supplier: "PT Sumber Makmur",
    tanggal: "22 Jul 2026",
    waktu: "14:05 WIB",
    dibuatOleh: "Andi Wijaya",
    status: "draft",
    dokumen: "-",
  },
  "BM-2026070004": {
    gudangAsal: "Gudang Selatan",
    supplier: "PT Karya Baja",
    tanggal: "22 Jul 2026",
    waktu: "11:30 WIB",
    dibuatOleh: "Budi Hartono",
    status: "ditolak",
    dokumen: "3 file",
  },
  "BM-2026070005": {
    gudangAsal: "Gudang Pusat",
    supplier: "CV Indo Perkasa",
    tanggal: "23 Jul 2026",
    waktu: "08:50 WIB",
    dibuatOleh: "Rina Sari",
    status: "disetujui",
    dokumen: "2 file",
  },
  "BM-2026070006": {
    gudangAsal: "Gudang Timur",
    supplier: "PT Karya Baja",
    tanggal: "24 Jul 2026",
    waktu: "13:20 WIB",
    dibuatOleh: "Budi Hartono",
    status: "menunggu_approval",
    dokumen: "-",
  },
}

const detailItems: Record<string, BarangMasukDetailItem[]> = {
  "BM-2026070001": [
    {
      sku: "SKU-A-001",
      nama: "Laptop ThinkPad T14",
      kategori: "Elektronik",
      rak: "A-01-02",
      satuan: "Unit",
      qty: 10,
      hargaSatuan: 12500000,
    },
    {
      sku: "SKU-A-002",
      nama: "Monitor LG 27 inch",
      kategori: "Elektronik",
      rak: "A-01-04",
      satuan: "Unit",
      qty: 8,
      hargaSatuan: 3400000,
    },
    {
      sku: "SKU-B-001",
      nama: "Keyboard Mechanical",
      kategori: "Aksesoris",
      rak: "B-02-01",
      satuan: "Pcs",
      qty: 25,
      hargaSatuan: 850000,
    },
    {
      sku: "SKU-B-002",
      nama: "Mouse Wireless Logitech",
      kategori: "Aksesoris",
      rak: "B-02-01",
      satuan: "Pcs",
      qty: 30,
      hargaSatuan: 275000,
    },
    {
      sku: "SKU-C-001",
      nama: "Kabel HDMI 2m",
      kategori: "Aksesoris",
      rak: "B-02-03",
      satuan: "Pcs",
      qty: 50,
      hargaSatuan: 45000,
    },
    {
      sku: "SKU-C-002",
      nama: "Router TP-Link AX1500",
      kategori: "Elektronik",
      rak: "A-01-06",
      satuan: "Unit",
      qty: 5,
      hargaSatuan: 620000,
    },
    {
      sku: "SKU-D-001",
      nama: "UPS APC 650VA",
      kategori: "Elektronik",
      rak: "A-02-01",
      satuan: "Unit",
      qty: 3,
      hargaSatuan: 1450000,
    },
    {
      sku: "SKU-D-002",
      nama: "Meja Kerja 120cm",
      kategori: "Furnitur",
      rak: "C-01-01",
      satuan: "Unit",
      qty: 2,
      hargaSatuan: 750000,
    },
  ],
  "BM-2026070002": [
    {
      sku: "SKU-B-001",
      nama: "Keyboard Mechanical",
      kategori: "Aksesoris",
      rak: "B-02-01",
      satuan: "Pcs",
      qty: 15,
      hargaSatuan: 850000,
    },
    {
      sku: "SKU-C-001",
      nama: "Kabel HDMI 2m",
      kategori: "Aksesoris",
      rak: "B-02-03",
      satuan: "Pcs",
      qty: 20,
      hargaSatuan: 45000,
    },
    {
      sku: "SKU-C-002",
      nama: "Router TP-Link AX1500",
      kategori: "Elektronik",
      rak: "A-01-06",
      satuan: "Unit",
      qty: 2,
      hargaSatuan: 620000,
    },
  ],
  "BM-2026070003": [
    {
      sku: "SKU-A-001",
      nama: "Laptop ThinkPad T14",
      kategori: "Elektronik",
      rak: "A-01-02",
      satuan: "Unit",
      qty: 5,
      hargaSatuan: 12500000,
    },
    {
      sku: "SKU-B-002",
      nama: "Mouse Wireless Logitech",
      kategori: "Aksesoris",
      rak: "B-02-01",
      satuan: "Pcs",
      qty: 12,
      hargaSatuan: 275000,
    },
  ],
  "BM-2026070004": [
    {
      sku: "SKU-D-001",
      nama: "UPS APC 650VA",
      kategori: "Elektronik",
      rak: "A-02-01",
      satuan: "Unit",
      qty: 4,
      hargaSatuan: 1450000,
    },
    {
      sku: "SKU-D-002",
      nama: "Meja Kerja 120cm",
      kategori: "Furnitur",
      rak: "C-01-01",
      satuan: "Unit",
      qty: 3,
      hargaSatuan: 750000,
    },
    {
      sku: "SKU-A-002",
      nama: "Monitor LG 27 inch",
      kategori: "Elektronik",
      rak: "A-01-04",
      satuan: "Unit",
      qty: 2,
      hargaSatuan: 3400000,
    },
  ],
  "BM-2026070005": [
    {
      sku: "SKU-A-001",
      nama: "Laptop ThinkPad T14",
      kategori: "Elektronik",
      rak: "A-01-02",
      satuan: "Unit",
      qty: 6,
      hargaSatuan: 12500000,
    },
    {
      sku: "SKU-B-001",
      nama: "Keyboard Mechanical",
      kategori: "Aksesoris",
      rak: "B-02-01",
      satuan: "Pcs",
      qty: 18,
      hargaSatuan: 850000,
    },
    {
      sku: "SKU-C-001",
      nama: "Kabel HDMI 2m",
      kategori: "Aksesoris",
      rak: "B-02-03",
      satuan: "Pcs",
      qty: 40,
      hargaSatuan: 45000,
    },
    {
      sku: "SKU-D-002",
      nama: "Meja Kerja 120cm",
      kategori: "Furnitur",
      rak: "C-01-01",
      satuan: "Unit",
      qty: 4,
      hargaSatuan: 750000,
    },
  ],
  "BM-2026070006": [
    {
      sku: "SKU-A-002",
      nama: "Monitor LG 27 inch",
      kategori: "Elektronik",
      rak: "A-01-04",
      satuan: "Unit",
      qty: 6,
      hargaSatuan: 3400000,
    },
    {
      sku: "SKU-B-002",
      nama: "Mouse Wireless Logitech",
      kategori: "Aksesoris",
      rak: "B-02-01",
      satuan: "Pcs",
      qty: 10,
      hargaSatuan: 275000,
    },
  ],
}

const statusLabel: Record<BarangMasukDetailInfo["status"], string> = {
  disetujui: "Disetujui",
  menunggu_approval: "Menunggu Approval",
  ditolak: "Ditolak",
  draft: "Draft",
}

const statusColor: Record<
  BarangMasukDetailInfo["status"],
  "green" | "yellow" | "red" | "gray"
> = {
  disetujui: "green",
  menunggu_approval: "yellow",
  ditolak: "red",
  draft: "gray",
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val)
}

export default function BarangMasukDetailPage({ params }: PageProps) {
  const router = useRouter()
  const unwrappedParams = use(Promise.resolve(params))
  const noReferensi = unwrappedParams.id

  const info = detailInfo[noReferensi]
  const items = useMemo(() => detailItems[noReferensi] || [], [noReferensi])

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return items.filter((row) => {
      if (!query) return true
      return (
        row.nama.toLowerCase().includes(query) ||
        row.sku.toLowerCase().includes(query) ||
        row.rak.toLowerCase().includes(query)
      )
    })
  }, [items, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredData.slice(start, end)
  }, [filteredData, currentPage])

  const grandTotal = useMemo(() => {
    return filteredData.reduce((sum, row) => sum + row.qty * row.hargaSatuan, 0)
  }, [filteredData])

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
    <>
      <div className="wrapper">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <PageHeader
            items={[
              { label: "Aktivitas Gudang" },
              { label: "Terima Barang (In)", href: "/inventory/barang-masuk" },
              { label: noReferensi },
            ]}
            title={noReferensi}
            icon={BiDownArrowCircle}
            description={`Dibuat oleh ${info.dibuatOleh} · ${info.tanggal} · ${info.waktu}`}
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black">
              <BiFile className="mr-2" />
              Unduh Dokumen
            </Button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-8 grid grid-cols-2 gap-x-8 gap-y-4 rounded-2xl border border-border/50 bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] md:grid-cols-3">
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            No. Referensi
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {noReferensi}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Gudang Asal
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.gudangAsal}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Supplier
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.supplier}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Tanggal
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.tanggal} · {info.waktu}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Status
          </div>
          <div className="mt-1.5">
            <ColoredBadge color={statusColor[info.status]}>
              {statusLabel[info.status]}
            </ColoredBadge>
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">
            Dokumen
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.dokumen}
          </div>
        </div>
      </div>

      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-3">
          <InputSearch
            placeholder="Cari nama barang, SKU, atau lokasi rak..."
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
        <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <TableHeader className="border-b border-border/60 bg-white">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    SKU & Informasi Barang
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Lokasi Rak
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Satuan
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Qty Diterima
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Harga Satuan
                  </TableHead>
                  <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row) => {
                  const total = row.qty * row.hargaSatuan
                  return (
                    <TableRow
                      key={row.sku}
                      className="h-16 border-b border-border/40 hover:bg-muted/30"
                    >
                      <TableCell className="pl-6 whitespace-nowrap">
                        <div className="text-sm leading-none font-semibold text-foreground">
                          {row.nama}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {row.sku} <span className="mx-1">•</span>{" "}
                          {row.kategori}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-semibold whitespace-nowrap text-foreground">
                        {row.rak}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                        {row.satuan}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                        {row.qty}
                      </TableCell>
                      <TableCell className="text-right font-sans text-sm whitespace-nowrap text-foreground">
                        {formatCurrency(row.hargaSatuan)}
                      </TableCell>
                      <TableCell className="pr-6 text-right font-sans text-sm font-semibold whitespace-nowrap text-foreground">
                        {formatCurrency(total)}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-48 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada item yang cocok dengan pencarian Anda.
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
              <TableFooter className="border-t border-border/50 bg-white">
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
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage === totalPages}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                          >
                            &gt;
                          </button>
                        </div>
                      </div>
                      <span>10 per halaman</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </table>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[25px]">
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-6 py-4">
          <div>
            <div className="text-xs font-medium text-muted-foreground">
              Total Item
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {filteredData.reduce((sum, row) => sum + row.qty, 0)} item
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-muted-foreground">
              Total Nilai
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {formatCurrency(grandTotal)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
