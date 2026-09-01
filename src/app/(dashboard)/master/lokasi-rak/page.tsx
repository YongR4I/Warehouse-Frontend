"use client"

import { ExportModal } from "@/components/export-modal"
import { useState, useDeferredValue, useCallback } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Opsion } from "@/components/opsion"
import { InputSearch } from "@/components/input"
import { toast } from "sonner"
import api from "@/lib/api"
import { getErrorMessage } from "@/lib/api"
import { useApiList, useApiDelete } from "@/hooks/use-api"
import { useOptions, toOptions } from "@/hooks/use-options"
import { useConfirmDialog } from "@/components/confirm-dialog"
import type { Gudang, LokasiRak } from "@/types"
import {
  BiBuildings,
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
import { ColoredBadge } from "@/components/ui/colored-badge"
import { RakForm } from "@/components/gudang/rak-form"
import { TableSkeletonRows } from "@/components/skeletons"

const PER_PAGE = 15

export default function LokasiRakPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [rakDrawerOpen, setRakDrawerOpen] = useState(false)
  const [selectedRak, setSelectedRak] = useState<LokasiRak | null>(null)
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [rakPage, setRakPage] = useState(1)
  const [rakGudangFilter, setRakGudangFilter] = useState("all")

  const { data: rakData, isLoading: rakLoading } = useApiList<LokasiRak>({
    key: "lokasi-rak",
    url: "/lokasi-rak",
    params: {
      page: rakPage,
      per_page: PER_PAGE,
      search: deferredSearch || undefined,
    },
  })

  const deleteRak = useApiDelete("lokasi-rak", "/lokasi-rak")

  // Get gudang options for filter
  const { items: gudangOptionsList } = useOptions<Gudang>("gudang", "/gudang")
  const gudangFilterOptions = [
    { value: "all", label: "Semua gudang" },
    ...toOptions(gudangOptionsList),
  ]

  const raks = rakData?.data ?? []
  const rakMeta = rakData?.meta

  const filteredRaks =
    !rakGudangFilter || rakGudangFilter === "all"
      ? raks
      : raks.filter((rak) => String(rak.gudang_id) === (rakGudangFilter as string))

  const fetchExportData = useCallback(
    async (coverage: "all" | "filtered") => {
      const res = await api.get("/lokasi-rak", {
        params: {
          per_page: 9999,
          search:
            coverage === "filtered" ? deferredSearch || undefined : undefined,
          gudang_id: rakGudangFilter === "all" ? undefined : rakGudangFilter,
        },
      })
      return (res.data?.data ?? []) as Record<string, unknown>[]
    },
    [deferredSearch, rakGudangFilter]
  )

  const { confirm, ConfirmDialog } = useConfirmDialog()

  const handleDeleteRak = (rak: LokasiRak) => {
    confirm({
      title: "Hapus Lokasi Rak",
      itemName: rak.kode_rak,
      description:
        "Apakah Anda yakin ingin menghapus lokasi rak ini? Pastikan tidak ada barang yang menempati lokasi ini.",
      confirmLabel: "Ya, Hapus Lokasi Rak",
      onConfirm: async () => {
        try {
          const response = await deleteRak.mutateAsync(rak.id)
          toast.success(response.message)
          setRakPage(1)
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
              { label: "Lokasi Rak" },
            ]}
            title="Lokasi Rak"
            icon={BiBuildings}
            description="Kelola lokasi penyimpanan rak di setiap gudang."
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
          <Button variant="default" onClick={() => setRakDrawerOpen(true)}>
            + Tambah Lokasi Rak
          </Button>
          <Opsion
            options={gudangFilterOptions}
            value={rakGudangFilter}
            onValueChange={(val) => {
              setRakGudangFilter(val ?? "all")
              setRakPage(1)
            }}
            placeholder="Pilih Gudang"
            className="w-[158.47px]"
          />
          <InputSearch
            placeholder="Cari kode rak atau zona..."
            className="flex-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setRakPage(1)
            }}
          />
        </div>
      </div>

      <div className="wrapper mt-[15px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-card">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Gudang
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Kode Rak
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Zona
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-center">
                Kapasitas
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-center">
                Status
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rakLoading ? (
              <TableSkeletonRows columns={6} rows={PER_PAGE} />
            ) : filteredRaks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Tidak ada data lokasi rak
                </TableCell>
              </TableRow>
            ) : (
              filteredRaks.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-16 border-b border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-sans text-sm text-foreground">
                    {row.gudang?.nama ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.kode_rak}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-muted-foreground">
                    {row.zona ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-center">
                    {row.kapasitas ?? "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <ColoredBadge
                      color={statusColor(row.status)}
                      className="mt-1.5"
                    >
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
                          <DropdownMenuLabel>Aksi Lokasi Rak</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRak(row)
                              setRakDrawerOpen(true)
                            }}
                          >
                            <BiEditAlt />
                            <span>Ubah Lokasi Rak</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteRak(row)}
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
              <TableCell colSpan={6} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between gap-4 bg-card px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Total Lokasi Rak: {rakMeta?.total ?? 0} Rak
                  </span>
                  {renderPagination(
                    rakPage,
                    rakMeta?.last_page ?? 1,
                    setRakPage
                  )}
                  <span>{PER_PAGE} per halaman</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <RakForm
        open={rakDrawerOpen}
        onOpenChange={(open) => {
          setRakDrawerOpen(open)
          if (!open) setSelectedRak(null)
        }}
        initialData={selectedRak}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Daftar Lokasi Rak"
        totalItemsCount={rakMeta?.total ?? 0}
        totalItemsLabel="Total Lokasi Rak"
        filterLabel="Filter Aktif"
        checkboxes={[
          {
            id: "gudang",
            label: "Nama Gudang",
            defaultChecked: true,
          },
          {
            id: "kode_rak",
            label: "Kode Rak",
            defaultChecked: true,
          },
          {
            id: "zona",
            label: "Zona",
            defaultChecked: true,
          },
          {
            id: "kapasitas",
            label: "Kapasitas",
            defaultChecked: true,
          },
          {
            id: "status",
            label: "Status",
            defaultChecked: true,
          },
        ]}
        fetchExportData={fetchExportData}
        exportColumns={[
          { header: "Gudang", accessor: "gudang.nama" },
          { header: "Kode Rak", accessor: "kode_rak" },
          { header: "Zona", accessor: "zona" },
          { header: "Kapasitas", accessor: "kapasitas" },
          { header: "Status", accessor: "status" },
        ]}
      />
    </>
  )
}

// Helper function to map status string to Tailwind color
function statusColor(status: string): "blue" | "red" | "yellow" | "green" | "purple" | "sky" | "gray" {
  switch (status) {
    case "aktif": return "green";
    case "nonaktif": return "gray";
    case "penuh": return "yellow";
    default: return "gray";
  }
}

// Helper function to map status string to display label
function statusLabel(status: string): string {
  switch (status) {
    case "aktif": return "Aktif";
    case "nonaktif": return "Nonaktif";
    case "penuh": return "Penuh";
    default: return status;
  }
}
