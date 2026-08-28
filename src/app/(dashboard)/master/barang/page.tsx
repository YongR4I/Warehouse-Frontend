"use client"

import { useState, useDeferredValue } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api"
import { statusColor, statusLabel, formatNumber } from "@/lib/status"
import { useApiList, useApiDelete } from "@/hooks/use-api"
import { useOptions, toOptions } from "@/hooks/use-options"
import { useConfirmDialog } from "@/components/confirm-dialog"
import type { Barang, Kategori } from "@/types"
import {
  BiPackage,
  BiCartAdd,
  BiDotsVerticalRounded,
  BiEditAlt,
  BiTrash,
  BiTimeFive,
} from "react-icons/bi"
import { StockCardDrawer } from "@/components/stock-card/stock-card-drawer"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import { BarangForm } from "@/components/barang/barang-form"
import { ExportModal } from "@/components/export-modal"
import { TableSkeletonRows } from "@/components/skeletons"

const PER_PAGE = 15

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
]

export default function BarangPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [stockCardOpen, setStockCardOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null)
  const [selectedStockCardBarang, setSelectedStockCardBarang] =
    useState<Barang | null>(null)
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [page, setPage] = useState(1)
  const [kategoriFilter, setKategoriFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const { data, isLoading } = useApiList<Barang>({
    key: "barang",
    url: "/barang",
    params: { page, per_page: PER_PAGE, search: deferredSearch || undefined },
  })

  const deleteBarang = useApiDelete("barang", "/barang")

  const barangs = data?.data ?? []
  const meta = data?.meta

  const { items: kategoris } = useOptions<Kategori>("kategori", "/kategori")
  const kategoriOptions = [
    { value: "all", label: "Semua Kategori" },
    ...toOptions(kategoris),
  ]

  const filteredBarangs = barangs.filter((row) => {
    const matchKategori =
      kategoriFilter === "all" || String(row.kategori_id) === kategoriFilter
    const matchStatus = statusFilter === "all" || row.status === statusFilter
    return matchKategori && matchStatus
  })

  const { confirm, ConfirmDialog } = useConfirmDialog()

  const handleDelete = (barang: Barang) => {
    confirm({
      title: "Hapus Data Barang",
      itemName: `${barang.sku} - ${barang.nama}`,
      description:
        "Apakah Anda yakin ingin menghapus barang ini? Data master barang dan konfigurasi stok terkait akan dihapus.",
      confirmLabel: "Ya, Hapus Barang",
      onConfirm: async () => {
        try {
          const response = await deleteBarang.mutateAsync(barang.id)
          toast.success(response.message)
        } catch (error) {
          toast.error(getErrorMessage(error))
        }
      },
    })
  }

  const renderPagination = () => {
    const lastPage = meta?.last_page ?? 1
    if (lastPage <= 1) return null
    const buttons = []
    for (let i = 1; i <= lastPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 font-medium transition-colors last:border-r-0 ${
            page === i
              ? "bg-muted/60 text-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {i}
        </button>
      )
    }
    return (
      <div className="flex items-center">
        <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            &lt;
          </button>
          {buttons}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= lastPage}
            className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            &gt;
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {ConfirmDialog}
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[{ label: "Data Master" }, { label: "Daftar Barang & SKU" }]}
            title="Daftar Barang & SKU "
            icon={BiPackage}
            description="Kelola data barang dan SKU di gudang."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              Export Excel/Pdf
            </Button>
            <Button variant="default" onClick={() => setDrawerOpen(true)}>
              <BiCartAdd className="mr-2" />+ Tambah Barang
            </Button>
          </div>
        </div>
      </div>

      <BarangForm
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open)
          if (!open) setSelectedBarang(null)
        }}
        initialData={selectedBarang}
      />

      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari nama barang atau kode..."
            className="flex-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <Opsion
            placeholder="Semua Kategori"
            value={kategoriFilter}
            onValueChange={(val) => setKategoriFilter(val ?? "all")}
            options={kategoriOptions}
          />
          <Opsion
            placeholder="Semua Status"
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val ?? "all")}
            options={statusOptions}
          />
        </div>
      </div>

      <div className="wrapper mt-[25px] min-w-0">
        <Table>
          <TableHeader className="border-b border-border/60 bg-card">
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
            {isLoading ? (
              <TableSkeletonRows columns={8} rows={PER_PAGE} />
            ) : filteredBarangs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              filteredBarangs.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-16 border-b border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-sans text-sm text-foreground">
                    <div className="flex items-center gap-3">
                      {row.foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.foto}
                          alt={row.nama}
                          width={40}
                          height={40}
                          className="shrink-0 rounded-[6px] border border-border/40 object-cover"
                        />
                      ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-[6px] border border-border/40 bg-muted">
                          <BiPackage className="size-5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-foreground">{row.nama}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.sku}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.kategori?.nama ?? "-"}
                  </TableCell>
                  <TableCell className="text-center font-sans text-sm text-foreground">
                    {formatNumber(row.min_stok)}
                  </TableCell>
                  <TableCell className="text-center font-sans text-sm text-foreground">
                    -
                  </TableCell>
                  <TableCell className="text-center font-sans text-sm text-muted-foreground">
                    -
                  </TableCell>
                  <TableCell className="text-center font-sans text-sm">
                    <ColoredBadge color={statusColor(row.status)}>
                      {statusLabel(row.status)}
                    </ColoredBadge>
                  </TableCell>
                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors outline-none hover:bg-muted">
                          <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Aksi Barang</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedStockCardBarang(row)
                              setStockCardOpen(true)
                            }}
                          >
                            <BiTimeFive />
                            <span>Kartu Stok</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBarang(row)
                              setDrawerOpen(true)
                            }}
                          >
                            <BiEditAlt />
                            <span>Ubah Data</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(row)}
                          >
                            <BiTrash />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-card">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between gap-4 bg-card px-6 font-sans text-xs text-muted-foreground">
                  <span>Total Barang: {meta?.total ?? 0} SKU Barang</span>
                  {renderPagination()}
                  <span>{PER_PAGE} per halaman</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <StockCardDrawer
        open={stockCardOpen}
        onOpenChange={setStockCardOpen}
        barang={selectedStockCardBarang}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Data Barang & SKU"
        totalItemsCount={meta?.total ?? 0}
        totalItemsLabel="Total SKU"
        filterLabel="Semua Gudang"
        exportUrl={`/barang/export/excel?search=${search}`}
        checkboxes={[
          {
            id: "sku",
            label: "Kode SKU & Barcode",
            defaultChecked: true,
          },
          {
            id: "category",
            label: "Kategori & Unit",
            defaultChecked: true,
          },
          {
            id: "stock",
            label: "Rincian Stok Min/Max",
            defaultChecked: true,
          },
          {
            id: "attachment",
            label: "Lampiran Dokumen",
            defaultChecked: false,
          },
        ]}
      />
    </>
  )
}