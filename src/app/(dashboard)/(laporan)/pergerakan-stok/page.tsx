import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import {
  BiSolidReport,
  BiBarChartAlt2,
  BiRightArrowAlt,
  BiChevronRight,
  BiDotsVerticalRounded,
  BiFile,
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
import { StatusBadge } from "@/components/badge"

const dummyData = [
  {
    noReferensi: "MT-2026070031",
    ruteMutasi: { asal: "Gudang Pusat", tujuan: "Gudang Timur" },
    barang: "Semen Portland 50kg",
    qty: 50,
    tanggal: "20 Jul 2026",
    dibuatOleh: "Andi Wijaya",
    status: "disetujui",
    dokumen: "2 File",
  },
  {
    noReferensi: "MT-2026070033",
    ruteMutasi: { asal: "Gudang Selatan", tujuan: "Gudang Pusat" },
    barang: "Besi Beton 10mm",
    qty: 120,
    tanggal: "21 Jul 2026",
    dibuatOleh: "Rina Sari",
    status: "menunggu_approval",
    dokumen: "1 File",
  },
  {
    noReferensi: "MT-2026070035",
    ruteMutasi: { asal: "Gudang Pusat", tujuan: "Gudang Selatan" },
    barang: "Cat Tembok 5L",
    qty: 15,
    tanggal: "22 Jul 2026",
    dibuatOleh: "Budi Hartono",
    status: "draft",
    dokumen: "-",
  },
  {
    noReferensi: "MT-2026070037",
    ruteMutasi: { asal: "Gudang Timur", tujuan: "Gudang Pusat" },
    barang: "Pipa PVC 3 inch",
    qty: 30,
    tanggal: "23 Jul 2026",
    dibuatOleh: "Andi Wijaya",
    status: "ditolak",
    dokumen: "1 File",
  },
  {
    noReferensi: "MT-2026070039",
    ruteMutasi: { asal: "Gudang Pusat", tujuan: "Gudang Timur" },
    barang: "Paku Beton 5cm",
    qty: 80,
    tanggal: "24 Jul 2026",
    dibuatOleh: "Rina Sari",
    status: "disetujui",
    dokumen: "1 File",
  },
  {
    noReferensi: "MT-2026070041",
    ruteMutasi: { asal: "Gudang Selatan", tujuan: "Gudang Timur" },
    barang: "Kabel NYM 2 x 1.5",
    qty: 10,
    tanggal: "24 Jul 2026",
    dibuatOleh: "Budi Hartono",
    status: "menunggu_approval",
    dokumen: "-",
  },
] as const

export default function LaporanPage() {
  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Pergerakan Stok" },
            ]}
            title="Laporan Pergerakan Stok"
            icon={BiBarChartAlt2}
            description="Laporan arus keluar-masuk stok barang."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black">
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
            <Button variant="default">+ Terima Barang Baru</Button>
          </div>
        </div>
      </div>
      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch placeholder="Cari barang..." className="flex-1" />
          <Opsion
            options={[
              { value: "all", label: "Semua Gudang" },
              { value: "1", label: "Gudang A" },
              { value: "2", label: "Gudang B" },
            ]}
          />
          <Opsion
            placeholder="Semua Status"
            options={[
              { value: "all", label: "Semua Status" },
              { value: "disetujui", label: "Disetujui" },
              { value: "menunggu", label: "Menunggu Approval" },
              { value: "ditolak", label: "Ditolak" },
              { value: "draft", label: "Draft" },
            ]}
          />
        </div>
      </div>
      <div className="wrapper mt-[25px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                No. referensi
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Rute mutasi
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Barang
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Qty
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Tanggal
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Dibuat oleh
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Status
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Dokumen
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
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
                  {row.noReferensi}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  <div className="flex items-center gap-1.5">
                    <span>{row.ruteMutasi.asal}</span>
                    <BiRightArrowAlt className="size-4 shrink-0 text-muted-foreground" />
                    <span>{row.ruteMutasi.tujuan}</span>
                  </div>
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.barang}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.qty}
                </TableCell>
                <TableCell className="font-sans text-sm text-muted-foreground">
                  {row.tanggal}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.dibuatOleh}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  {row.dokumen !== "-" ? (
                    <span className="inline-flex cursor-pointer items-center gap-0.5 rounded-[4px] border border-border/80 bg-card px-1.5 py-0.5 text-[11px] leading-none whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent/10">
                      <BiFile className="size-3 text-muted-foreground/80" />
                      <span>{row.dokumen}</span>
                    </span>
                  ) : (
                    <span className="font-sans text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <div className="flex items-center justify-end gap-1 text-muted-foreground">
                    <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                      <BiChevronRight className="size-4 text-foreground/75" />
                    </button>
                    <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                      <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {dummyData.length < 5 && (
              <TableRow
                style={{ height: `${300 - dummyData.length * 64}px` }}
                className="pointer-events-none border-none hover:bg-transparent"
              >
                <TableCell colSpan={9} className="border-none p-0" />
              </TableRow>
            )}
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={9} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>Menampilkan 1-6 dari 19 data</span>
                  <div className="flex items-center">
                    <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                      <button className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted">
                        &lt;
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
                        &gt;
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
