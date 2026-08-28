"use client"

import { ExportModal } from "@/components/export-modal"
import { useDeferredValue, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { BarangMasukForm } from "@/components/barang-masuk/barang-masuk-form"
import { TableSkeletonRows } from "@/components/skeletons"
import { useApiList, useApiDelete } from "@/hooks/use-api"
import { useOptions } from "@/hooks/use-options"
import { getErrorMessage, downloadFile } from "@/lib/api"
import { formatDate, statusColor, statusLabel } from "@/lib/status"
import { useConfirmDialog } from "@/components/confirm-dialog"
import { toast } from "sonner"
import type { BarangMasuk, Gudang } from "@/types"

import {
  BiDownArrowCircle,
  BiSolidReport,
  BiChevronRight,
  BiDotsVerticalRounded,
  BiFile,
  BiShow,
  BiPrinter,
  BiTrash,
} from "react-icons/bi"
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

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
]

function totalItemLabel(row: BarangMasuk): string {
  const details = row.details ?? []
  if (!details.length) return "-"
  return `${details.length} SKU`
}

function dokumenName(dokumen?: string | null): string {
  if (!dokumen) return "-"
  const parts = dokumen.split("/")
  return parts[parts.length - 1] || dokumen
}

export default function BarangMasukPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [gudangFilter, setGudangFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()

  const deferredSearch = useDeferredValue(search)

  const { items: gudangItems } = useOptions<Gudang>("gudang-options", "/gudang")
  const gudangOptions = [
    { value: "all", label: "Semua Gudang" },
    ...gudangItems.map((g) => ({ value: String(g.id), label: g.nama })),
  ]

  const { data, isLoading } = useApiList<BarangMasuk>({
    key: "barang-masuk",
    url: "/barang-masuk",
    params: {
      page,
      per_page: 15,
      search: deferredSearch.trim() || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      gudang_id: gudangFilter !== "all" ? gudangFilter : undefined,
    },
  })
  const items = data?.data ?? []
  const meta = data?.meta

  const deleteMutation = useApiDelete("barang-masuk", "/barang-masuk")

  const total = meta?.total ?? 0
  const lastPage = meta?.last_page ?? 1
  const perPage = meta?.per_page ?? 15
  const rangeStart = total === 0 ? 0 : (page - 1) * perPage + 1
  const rangeEnd = Math.min(page * perPage, total)

  const pageNumbers: Array<number | "ellipsis"> = []
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || Math.abs(i - page) <= 1) {
      pageNumbers.push(i)
    } else if (pageNumbers[pageNumbers.length - 1] !== "ellipsis") {
      pageNumbers.push("ellipsis")
    }
  }

  const exportQuery = new URLSearchParams()
  if (deferredSearch.trim()) exportQuery.set("search", deferredSearch.trim())
  if (statusFilter !== "all") exportQuery.set("status", statusFilter)
  if (gudangFilter !== "all") exportQuery.set("gudang_id", gudangFilter)
  const exportQueryString = exportQuery.toString()
  const exportUrl = `/barang-masuk/export/excel${
    exportQueryString ? `?${exportQueryString}` : ""
  }`

  const handleCetak = async (id: number) => {
    try {
      await downloadFile(`/barang-masuk/${id}/print-surat-jalan`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const { confirm, ConfirmDialog } = useConfirmDialog()

  const handleDelete = (row: BarangMasuk) => {
    confirm({
      title: "Hapus Penerimaan Barang",
      itemName: `No. Ref: ${row.no_referensi}`,
      description:
        "Apakah Anda yakin ingin menghapus data penerimaan barang ini? Stok yang telah masuk dan kartu stok terkait akan diperbarui.",
      confirmLabel: "Ya, Hapus Penerimaan",
      onConfirm: async () => {
        try {
          const res = await deleteMutation.mutateAsync(row.id)
          toast.success(res.message)
        } catch (err) {
          toast.error(getErrorMessage(err))
        }
      },
    })
  }

  return (
    <>
      {ConfirmDialog}
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Aktivitas Gudang" },
              { label: "Terima Barang (In)" },
            ]}
            title="Terima Barang (In)"
            icon={BiDownArrowCircle}
            description="Catat penerimaan stok barang masuk ke gudang."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
            <Button variant="default" onClick={() => setDrawerOpen(true)}>
              + Barang Masuk Baru
            </Button>
          </div>
        </div>
      </div>

      <BarangMasukForm open={drawerOpen} onOpenChange={setDrawerOpen} />

      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari no. referensi atau supplier..."
            className="flex-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <Opsion
            options={gudangOptions}
            value={gudangFilter}
            onValueChange={(value) => {
              setGudangFilter(value ?? "all")
              setPage(1)
            }}
          />
          <Opsion
            placeholder="Semua Status"
            options={statusOptions}
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value ?? "all")
              setPage(1)
            }}
          />
        </div>
      </div>

      <div className="wrapper mt-[25px] min-w-0">
        <Table>
          <TableHeader className="border-b border-border/60 bg-card">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                No. Referensi
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Gudang asal
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Supplier
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Tanggal
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Total Item
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Dibuat Oleh
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Status
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Dokumen
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="min-h-[300px]">
            {isLoading ? (
              <TableSkeletonRows columns={9} rows={15} />
            ) : items.length === 0 ? (
              <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                <TableCell
                  colSpan={9}
                  className="py-10 text-center font-sans text-sm text-muted-foreground"
                >
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-16 border-b border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                    {row.no_referensi}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.gudang?.nama ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.supplier?.nama ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                    {formatDate(row.tanggal)}
                  </TableCell>
                  <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                    {totalItemLabel(row)}
                  </TableCell>
                  <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                    {row.createdBy?.name ?? "-"}
                  </TableCell>
                  <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                    <ColoredBadge color={statusColor(row.status)}>
                      {statusLabel(row.status)}
                    </ColoredBadge>
                  </TableCell>
                  <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                    {row.dokumen ? (
                      <span className="inline-flex items-center gap-0.5 rounded-[4px] border border-border/80 bg-card px-1.5 py-0.5 text-[11px] leading-none whitespace-nowrap text-muted-foreground">
                        <BiFile className="size-3 text-muted-foreground/80" />
                        <span>{dokumenName(row.dokumen)}</span>
                      </span>
                    ) : (
                      <span className="font-sans whitespace-nowrap text-muted-foreground">
                        -
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <button
                        className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted"
                        onClick={() =>
                          router.push(
                            `/inventory/barang-masuk/detail/${row.id}`
                          )
                        }
                      >
                        <BiChevronRight className="size-4 text-foreground/75" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors outline-none hover:bg-muted">
                          <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Aksi Penerimaan</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/inventory/barang-masuk/detail/${row.id}`
                              )
                            }
                          >
                            <BiShow />
                            <span>Lihat Detail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCetak(row.id)}>
                            <BiPrinter />
                            <span>Cetak Surat Jalan</span>
                          </DropdownMenuItem>
                          {row.status === "pending" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete(row)}
                              >
                                <BiTrash />
                                <span>Hapus</span>
                              </DropdownMenuItem>
                            </>
                          )}
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
              <TableCell colSpan={9} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-card px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Menampilkan {rangeStart}-{rangeEnd} dari {total} data
                  </span>
                  <div className="flex items-center">
                    <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || lastPage === 0}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                      >
                        &lt;
                      </button>
                      {pageNumbers.map((p, idx) =>
                        p === "ellipsis" ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="flex h-8 w-8 items-center justify-center border-r border-border/80 text-muted-foreground"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPage(p)}
                            className={
                              p === page
                                ? "flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 bg-muted/60 font-medium text-foreground transition-colors"
                                : "flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted"
                            }
                          >
                            {p}
                          </button>
                        )
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setPage((p) => Math.min(lastPage, p + 1))
                        }
                        disabled={page === lastPage || lastPage === 0}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                  <span>{perPage} per halaman</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Barang Masuk"
        totalItemsCount={meta?.total ?? 0}
        totalItemsLabel="Total Penerimaan"
        filterLabel="Filter Aktif"
        exportUrl={exportUrl}
        checkboxes={[
          {
            id: "noPo",
            label: "No. Purchase Order",
            defaultChecked: true,
          },
          {
            id: "supplier",
            label: "Supplier Asal",
            defaultChecked: true,
          },
          {
            id: "barang",
            label: "Detail Barang & Qty",
            defaultChecked: true,
          },
          {
            id: "petugas",
            label: "Petugas Penerima",
            defaultChecked: true,
          },
        ]}
      />
    </>
  )
}