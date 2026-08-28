"use client"

import { ExportModal } from "@/components/export-modal"
import { useDeferredValue, useMemo, useState, useCallback } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { useConfirmDialog } from "@/components/confirm-dialog"
import { toast } from "sonner"
import api from "@/lib/api"
import {
  BiUser,
  BiUserPlus,
  BiDownload,
  BiDotsVerticalRounded,
  BiEditAlt,
  BiTrash,
  BiQr,
  BiBuildings,
  BiMap,
  BiPhone,
  BiTable,
  BiGridAlt,
  BiChevronRight,
} from "react-icons/bi"
import { QrCardDialog } from "@/components/absensi/qr-card-dialog"
import { PetugasForm, JABATAN_OPTIONS } from "@/components/petugas/petugas-form"
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
} from "@/components/ui/table"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { TableSkeletonRows } from "@/components/skeletons"
import { useApiList, useApiDelete } from "@/hooks/use-api"
import { getErrorMessage } from "@/lib/api"
import { formatDate } from "@/lib/status"
import { useAuthStore } from "@/store/use-auth-store"
import { cn } from "@/lib/utils"
import type { Petugas, PetugasStatusOperasional } from "@/types"

function unwrapRows<T>(data: unknown): T[] {
  const body = data as { data?: unknown } | T[] | null | undefined
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === "object" && Array.isArray(body.data)) {
    return body.data as T[]
  }
  return []
}

const STATUS_BADGE: Record<
  PetugasStatusOperasional,
  { color: "green" | "yellow" | "gray"; label: string }
> = {
  Aktif: { color: "green", label: "Aktif" },
  Cuti: { color: "yellow", label: "Cuti" },
  "Non-Aktif": { color: "gray", label: "Non-Aktif" },
}

export default function DaftarPetugasPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const canCreate = hasPermission("petugas-create")
  const canEdit = hasPermission("petugas-edit")
  const canDelete = hasPermission("petugas-delete")

  const [exportOpen, setExportOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingPetugas, setEditingPetugas] = useState<Petugas | null>(null)
  const [qrTarget, setQrTarget] = useState<Petugas | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid")

  const deferredSearch = useDeferredValue(searchQuery)

  // Sumber data = profil operasional /petugas (bukan akun login /user)
  const petugasQuery = useApiList<Petugas>({
    key: "petugas",
    url: "/petugas",
    params: {
      page: currentPage,
      per_page: 15,
      search: deferredSearch || undefined,
    },
  })

  const items = useMemo(
    () => unwrapRows<Petugas>(petugasQuery.data),
    [petugasQuery.data]
  )
  const meta = petugasQuery.data?.meta
  const total = meta?.total ?? items.length
  const totalPages = Math.max(1, meta?.last_page ?? 1)

  const deleteMutation = useApiDelete("petugas", "/petugas")

  const fetchExportData = useCallback(
    async (coverage: "all" | "filtered") => {
      const res = await api.get("/petugas", {
        params: {
          per_page: 9999,
          search:
            coverage === "filtered" ? deferredSearch || undefined : undefined,
        },
      })
      const body = res.data as { data?: unknown } | unknown[] | null
      const items = Array.isArray(body) ? body : (body?.data ?? [])
      return (items as Record<string, unknown>[]).map((row) => ({
        kode: row.kode ?? "-",
        nama: row.nama ?? "-",
        jabatan: row.jabatan ?? "-",
        area_kerja: row.area_kerja ?? "-",
        telepon: row.telepon ?? "-",
        tanggal_bergabung: row.tanggal_bergabung
          ? new Date(row.tanggal_bergabung as string).toLocaleDateString(
              "id-ID",
              { day: "2-digit", month: "short", year: "numeric" }
            )
          : "-",
        status: row.status_operasional ?? "-",
      }))
    },
    [deferredSearch]
  )

  const existingKodes = useMemo(
    () => items.map((p) => p.kode).filter(Boolean),
    [items]
  )

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const renderStatusBadge = (status: PetugasStatusOperasional) => {
    const badge = STATUS_BADGE[status] ?? STATUS_BADGE["Non-Aktif"]
    return <ColoredBadge color={badge.color}>{badge.label}</ColoredBadge>
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const maxButtons = 5
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxButtons - 1)
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
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
    return buttons
  }

  const openCreate = () => {
    setEditingPetugas(null)
    setFormOpen(true)
  }

  const openEdit = (petugas: Petugas) => {
    setEditingPetugas(petugas)
    setFormOpen(true)
  }

  const { confirm, ConfirmDialog } = useConfirmDialog()

  const handleDelete = (petugas: Petugas) => {
    confirm({
      title: "Hapus Data Karyawan",
      itemName: `${petugas.nama} (${petugas.kode})`,
      description:
        "Data karyawan akan dihapus. Akun login (jika pernah ditautkan) tetap ada dan dikelola di Pengaturan.",
      confirmLabel: "Ya, Hapus Data",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(petugas.id)
          toast.success("Data karyawan berhasil dihapus")
        } catch (error) {
          toast.error(getErrorMessage(error))
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
              { label: "SDM & Kehadiran" },
              { label: "Daftar Petugas Gudang" },
            ]}
            title="Daftar Petugas Gudang"
            icon={BiUser}
            description="Kelola data operasional karyawan dan status penugasan."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiDownload className="mr-2" />
              Export (.excel/.pdf)
            </Button>
            {canCreate && (
              <Button variant="default" onClick={openCreate}>
                <BiUserPlus className="mr-2" />
                Tambah Petugas
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="wrapper mt-[50px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputSearch
            placeholder="Cari nama, kode petugas, atau area..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="min-w-0 flex-1 sm:max-w-[440px]"
          />
          <div className="flex shrink-0 items-center overflow-hidden rounded-xl border border-border bg-card p-1">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                viewMode === "table"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <BiTable className="size-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                viewMode === "grid"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <BiGridAlt className="size-4" />
              Card
            </button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[25px]">
        {viewMode === "grid" ? (
          <>
            {petugasQuery.isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse overflow-hidden rounded-[20px] border border-border/60 bg-card"
                  >
                    <div className="h-24 bg-muted/30" />
                    <div className="flex justify-center -mt-8">
                      <div className="size-16 rounded-full bg-muted" />
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="mx-auto h-4 w-24 rounded bg-muted" />
                      <div className="mx-auto h-3 w-16 rounded bg-muted/60" />
                      <div className="mt-4 space-y-2">
                        <div className="h-3 rounded bg-muted/40" />
                        <div className="h-3 rounded bg-muted/40" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <BiUser className="size-6 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  Tidak ada data petugas
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Coba ubah filter pencarian atau tambah petugas baru.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((petugas) => {
                  const jabatanLabel =
                    JABATAN_OPTIONS.find((opt) => opt.value === petugas.jabatan)
                      ?.label ??
                    petugas.jabatan ??
                    "-"
                  const statusBadge =
                    STATUS_BADGE[petugas.status_operasional] ?? STATUS_BADGE["Non-Aktif"]
                  return (
                    <article
                      key={petugas.id}
                      className="group relative flex flex-col overflow-hidden rounded-[20px] border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative flex h-38 flex-col items-center justify-start pt-7 bg-card px-4">
                        <div className="flex items-center gap-1.5 text-[#0F2340] dark:text-foreground">
                          <BiBuildings className="size-3.5" />
                          <span className="text-[11px] font-bold tracking-[0.16em]">
                            SABIRU WAREHOUSE
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] font-medium tracking-widest text-muted-foreground/60">
                          ID CARD • {petugas.kode}
                        </p>
                        <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
                          <div className="h-12 w-[120%] rounded-[50%] bg-[#0F2340]" />
                        </div>
                      </div>
                      <div className="absolute left-1/2 top-20 z-10 -translate-x-1/2">
                        <div className="flex size-[76px] items-center justify-center overflow-hidden rounded-full border-[4px] border-card bg-muted shadow-md">
                          <BiUser className="size-8 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="absolute right-3 top-3 z-20">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:bg-card dark:text-muted-foreground">
                            <BiDotsVerticalRounded className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel>Aksi Petugas</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {canEdit && (
                              <DropdownMenuItem onClick={() => openEdit(petugas)}>
                                <BiEditAlt />
                                <span>Ubah Profil</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setQrTarget(petugas)}>
                              <BiQr />
                              <span>Lihat QR Card</span>
                            </DropdownMenuItem>
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDelete(petugas)}
                                >
                                  <BiTrash />
                                  <span>Hapus</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex flex-1 flex-col bg-[#0F2340] px-5 pb-5 pt-10">
                        <div className="flex flex-col items-center text-center">
                          <h3 className="text-[14px] font-bold uppercase tracking-wide text-white">
                            {petugas.nama}
                          </h3>
                          <p className="mt-1 text-[11px] font-semibold tracking-widest text-white/60 uppercase">
                            {jabatanLabel}
                          </p>
                          <div className="mt-3 flex items-center justify-center gap-2">
                            <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs font-semibold text-white">
                              {petugas.kode}
                            </span>
                            <ColoredBadge
                              color={statusBadge.color}
                              className="border border-white/10"
                            >
                              {statusBadge.label}
                            </ColoredBadge>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2.5 border-t border-white/10 pt-4">
                          <div className="flex items-center gap-2 text-xs text-white/70">
                            <BiMap className="size-3.5 shrink-0 text-white/50" />
                            <span className="truncate">
                              {petugas.area_kerja ?? "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/70">
                            <BiPhone className="size-3.5 shrink-0 text-white/50" />
                            <span className="truncate">
                              {petugas.telepon ?? "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <span className="text-[11px] tracking-wide text-white/40">
                              Bergabung:
                            </span>
                            <span className="text-xs font-medium text-white/80">
                              {formatDate(petugas.tanggal_bergabung)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => setQrTarget(petugas)}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-bold text-[#0F2340] transition-colors hover:bg-white/90"
                          >
                            <BiQr className="size-4" />
                            QR Card
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => openEdit(petugas)}
                              className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10"
                            >
                              <BiEditAlt className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
            <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl border border-border/50 bg-card px-6 py-4 font-sans text-xs text-muted-foreground sm:flex-row">
              <span>
                Menampilkan {total > 0 ? (currentPage - 1) * 15 + 1 : 0}-
                {Math.min(currentPage * 15, total)} dari {total} data
              </span>
              {totalPages > 1 && (
                <div className="flex items-center">
                  <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                    <button
                      onClick={handlePrev}
                      disabled={currentPage === 1}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                    >
                      &lt;
                    </button>
                    {renderPaginationButtons()}
                    <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
              <span>15 per halaman</span>
            </div>
          </>
        ) : (
          <div className="overflow-hidden rounded-[15px] border border-border bg-card shadow-xs">
            <Table>
              <TableHeader className="border-b border-border/60 bg-card">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                    Kode Pegawai
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                    Tanggung Jawab
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                    Nama Lengkap
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                    Area Kerja
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                    Nomor Telepon
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                    Tanggal Bergabung
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                    Status Operasional
                  </TableHead>
                  <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {petugasQuery.isLoading && <TableSkeletonRows columns={8} rows={10} />}
                {!petugasQuery.isLoading && items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data petugas ditemukan.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((petugas) => (
                  <TableRow
                    key={petugas.id}
                    className="h-16 border-b border-border/40 hover:bg-muted/30"
                  >
                    <TableCell className="pl-6 font-sans text-sm text-foreground">
                      {petugas.kode}
                    </TableCell>
                    <TableCell className="font-sans text-sm">
                      <ColoredBadge color="gray">
                        {JABATAN_OPTIONS.find(
                          (opt) => opt.value === petugas.jabatan
                        )?.label ??
                          petugas.jabatan ??
                          "-"}
                      </ColoredBadge>
                    </TableCell>
                    <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-foreground">
                      {petugas.nama}
                    </TableCell>
                    <TableCell className="font-sans text-sm text-foreground">
                      {petugas.area_kerja ?? "-"}
                    </TableCell>
                    <TableCell className="font-sans text-sm text-foreground">
                      {petugas.telepon ?? "-"}
                    </TableCell>
                    <TableCell className="font-sans text-sm text-foreground">
                      {formatDate(petugas.tanggal_bergabung)}
                    </TableCell>
                    <TableCell className="font-sans text-sm">
                      {renderStatusBadge(petugas.status_operasional)}
                    </TableCell>
                    <TableCell className="pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 text-muted-foreground">
                        {canEdit && (
                          <button
                            onClick={() => openEdit(petugas)}
                            className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted"
                          >
                            <BiChevronRight className="size-4 text-foreground/75" />
                          </button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors outline-none hover:bg-muted">
                            <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel>Aksi Petugas</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {canEdit && (
                              <DropdownMenuItem onClick={() => openEdit(petugas)}>
                                <BiEditAlt />
                                <span>Ubah Profil</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setQrTarget(petugas)}>
                              <BiQr />
                              <span>Lihat QR Card</span>
                            </DropdownMenuItem>
                            {canEdit && <DropdownMenuSeparator />}
                            {canDelete && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete(petugas)}
                              >
                                <BiTrash />
                                <span>Hapus</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex h-14 items-center justify-between border-t border-border/50 bg-card px-6 font-sans text-xs text-muted-foreground select-none">
              <span>
                Menampilkan {total > 0 ? (currentPage - 1) * 15 + 1 : 0}-
                {Math.min(currentPage * 15, total)} dari {total} data
              </span>
              {totalPages > 1 && (
                <div className="flex items-center">
                  <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                    <button
                      onClick={handlePrev}
                      disabled={currentPage === 1}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                    >
                      &lt;
                    </button>
                    {renderPaginationButtons()}
                    <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
              <span>15 per halaman</span>
            </div>
          </div>
        )}
      </div>

      <PetugasForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editingPetugas}
        existingKodes={existingKodes}
        onSaved={() => void petugasQuery.refetch()}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Daftar Petugas"
        totalItemsCount={total}
        totalItemsLabel="Total Petugas"
        filterLabel="Filter Aktif"
        checkboxes={[
          {
            id: "nama",
            label: "Nama & Kode",
            defaultChecked: true,
          },
          {
            id: "penempatan",
            label: "Jabatan & Area Kerja",
            defaultChecked: true,
          },
          {
            id: "kontak",
            label: "Informasi Kontak",
            defaultChecked: true,
          },
          {
            id: "status",
            label: "Status Operasional",
            defaultChecked: true,
          },
        ]}
        fetchExportData={fetchExportData}
        exportColumns={[
          { header: "Kode", accessor: "kode" },
          { header: "Nama", accessor: "nama" },
          { header: "Jabatan", accessor: "jabatan" },
          { header: "Area Kerja", accessor: "area_kerja" },
          { header: "Telepon", accessor: "telepon" },
          { header: "Tanggal Bergabung", accessor: "tanggal_bergabung" },
          { header: "Status", accessor: "status" },
        ]}
      />

      <QrCardDialog
        open={qrTarget !== null}
        onOpenChange={(open) => {
          if (!open) setQrTarget(null)
        }}
        petugas={
          qrTarget
            ? {
                id: qrTarget.id,
                nama: qrTarget.nama,
                kode: qrTarget.kode,
                jabatan: qrTarget.jabatan,
              }
            : null
        }
      />
    </>
  )
}