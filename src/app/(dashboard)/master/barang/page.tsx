import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import Image from "next/image"
import {
  BiPackage,
  BiCartAdd,
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
import { ColoredBadge } from "@/components/ui/colored-badge"

interface ProductItem {
  id: string
  nama: string
  sku: string
  kategori: string
  stokMin: number
  totalStok: number
  satuan: string
  dokumen: string
  status: "aktif" | "nonaktif"
  image: string
}

const dummyData: ProductItem[] = [
  {
    id: "1",
    nama: "Semen Tiga Roda 50kg",
    sku: "BRG-001",
    kategori: "Material Konstruksi",
    stokMin: 20,
    totalStok: 150,
    satuan: "Sak",
    dokumen: "2 File",
    status: "aktif",
    image: "/semen.png",
  },
  {
    id: "2",
    nama: "Besi Beton 10mm",
    sku: "BRG-002",
    kategori: "Material Konstruksi",
    stokMin: 50,
    totalStok: 250,
    satuan: "Batang",
    dokumen: "1 File",
    status: "aktif",
    image: "/besi.png",
  },
  {
    id: "3",
    nama: "Cat Tembok Putih 5kg",
    sku: "BRG-003",
    kategori: "Finishing & Cat",
    stokMin: 15,
    totalStok: 80,
    satuan: "Kaleng",
    dokumen: "3 File",
    status: "aktif",
    image: "/cat.png",
  },
  {
    id: "4",
    nama: "Pipa PVC 3 Inch",
    sku: "BRG-004",
    kategori: "Plumbing & Pipa",
    stokMin: 30,
    totalStok: 120,
    satuan: "Batang",
    dokumen: "-",
    status: "nonaktif",
    image: "/pipa.png",
  },
]

export default function BarangPage() {
  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[{ label: "Data Master" }, { label: "Daftar Barang & SKU" }]}
            title="Daftar Barang & SKU"
            icon={BiPackage}
            description="Kelola data barang dan SKU di gudang."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black">Export Excel/Pdf</Button>
            <Button variant="default">
              <BiCartAdd className="mr-2" />+ Tambah Barang
            </Button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari nama barang atau kode..."
            className="flex-1"
          />
          <Opsion
            placeholder="Semua Kategori"
            options={[
              { value: "all", label: "Semua Kategori" },
              { value: "1", label: "Material Bangunan" },
              { value: "2", label: "Cat & Pelapis" },
              { value: "3", label: "Plumbing" },
              { value: "4", label: "Elektrikal" },
            ]}
          />
          <Opsion
            placeholder="Semua Status"
            options={[
              { value: "all", label: "Semua Status" },
              { value: "aktif", label: "Aktif" },
              { value: "nonaktif", label: "Nonaktif" },
            ]}
          />
        </div>
      </div>

      <div className="wrapper mt-[25px] min-w-0">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Barang
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                SKU
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Kategori
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Stok Min
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Total Stok
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Dokumen
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Status
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="min-h-[300px]">
            {dummyData.map((row, index) => (
              <TableRow
                key={`${row.id}-${index}`}
                className="h-16 border-b border-border/40 hover:bg-muted/30"
              >
                <TableCell className="pl-6 font-sans text-sm text-foreground">
                  <div className="flex items-center gap-3">
                    <Image
                      src={row.image}
                      alt={row.nama}
                      width={40}
                      height={40}
                      className="shrink-0 rounded-[6px] border border-border/40 object-cover"
                    />
                    <span className="text-foreground">{row.nama}</span>
                  </div>
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.sku}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.kategori}
                </TableCell>
                <TableCell className="text-center font-sans text-sm text-foreground">
                  {row.stokMin}
                </TableCell>
                <TableCell className="text-center font-sans text-sm text-foreground">
                  {`${row.totalStok} ${row.satuan}`}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  {row.dokumen !== "-" ? (
                    <span className="inline-flex cursor-pointer items-center gap-0.5 rounded-[4px] border border-border/80 bg-card px-1.5 py-0.5 text-[11px] leading-none whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent/10">
                      <BiFile className="size-3 shrink-0 animate-none text-muted-foreground/80" />
                      <span>{row.dokumen}</span>
                    </span>
                  ) : (
                    <span className="font-sans text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  <ColoredBadge
                    color={row.status === "aktif" ? "green" : "gray"}
                  >
                    {row.status === "aktif" ? "Aktif" : "Nonaktif"}
                  </ColoredBadge>
                </TableCell>
                <TableCell className="pr-6 text-right whitespace-nowrap">
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
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>Total Kuantitas Stok: 515 Unit Barang</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </>
  )
}
