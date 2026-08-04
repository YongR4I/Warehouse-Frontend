import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  BiTag,
  BiChevronRight,
  BiDotsVerticalRounded,
  BiSolidReport,
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

interface CategoryItem {
  id: string
  nama: string
  deskripsi: string
  jumlahItem: number
}

interface UnitItem {
  kode: string
  nama: string
}

const kategoriData: CategoryItem[] = [
  {
    id: "1",
    nama: "Material Konstruksi",
    deskripsi: "Bahan bangunan dasar seperti semen, pasir, dan batu bata",
    jumlahItem: 142,
  },
  {
    id: "2",
    nama: "Besi & Baja",
    deskripsi: "Logam, besi beton, alur, dan sejenisnya",
    jumlahItem: 85,
  },
  {
    id: "3",
    nama: "Cat & Finishing",
    deskripsi: "Pelapis, cat tembok, kape, dan perlakuan permukaan",
    jumlahItem: 64,
  },
]

const satuanData: UnitItem[] = [
  {
    kode: "SAK",
    nama: "Sak / Karung 50kg",
  },
  {
    kode: "BTG",
    nama: "Batang",
  },
  {
    kode: "GLN",
    nama: "Galon",
  },
  {
    kode: "PCS",
    nama: "Pcs / Buah",
  },
]

export default function KategoriPage() {
  const totalKategori = kategoriData.length
  const totalItem = kategoriData.reduce((sum, item) => sum + item.jumlahItem, 0)
  const totalSatuan = satuanData.length

  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Data Master" },
              { label: "Kategori & Satuan Unit" },
            ]}
            title="Kategori & Satuan Unit"
            icon={BiTag}
            description="Atur kategori barang dan satuan ukurnya."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black">
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[35px]">
        <Button variant="default">+ Tambah Kategori</Button>
      </div>

      <div className="wrapper mt-[15px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Nama Kategori
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Deskripsi / Keterangan
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Jumlah Item
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kategoriData.map((row) => (
              <TableRow
                key={row.id}
                className="h-16 border-b border-border/40 hover:bg-muted/30"
              >
                <TableCell className="pl-6 font-sans text-sm text-foreground">
                  {row.nama}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground/80">
                  {row.deskripsi}
                </TableCell>
                <TableCell className="text-center font-sans text-sm text-foreground">
                  {row.jumlahItem}
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
              <TableCell colSpan={4} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Total Kategori: {totalKategori} | Total Item: {totalItem}{" "}
                    Item
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="wrapper mt-[40px]">
        <Button variant="default">+ Tambah Satuan Unit (UOM)</Button>
      </div>

      <div className="wrapper mt-[15px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Kode
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Nama Satuan / UOM
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {satuanData.map((row) => (
              <TableRow
                key={row.kode}
                className="h-16 border-b border-border/40 hover:bg-muted/30"
              >
                <TableCell className="pl-6 font-sans text-sm text-foreground">
                  {row.kode}
                </TableCell>
                <TableCell className="text-center font-sans text-sm text-foreground">
                  {row.nama}
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
              <TableCell colSpan={3} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>Total Satuan / UOM: {totalSatuan} Kode Satuan</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </>
  )
}
