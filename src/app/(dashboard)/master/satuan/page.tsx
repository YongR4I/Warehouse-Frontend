"use client"

import { ExportModal } from "@/components/export-modal"
import { useState, useDeferredValue, useCallback } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { toast } from "sonner"
import api from "@/lib/api"
import { getErrorMessage } from "@/lib/api"
import { useApiList, useApiDelete } from "@/hooks/use-api"
import { useConfirmDialog } from "@/components/confirm-dialog"
import type { Satuan } from "@/types"
import {
  BiTag,
  BiDotsVerticalRounded,
  BiSolidReport,
  BiEditAlt,
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
import { SatuanForm } from "@/components/kategori/satuan-form"
import { TableSkeletonRows } from "@/components/skeletons"

const PER_PAGE = 15

export default function SatuanPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [satuanDrawerOpen, setSatuanDrawerOpen] = useState(false)
  const [selectedSatuan, setSelectedSatuan] = useState<Satuan | null>(null)
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [satuanPage, setSatuanPage] = useState(1)

  const { data: satuanData, isLoading: satuanLoading } = useApiList<Satuan>({
    key: "satuan",
    url: "/satuan",
    params: {
      page: satuanPage,
      per_page: PER_PAGE,
      search: deferredSearch || undefined,
    },
  })

  const deleteSatuan = useApiDelete("satuan", "/satuan")

  const satuans = satuanData?.data ?? []
  const satuanMeta = satuanData?.meta

  const fetchExportData = useCallback(
    async (coverage: "all" | "filtered") => {
      const res = await api.get("/satuan", {
        params: {
          per_page: 9999,
          search:
            coverage === "filtered" ? deferredSearch || undefined : undefined,
        },
      })
      return (res.data?.data ?? []) as Record<string, unknown>[]
    },
    [deferredSearch]
  )

  const { confirm, ConfirmDialog } = useConfirmDialog()

  const handleDeleteSatuan = (satuan: Satuan) => {
    confirm({
      title: "Hapus Satuan / UOM",
      itemName: satuan.singkatan
        ? `${satuan.nama} (${satuan.singkatan})`
        : satuan.nama,
      description:
        "Apakah Anda yakin ingin menghapus satuan ini? Pastikan tidak ada barang aktif yang bergantung pada satuan ini.",
      confirmLabel: "Ya, Hapus Satuan",
      onConfirm: async () => {
        try {
          const response = await deleteSatuan.mutateAsync(satuan.id)
          toast.success(response.message)
          setSatuanPage(1)
        } catch (error) {
          toast.error(getErrorMessage(error))
        }
      },
    })
  }

  const renderPagination = (
    currentPage: number,
    lastPage: number,
    onPageChange: (page: number) => void
  ) => {
    if (lastPage <= 1) return null
    const buttons = []
    for (let i = 1; i <= lastPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 font-medium transition-colors last:border-r-0 ${
            currentPage === i
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
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            &lt;
          </button>
          {buttons}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= lastPage}
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
            items={[
              { label: "Data Master" },
              { label: "Satuan Unit (UOM)" },
            ]}
            title="Satuan Unit (UOM)"
            icon={BiTag}
            description="Atur satuan ukuran dan unit of measurement untuk barang."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[35px]">
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={() => setSatuanDrawerOpen(true)}>
            + Tambah Satuan Unit (UOM)
          </Button>
          <InputSearch
            placeholder="Cari nama atau singkatan satuan..."
            className="flex-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSatuanPage(1)
            }}
          />
        </div>
      </div>

      <div className="wrapper mt-[15px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-card">
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
            {satuanLoading ? (
              <TableSkeletonRows columns={3} rows={PER_PAGE} />
            ) : satuans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Tidak ada data satuan
                </TableCell>
              </TableRow>
            ) : (
              satuans.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-16 border-b border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-sans text-sm text-foreground">
                    {row.singkatan ?? "-"}
                  </TableCell>
                  <TableCell className="text-center font-sans text-sm text-foreground">
                    {row.nama}
                  </TableCell>
                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors outline-none hover:bg-muted">
                          <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Aksi Satuan</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSatuan(row)
                              setSatuanDrawerOpen(true)
                            }}
                          >
                            <BiEditAlt />
                            <span>Ubah Satuan</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteSatuan(row)}
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
              <TableCell colSpan={3} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between gap-4 bg-card px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Total Satuan / UOM: {satuanMeta?.total ?? 0} Kode Satuan
                  </span>
                  {renderPagination(
                    satuanPage,
                    satuanMeta?.last_page ?? 1,
                    setSatuanPage
                  )}
                  <span>{PER_PAGE} per halaman</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <SatuanForm
        open={satuanDrawerOpen}
        onOpenChange={(open) => {
          setSatuanDrawerOpen(open)
          if (!open) setSelectedSatuan(null)
        }}
        initialData={selectedSatuan}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Daftar Satuan"
        totalItemsCount={satuanMeta?.total ?? 0}
        totalItemsLabel="Total Satuan"
        filterLabel="Filter Aktif"
        checkboxes={[
          {
            id: "nama",
            label: "Nama Satuan / UOM",
            defaultChecked: true,
          },
          {
            id: "singkatan",
            label: "Singkatan / Kode",
            defaultChecked: true,
          },
        ]}
        fetchExportData={fetchExportData}
        exportColumns={[
          { header: "Nama Satuan", accessor: "nama" },
          { header: "Singkatan", accessor: "singkatan" },
        ]}
      />
    </>
  )
}
