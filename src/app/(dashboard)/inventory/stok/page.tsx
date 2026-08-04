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

interface StockMovement {
  tanggal: string
  tipeTransaksi: "Stok Opname" | "Keluar Barang" | "Mutasi Stok" | "Terima Barang"
  noReferensi: string
  lokasiGudang: { asal: string; tujuan?: string }
  pergerakanQty: number
  saldoAkhir: number
  satuan: string
  dibuatOleh: string
}

const dummyData: StockMovement[] = [
  {
    tanggal: "27 Jul 2026 14:20 WIB",
    tipeTransaksi: "Stok Opname",
    noReferensi: "SO-2026070088",
    lokasiGudang: { asal: "Gudang Pusat" },
    pergerakanQty: 0,
    saldoAkhir: 50,
    satuan: "Unit",
    dibuatOleh: "Andi Wijaya",
  },
  {
    tanggal: "22 Jul 2026 09:15 WIB",
    tipeTransaksi: "Keluar Barang",
    noReferensi: "BK-2026070019",
    lokasiGudang: { asal: "Gudang Pusat" },
    pergerakanQty: -2,
    saldoAkhir: 50,
    satuan: "Unit",
    dibuatOleh: "Andi Wijaya",
  },
  {
    tanggal: "18 Jul 2026 11:00 WIB",
    tipeTransaksi: "Mutasi Stok",
    noReferensi: "MT-2026070031",
    lokasiGudang: { asal: "Gudang Pusat", tujuan: "Timur" },
    pergerakanQty: -3,
    saldoAkhir: 52,
    satuan: "Unit",
    dibuatOleh: "Rina Sari",
  },
  {
    tanggal: "10 Jul 2026 08:30 WIB",
    tipeTransaksi: "Terima Barang",
    noReferensi: "BM-2026070002",
    lokasiGudang: { asal: "Gudang Pusat" },
    pergerakanQty: 10,
    saldoAkhir: 55,
    satuan: "Unit",
    dibuatOleh: "Budi Hartono",
  },
  {
    tanggal: "05 Jul 2026 16:45 WIB",
    tipeTransaksi: "Keluar Barang",
    noReferensi: "BK-2026070008",
    lokasiGudang: { asal: "Gudang Pusat" },
    pergerakanQty: -5,
    saldoAkhir: 45,
    satuan: "Unit",
    dibuatOleh: "Andi Wijaya",
  },
  {
    tanggal: "01 Jul 2026 10:00 WIB",
    tipeTransaksi: "Terima Barang",
    noReferensi: "BM-2026070001",
    lokasiGudang: { asal: "Gudang Timur" },
    pergerakanQty: 50,
    saldoAkhir: 50,
    satuan: "Unit",
    dibuatOleh: "Budi Hartono",
  },
]

export default function StokPage() {
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
            <Button variant="outline-black">
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
                className="h-16 border-b border-border/40 hover:bg-muted/30"
              >
                <TableCell className="pl-6 font-sans text-sm text-foreground">
                  {row.tanggal}
                </TableCell>
                <TableCell className="font-sans text-sm">
                  {row.tipeTransaksi === "Stok Opname" && (
                    <span className="inline-flex items-center rounded-[6px] bg-[#EEF2FF] px-2.5 py-1 text-xs font-semibold text-[#4F46E5]">
                      Stok Opname
                    </span>
                  )}
                  {row.tipeTransaksi === "Keluar Barang" && (
                    <span className="inline-flex items-center rounded-[6px] bg-[#FEF3C7] px-2.5 py-1 text-xs font-semibold text-[#B45309]">
                      Keluar Barang
                    </span>
                  )}
                  {row.tipeTransaksi === "Mutasi Stok" && (
                    <span className="inline-flex items-center rounded-[6px] bg-[#F3E8FF] px-2.5 py-1 text-xs font-semibold text-[#9333EA]">
                      Mutasi Stok
                    </span>
                  )}
                  {row.tipeTransaksi === "Terima Barang" && (
                    <span className="inline-flex items-center rounded-[6px] bg-[#D1FAE5] px-2.5 py-1 text-xs font-semibold text-[#065F46]">
                      Terima Barang
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-sans text-sm">
                  <span className="cursor-pointer font-medium text-[#3B82F6] transition-colors hover:text-[#2563EB] hover:underline">
                    {row.noReferensi}
                  </span>
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
    </>
  )
}
