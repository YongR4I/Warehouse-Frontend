import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { Card } from "@/components/ui/card"
import {
  BiSolidReport,
  BiBarChartAlt2,
  BiChevronRight,
  BiChevronLeft,
  BiCalendar,
  BiTrendingDown,
  BiTrendingUp,
  BiTransfer,
  BiPackage,
} from "react-icons/bi"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

const dummyData = [
  {
    waktuTanggal: "29 Jul 2026 - 10:15",
    noReferensi: "TRX-IN-20260729-01",
    tipeArus: "Barang Masuk",
    kodeSku: "SKU-ELK-01",
    namaBarang: "Monitor LED 24 Inch",
    lokasiAsal: "Pemasok Utama (External)",
    lokasiTujuan: "Gudang Utama - Rak A1",
    qty: 120,
    satuan: "Unit",
    petugas: "Budi Santoso",
  },
  {
    waktuTanggal: "29 Jul 2026 - 09:40",
    noReferensi: "TRX-OUT-20260729-04",
    tipeArus: "Barang Keluar",
    kodeSku: "SKU-FUR-03",
    namaBarang: "Kursi Kerja Ergonomis",
    lokasiAsal: "Gudang Transit - Rak C2",
    lokasiTujuan: "Pelanggan (PT Maju Jaya)",
    qty: -12,
    satuan: "Pcs",
    petugas: "Dedi Kurniawan",
  },
  {
    waktuTanggal: "29 Jul 2026 - 08:30",
    noReferensi: "MUT-20260729-02",
    tipeArus: "Mutasi Rak",
    kodeSku: "SKU-ATK-05",
    namaBarang: "Kertas HVS A4 80gsm",
    lokasiAsal: "Gudang Utama - Rak B3",
    lokasiTujuan: "Gudang Bahan - Rak C1",
    qty: 100,
    satuan: "Rim",
    petugas: "Ahmad Fauzi",
  },
  {
    waktuTanggal: "28 Jul 2026 - 16:50",
    noReferensi: "TRX-IN-20260728-12",
    tipeArus: "Barang Masuk",
    kodeSku: "SKU-MCH-02",
    namaBarang: "Keyboard Mekanikal Wireless",
    lokasiAsal: "Vendor Import",
    lokasiTujuan: "Gudang Utama - Rak A2",
    qty: 50,
    satuan: "Box",
    petugas: "Eko Prasetyo",
  },
] as const

export default function LaporanPage() {
  return (
    <>
      {/* Header Section */}
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Aktivitas Gudang" },
              { label: "Pergerakan Stok" },
            ]}
            title="Pergerakan Stok"
            icon={BiBarChartAlt2}
            description="Laporan arus keluar-masuk dan mutasi stok barang secara real-time."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black">
              <BiSolidReport className="mr-2" />
              Export (.excel/.pdf)
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Section - Plain Boxes without color accents */}
      <div className="wrapper mt-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {/* Card 1: Total Barang Masuk */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiTrendingDown className="size-4 text-emerald-500" />
                <span className="text-sm font-medium text-foreground">
                  Total Barang Masuk
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    1,240
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Unit / 8 PO
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Didominasi Kategori Electronics (65%)
                </p>
              </div>
            </div>
          </Card>

          {/* Card 2: Total Barang Keluar */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiTrendingUp className="size-4 text-rose-500" />
                <span className="text-sm font-medium text-foreground">
                  Total Barang Keluar
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    850
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Unit / 14 Surat Jalan
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  92% Pengiriman Siap Kumpul (Packed)
                </p>
              </div>
            </div>
          </Card>

          {/* Card 3: Internal Mutasi Rak */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiTransfer className="size-4 text-blue-500" />
                <span className="text-sm font-medium text-foreground">
                  Internal Mutasi Rak
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    320
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Pcs / 3 Sesi
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Restock Rak Atas Area Picking B2
                </p>
              </div>
            </div>
          </Card>

          {/* Card 4: Retur / Selisih Stok */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiPackage className="size-4 text-zinc-500" />
                <span className="text-sm font-medium text-foreground">
                  Retur / Selisih Stok
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">0</span>
                  <span className="text-xs text-muted-foreground">
                    Item Rusak
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Semua barang terverifikasi akurat
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filter Section */}
      <div className="wrapper mt-8">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari no. referensi, nama barang, atau SKU..."
            className="flex-1"
          />
          <button className="flex h-[42px] shrink-0 items-center gap-2 rounded-2xl border border-border bg-card px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/30">
            <span>02 Agu 2026</span>
            <BiCalendar className="size-4 text-muted-foreground/80" />
          </button>
          <Opsion
            placeholder="Semua Tipe Arus"
            options={[
              { value: "all", label: "Semua Tipe Arus" },
              { value: "masuk", label: "Barang Masuk" },
              { value: "keluar", label: "Barang Keluar" },
              { value: "mutasi", label: "Mutasi Rak" },
            ]}
          />
        </div>
      </div>

      {/* Table Section - scrollable container with min-w to prevent overlapping and keep layout locked */}
      <div className="wrapper mt-[25px] w-full min-w-0">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1560px] table-fixed caption-bottom text-sm">
              <TableHeader className="border-b border-border/60 bg-white">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="w-[150px] pl-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Waktu & Tanggal
                  </TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    No. Referensi
                  </TableHead>
                  <TableHead className="w-[130px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Tipe Arus
                  </TableHead>
                  <TableHead className="w-[110px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Kode SKU
                  </TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Nama Barang
                  </TableHead>
                  <TableHead className="w-[200px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Lokasi Asal
                  </TableHead>
                  <TableHead className="w-[200px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Lokasi Tujuan
                  </TableHead>
                  <TableHead className="w-[90px] text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Jumlah (Qty)
                  </TableHead>
                  <TableHead className="w-[80px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Satuan
                  </TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Petugas Penanggung Jawab
                  </TableHead>
                  <TableHead className="w-[56px] pr-6 text-right text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    {/* Action column header */}
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
                      {row.waktuTanggal}
                    </TableCell>
                    <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-foreground">
                      {row.noReferensi}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap">
                      {row.tipeArus === "Barang Masuk" && (
                        <ColoredBadge color="green">Barang Masuk</ColoredBadge>
                      )}
                      {row.tipeArus === "Barang Keluar" && (
                        <ColoredBadge color="red">Barang Keluar</ColoredBadge>
                      )}
                      {row.tipeArus === "Mutasi Rak" && (
                        <ColoredBadge color="purple">Mutasi Rak</ColoredBadge>
                      )}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                      {row.kodeSku}
                    </TableCell>
                    <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-foreground">
                      {row.namaBarang}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.lokasiAsal}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.lokasiTujuan}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm font-semibold whitespace-nowrap">
                      {row.qty > 0 ? (
                        <span className="text-emerald-600">+{row.qty}</span>
                      ) : row.qty < 0 ? (
                        <span className="text-rose-600">{row.qty}</span>
                      ) : (
                        <span className="text-muted-foreground">{row.qty}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                      {row.satuan}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.petugas}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <button className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <BiChevronRight className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {dummyData.length < 5 && (
                  <TableRow
                    style={{ height: `${300 - dummyData.length * 64}px` }}
                    className="pointer-events-none border-none hover:bg-transparent"
                  >
                    <TableCell colSpan={11} className="border-none p-0" />
                  </TableRow>
                )}
              </TableBody>
            </table>
          </div>
          <div className="flex h-14 items-center justify-between border-t border-border/50 bg-white px-6 font-sans text-xs text-muted-foreground">
            <span>Menampilkan 1-4 dari 19 data</span>
            <div className="flex items-center">
              <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                <button className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted">
                  <BiChevronLeft className="size-4" />
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
                  <BiChevronRight className="size-4" />
                </button>
              </div>
            </div>
            <span>10 per halaman</span>
          </div>
        </div>
      </div>
    </>
  )
}
