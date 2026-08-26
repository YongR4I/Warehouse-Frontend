"use client"

import { ExportModal } from "@/components/export-modal"
import { useState, useDeferredValue, useCallback } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { toast } from "sonner"
import api from "@/lib/api"
import { getErrorMessage } from "@/lib/api"
import { statusColor, statusLabel } from "@/lib/status"
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
import { GudangForm } from "@/components/gudang/gudang-form"
import { RakForm } from "@/components/gudang/rak-form"

const PER_PAGE = 15

export default function GudangPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [gudangDrawerOpen, setGudangDrawerOpen] = useState(false)
  const [rakDrawerOpen, setRakDrawerOpen] = useState(false)
  const [selectedGudang, setSelectedGudang] = useState<Gudang | null>(null)
  const [selectedRak, setSelectedRak] = useState<LokasiRak | null>(null)
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [gudangPage, setGudangPage] = useState(1)
  const [rakPage, setRakPage] = useState(1)
  const [rakGudangFilter, setRakGudangFilter] = useState("all")

  const { data: gudangData, isLoading: gudangLoading } = useApiList<Gudang>({
    key: "gudang",
    url: "/gudang",
    params: {
      page: gudangPage,
      per_page: PER_PAGE,
      search: deferredSearch || undefined,
    },
  })
  const { data: rakData, isLoading: rakLoading } = useApiList<LokasiRak>({
    key: "lokasi-rak",
    url: "/lokasi-rak",
    params: {
      page: rakPage,
      per_page: PER_PAGE,
      search: deferredSearch || undefined,
    },
  })

  const deleteGudang = useApiDelete("gudang", "/gudang")
  const deleteRak = useApiDelete("lokasi-rak", "/lokasi-rak")

  const gudangs = gudangData?.data ?? []
  const gudangMeta = gudangData?.meta
  const raks = rakData?.data ?? []
  const rakMeta = rakData?.meta

  const { items: gudangOptionsList } = useOptions<Gudang>("gudang", "/gudang")
  const gudangFilterOptions = [
    { value: "all", label: "Semua gudang" },
    ...toOptions(gudangOptionsList),
  ]

  const filteredRaks =
    rakGudangFilter === "all"
      ? raks
      : raks.filter((rak) => String(rak.gudang_id) === rakGudangFilter)

  const aktifGudang = gudangs.filter((g) => g.status === "aktif").length
  const nonAktifGudang = gudangs.length - aktifGudang

  const fetchExportData = useCallback(
    async (coverage: "all" | "filtered") => {
      const res = await api.get("/gudang", {
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

  const handleDeleteGudang = (gudang: Gudang) => {
    confirm({
      title: "Hapus Gudang",
      itemName: `${gudang.kode} - ${gudang.nama}`,
      description:
        "Apakah Anda yakin ingin menghapus gudang ini? Data rak dan konfigurasi stok terkait di gudang ini akan terhapus.",
      confirmLabel: "Ya, Hapus Gudang",
      onConfirm: async () => {
        try {
          const response = await deleteGudang.mutateAsync(gudang.id)
          toast.success(response.message)
        } catch (error) {
          toast.error(getErrorMessage(error))
        }
      },
    })
  }

  const handleDeleteRak = (rak: LokasiRak) => {
    confirm({
      title: "Hapus Lokasi Rak",
      itemName: `Rak: ${rak.kode_rak}`,
      description:
        "Apakah Anda yakin ingin menghapus rak ini? Barang yang tersimpan di lokasi rak ini harus dipindahkan terlebih dahulu.",
      confirmLabel: "Ya, Hapus Rak",
      onConfirm: async () => {
        try {
          const response = await deleteRak.mutateAsync(rak.id)
          toast.success(response.message)
        } catch (error) {
          toast.error(getErrorMessage(error))
        }
      },
    })
  }

  const openGudangEdit = (gudang: Gudang) => {
    setSelectedGudang(gudang)
    setGudangDrawerOpen(true)
  }

  const openRakEdit = (rak: LokasiRak) => {
    setSelectedRak(rak)
    setRakDrawerOpen(true)
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
            items={[{ label: "Data Master" }, { label: "Daftar Gudang & Rak" }]}
            title="Daftar Gudang & Rak"
            icon={BiBuildings}
            description="Kelola data gudang dan lokasi rak."
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
          <Button variant="default" onClick={() => setGudangDrawerOpen(true)}>
            + Tambah Gudang
          </Button>
          <InputSearch
            placeholder="Cari nama atau kode gudang..."
            className="flex-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setGudangPage(1)
              setRakPage(1)
            }}
          />
        </div>
      </div>

      <div className="wrapper mt-[15px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Kode
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Nama Gudang
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Alamat / Lokasi
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Penanggung Jawab
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Status
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gudangLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Memuat...
                </TableCell>
              </TableRow>
            ) : gudangs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              gudangs.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-16 border-b border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-sans text-sm text-foreground">
                    {row.kode ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.nama}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground/80">
                    {row.alamat ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.pic ?? "-"}
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
                          <DropdownMenuLabel>Aksi Gudang</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openGudangEdit(row)}>
                            <BiEditAlt />
                            <span>Ubah Data</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteGudang(row)}
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
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between gap-4 bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Total Gudang: {gudangMeta?.total ?? 0} Gudang ({aktifGudang}{" "}
                    Aktif, {nonAktifGudang} Non-Aktif)
                  </span>
                  {renderPagination(
                    gudangPage,
                    gudangMeta?.last_page ?? 1,
                    setGudangPage
                  )}
                  <span>{PER_PAGE} per halaman</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="wrapper mt-[40px]">
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={() => setRakDrawerOpen(true)}>
            + Tambah Rak
          </Button>
          <Opsion
            placeholder="Semua gudang"
            value={rakGudangFilter}
            onValueChange={(val) => setRakGudangFilter(val ?? "all")}
            options={gudangFilterOptions}
          />
        </div>
      </div>

      <div className="wrapper mt-[15px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Kode Rak / Bin
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Gudang
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Baris / Aisle
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Level / Tingkat
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Keterangan
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rakLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Memuat...
                </TableCell>
              </TableRow>
            ) : filteredRaks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              filteredRaks.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-16 border-b border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-sans text-sm text-foreground">
                    {row.kode_rak}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.gudang?.nama ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.zona ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    -
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground/80">
                    {row.deskripsi ?? "-"}
                  </TableCell>
                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors outline-none hover:bg-muted">
                          <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Aksi Rak</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openRakEdit(row)}>
                            <BiEditAlt />
                            <span>Ubah Data</span>
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
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between gap-4 bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Total Lokasi Rak: {rakMeta?.total ?? 0} Lokasi Rak / Bin
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

      <GudangForm
        open={gudangDrawerOpen}
        onOpenChange={(open) => {
          setGudangDrawerOpen(open)
          if (!open) setSelectedGudang(null)
        }}
        initialData={selectedGudang}
      />
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
        title="Ekspor Daftar Gudang"
        totalItemsCount={gudangMeta?.total ?? 0}
        totalItemsLabel="Total Gudang"
        filterLabel="Filter Aktif"
        checkboxes={[
          {
            id: "nama",
            label: "Nama Gudang",
            defaultChecked: true,
          },
          {
            id: "lokasi",
            label: "Alamat / Lokasi",
            defaultChecked: true,
          },
          {
            id: "kapasitas",
            label: "Kapasitas Unit",
            defaultChecked: true,
          },
        ]}
        fetchExportData={fetchExportData}
        exportColumns={[
          { header: "Kode", accessor: "kode" },
          { header: "Nama Gudang", accessor: "nama" },
          { header: "Alamat", accessor: "alamat" },
          { header: "PIC", accessor: "pic" },
          { header: "Status", accessor: "status" },
        ]}
      />
    </>
  )
}
