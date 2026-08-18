"use client"

import { ExportModal } from "@/components/export-modal"
import { useDeferredValue, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { MutasiForm } from "@/components/mutasi/mutasi-form"
import { useApiList, useApiDelete } from "@/hooks/use-api"
import { useOptions, toOptions } from "@/hooks/use-options"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api"
import { statusLabel, statusColor, formatDate } from "@/lib/status"
import type { Gudang, MutasiStok } from "@/types"

import {
  BiTransfer,
  BiSolidReport,
  BiChevronRight,
  BiDotsVerticalRounded,
  BiRightArrowAlt,
  BiFile,
  BiShow,
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

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Disetujui" },
  { value: "completed", label: "Selesai" },
  { value: "rejected", label: "Ditolak" },
]

export default function MutasiPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [status, setStatus] = useState<string | null>(null)
  const [gudang, setGudang] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const router = useRouter()

  const { data, isLoading } = useApiList<MutasiStok>({
    key: "mutasi",
    url: "/mutasi-stok",
    params: {
      page,
      per_page: 15,
      search: deferredSearch || undefined,
      status: status && status !== "all" ? status : undefined,
      gudang_id: gudang && gudang !== "all" ? Number(gudang) : undefined,
    },
  })

  const deleteMutation = useApiDelete("mutasi", "/mutasi-stok")
  const { items: gudangList } = useOptions<Gudang>("gudang", "/gudang")
  const gudangOptions = [
    { value: "all", label: "Semua Gudang" },
    ...toOptions(gudangList),
  ]

  const rows = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta?.last_page ?? 1

  const handleDelete = async (row: MutasiStok) => {
    if (!window.confirm(`Batalkan mutasi ${row.no_referensi}?`)) return
    try {
      const response = await deleteMutation.mutateAsync(row.id)
      toast.success(response.message)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const renderStatusBadge = (status: string) => (
    <ColoredBadge color={statusColor(status)}>{statusLabel(status)}</ColoredBadge>
  )

  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Aktivitas Gudang" },
              { label: "Mutasi Antar Gudang" },
            ]}
            title="Mutasi Antar Gudang"
            icon={BiTransfer}
            description="Catat perpindahan stok barang antar gudang."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
            <Button variant="default" onClick={() => setDrawerOpen(true)}>
              + Mutasi Baru
            </Button>
          </div>
        </div>
      </div>

      <MutasiForm open={drawerOpen} onOpenChange={setDrawerOpen} />

      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari no. referensi, barang, atau rute mutasi..."
            className="flex-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <Opsion
            placeholder="Semua Gudang"
            value={gudang || ""}
            onValueChange={(val) => {
              setGudang(val)
              setPage(1)
            }}
            options={gudangOptions}
          />
          <Opsion
            placeholder="Semua Status"
            value={status || ""}
            onValueChange={(val) => {
              setStatus(val)
              setPage(1)
            }}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      <div className="wrapper mt-[25px] min-w-0">
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
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="min-h-[300px]">
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center text-sm text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center text-sm text-muted-foreground">
                  Tidak ada data mutasi.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className="h-16 border-b border-border/40 hover:bg-muted/30"
              >
                <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                  {row.no_referensi}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  <div className="flex items-center gap-1.5">
                    <span>{row.gudang_asal?.nama ?? "-"}</span>
                    <BiRightArrowAlt className="size-4 shrink-0 text-muted-foreground" />
                    <span>{row.gudang_tujuan?.nama ?? "-"}</span>
                  </div>
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.barang?.nama ??
                    row.details?.[0]?.barang?.nama ??
                    (row.details?.length ? `${row.details.length} item` : "-")}
                </TableCell>
                <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                  {row.details?.length
                    ? row.details.reduce((sum, d) => sum + (d.qty || 0), 0)
                    : (row.qty ?? "-")}
                </TableCell>
                <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                  {formatDate(row.tanggal)}
                </TableCell>
                <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                  {row.createdBy?.name ?? "-"}
                </TableCell>
                <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                  {renderStatusBadge(row.status)}
                </TableCell>
                <TableCell className="pr-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1 text-muted-foreground">
                    <button
                      className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted"
                      onClick={() => router.push(`/inventory/mutasi/detail/${row.id}`)}
                    >
                      <BiChevronRight className="size-4 text-foreground/75" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted outline-none">
                        <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Aksi Mutasi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push(`/inventory/mutasi/detail/${row.id}`)}
                        >
                          <BiShow />
                          <span>Lihat Detail</span>
                        </DropdownMenuItem>
                        {row.status === "pending" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => handleDelete(row)}>
                              <BiTrash />
                              <span>Batalkan</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Menampilkan {meta?.total ? (page - 1) * (meta.per_page || 15) + 1 : 0}-
                    {Math.min(page * (meta?.per_page || 15), meta?.total ?? 0)} dari {meta?.total ?? 0}{" "}
                    data
                  </span>
                  <div className="flex items-center">
                    <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                      <button
                        className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        &lt;
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          className={`flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 font-medium transition-colors last:border-r-0 ${
                            page === p
                              ? "bg-muted/60 text-foreground"
                              : "text-muted-foreground hover:bg-muted"
                          }`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                  <span>{meta?.per_page ?? 15} per halaman</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Mutasi Barang"
        totalItemsCount={meta?.total ?? 0}
        totalItemsLabel="Total Mutasi"
        filterLabel="Filter Aktif"
        checkboxes={[
          {
            id: "noMutasi",
            label: "No. Mutasi",
            defaultChecked: true,
          },
          {
            id: "gudang",
            label: "Gudang Asal & Tujuan",
            defaultChecked: true,
          },
          {
            id: "barang",
            label: "Detail Barang & Qty",
            defaultChecked: true,
          },
        ]}
      />
    </>
  )
}