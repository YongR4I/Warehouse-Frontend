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
  BiPackage,
  BiTargetLock,
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
    tanggalAudit: "29 Jul 2026",
    noOpname: "SO-20260729-01",
    namaGudang: "Gudang Utama",
    kodeRak: "RAK-A1",
    kodeSku: "SKU-ELK-001",
    namaBarang: "Monitor LED 24 Inch",
    kategori: "Electronics",
    stokSistem: 50,
    stokFisik: 42,
    selisih: -8,
    satuan: "Unit",
    statusRekons: "Defisit (Kurang)",
    petugasAudit: "Budi Santoso",
  },
  {
    tanggalAudit: "29 Jul 2026",
    noOpname: "SO-20260729-02",
    namaGudang: "Gudang Utama",
    kodeRak: "RAK-C2",
    kodeSku: "SKU-FUR-012",
    namaBarang: "Kursi Kerja Ergonomis",
    kategori: "Furniture",
    stokSistem: 15,
    stokFisik: 20,
    selisih: 5,
    satuan: "Pcs",
    statusRekons: "Surplus (Lebih)",
    petugasAudit: "Dedi Kurniawan",
  },
  {
    tanggalAudit: "29 Jul 2026",
    noOpname: "SO-20260729-03",
    namaGudang: "Gudang Transit",
    kodeRak: "RAK-B3",
    kodeSku: "SKU-ATK-088",
    namaBarang: "Kertas HVS A4 80gsm",
    kategori: "ATK",
    stokSistem: 100,
    stokFisik: 90,
    selisih: -10,
    satuan: "Rim",
    statusRekons: "Perlu Investigasi",
    petugasAudit: "Ahmad Fauzi",
  },
  {
    tanggalAudit: "28 Jul 2026",
    noOpname: "SO-20260728-01",
    namaGudang: "Gudang Utama",
    kodeRak: "RAK-A3",
    kodeSku: "SKU-ELK-005",
    namaBarang: "Keyboard Mekanikal Wireless",
    kategori: "Electronics",
    stokSistem: 200,
    stokFisik: 200,
    selisih: 0,
    satuan: "Box",
    statusRekons: "Akurat (Klop)",
    petugasAudit: "Eko Prasetyo",
  },
] as const

export default function LaporanSelisihOpnamePage() {
  return (
    <>
      {/* Header Section */}
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[{ label: "Aktivitas Gudang" }, { label: "Selisih Opname" }]}
            title="Laporan Selisih Opname"
            icon={BiBarChartAlt2}
            description="Laporan perbedaan stok sistem versus fisik."
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
          {/* Card 1: Total Item Diperiksa */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiPackage className="size-4 text-zinc-500" />
                <span className="text-sm font-medium text-foreground">
                  Total Item Diperiksa
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    450
                  </span>
                  <span className="text-xs text-muted-foreground">
                    SKU / 3 Gudang
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sesi Audit Tanggal 29 Jul 2026
                </p>
              </div>
            </div>
          </Card>

          {/* Card 2: Total Selisih Minus (Defisit) */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiTrendingDown className="size-4 text-rose-500" />
                <span className="text-sm font-medium text-foreground">
                  Total Selisih Minus (Defisit)
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    -18
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Unit (3 SKU)
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Estimasi Kerugian: Rp 2.450.000
                </p>
              </div>
            </div>
          </Card>

          {/* Card 3: Total Selisih Plus (Surplus) */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiTrendingUp className="size-4 text-emerald-500" />
                <span className="text-sm font-medium text-foreground">
                  Total Selisih Plus (Surplus)
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">+5</span>
                  <span className="text-xs text-muted-foreground">
                    Unit (1 SKU)
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Potensi Salah Catat Penerimaan
                </p>
              </div>
            </div>
          </Card>

          {/* Card 4: Tingkat Akurasi Stok */}
          <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex h-full flex-col justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <BiTargetLock className="size-4 text-blue-500" />
                <span className="text-sm font-medium text-foreground">
                  Tingkat Akurasi Stok
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    98.2%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Sesuai Fisik
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  446 SKU Klop Sesuai Sistem
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
            placeholder="Cari NIK, nama, atau nomor HP..."
            className="flex-1"
          />
          <button className="flex h-[42px] shrink-0 items-center gap-2 rounded-2xl border border-border bg-card px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/30">
            <span>02 Agu 2026</span>
            <BiCalendar className="size-4 text-muted-foreground/80" />
          </button>
          <Opsion
            placeholder="Semua Status Selisih"
            options={[
              { value: "all", label: "Semua Status Selisih" },
              { value: "defisit", label: "Defisit (Kurang)" },
              { value: "surplus", label: "Surplus (Lebih)" },
              { value: "akurat", label: "Akurat (Klop)" },
              { value: "investigasi", label: "Perlu Investigasi" },
            ]}
          />
        </div>
      </div>

      {/* Table Section - scrollable container with min-w to prevent overlapping and keep layout locked */}
      <div className="wrapper mt-[25px] w-full min-w-0">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1756px] table-fixed caption-bottom text-sm">
              <TableHeader className="border-b border-border/60 bg-white">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="w-[120px] pl-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Tanggal Audit
                  </TableHead>
                  <TableHead className="w-[160px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    No. Opname
                  </TableHead>
                  <TableHead className="w-[140px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Nama Gudang
                  </TableHead>
                  <TableHead className="w-[110px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Kode Rak
                  </TableHead>
                  <TableHead className="w-[130px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Kode SKU
                  </TableHead>
                  <TableHead className="w-[220px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Nama Barang
                  </TableHead>
                  <TableHead className="w-[120px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Kategori
                  </TableHead>
                  <TableHead className="w-[100px] text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Stok Sistem
                  </TableHead>
                  <TableHead className="w-[100px] text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Stok Fisik
                  </TableHead>
                  <TableHead className="w-[100px] text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Selisih (Qty)
                  </TableHead>
                  <TableHead className="w-[90px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Satuan
                  </TableHead>
                  <TableHead className="w-[160px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Status Rekons.
                  </TableHead>
                  <TableHead className="w-[150px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Petugas Audit
                  </TableHead>
                  <TableHead className="w-[56px] pr-6 text-right text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    {/* Action column header */}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="min-h-[300px]">
                {dummyData.map((row) => (
                  <TableRow
                    key={row.noOpname}
                    className="h-16 border-b border-border/40 hover:bg-muted/30"
                  >
                    <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                      {row.tanggalAudit}
                    </TableCell>
                    <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-foreground">
                      {row.noOpname}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.namaGudang}
                    </TableCell>
                    <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-muted-foreground">
                      {row.kodeRak}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                      {row.kodeSku}
                    </TableCell>
                    <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-foreground">
                      {row.namaBarang}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                      {row.kategori}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                      {row.stokSistem}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                      {row.stokFisik}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm font-semibold whitespace-nowrap">
                      {row.selisih > 0 ? (
                        <span className="text-blue-600">+{row.selisih}</span>
                      ) : row.selisih < 0 ? (
                        <span className="text-rose-600">{row.selisih}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          {row.selisih}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                      {row.satuan}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap">
                      {row.statusRekons === "Defisit (Kurang)" && (
                        <ColoredBadge color="red">
                          Defisit (Kurang)
                        </ColoredBadge>
                      )}
                      {row.statusRekons === "Surplus (Lebih)" && (
                        <ColoredBadge color="blue">
                          Surplus (Lebih)
                        </ColoredBadge>
                      )}
                      {row.statusRekons === "Perlu Investigasi" && (
                        <ColoredBadge color="yellow">
                          Perlu Investigasi
                        </ColoredBadge>
                      )}
                      {row.statusRekons === "Akurat (Klop)" && (
                        <ColoredBadge color="green">Akurat (Klop)</ColoredBadge>
                      )}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.petugasAudit}
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
                    <TableCell colSpan={14} className="border-none p-0" />
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
