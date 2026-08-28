"use client"

import { ExportModal } from "@/components/export-modal"
import { useDeferredValue, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useApiList, useApiAction, useApiCreate } from "@/hooks/use-api"
import { useOptions, toOptions } from "@/hooks/use-options"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { toast } from "sonner"
import api from "@/lib/api"
import { getErrorMessage } from "@/lib/api"
import { statusLabel, statusColor, formatDate } from "@/lib/status"
import { useAuthStore } from "@/store/use-auth-store"
import {
  BiClipboard,
  BiSolidReport,
  BiCheckCircle,
  BiTimeFive,
  BiShow,
  BiPlay,
  BiPlusCircle,
} from "react-icons/bi"
import {
  FormModal,
  FormDate,
  FormSelect,
  FormTextarea,
  FormReferenceInput,
} from "@/components/forms"
import { generateReferenceNumber } from "@/lib/reference-number"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { StatGridSkeleton, TableSkeletonRows } from "@/components/skeletons"
import type { Gudang, StokOpname, StokOpnamePayload } from "@/types"

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "Dalam Proses" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
]

export default function OpnamePage() {
  const [exportOpen, setExportOpen] = useState(false)
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const deferredSearch = useDeferredValue(searchQuery)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [gudangFilter, setGudangFilter] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const { data, isLoading } = useApiList<StokOpname>({
    key: "opname",
    url: "/stok-opname",
    params: {
      page: currentPage,
      per_page: itemsPerPage,
      search: deferredSearch || undefined,
      status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
      gudang_id:
        gudangFilter && gudangFilter !== "all"
          ? Number(gudangFilter)
          : undefined,
    },
  })
  const { data: inProgressData } = useApiList<StokOpname>({
    key: "opname-count-inprogress",
    url: "/stok-opname",
    params: { per_page: 1, status: "in_progress" },
  })
  const { data: completedData } = useApiList<StokOpname>({
    key: "opname-count-completed",
    url: "/stok-opname",
    params: { per_page: 1, status: "completed" },
  })

  const startMutation = useApiAction("opname", "/stok-opname", "start")
  const createMutation = useApiCreate<StokOpname, StokOpnamePayload>(
    "opname",
    "/stok-opname"
  )

  const { items: gudangList } = useOptions<Gudang>("gudang", "/gudang")
  const gudangOptions = [
    { value: "all", label: "Semua Gudang" },
    ...toOptions(gudangList),
  ]
  const hasPermission = useAuthStore((state) => state.hasPermission)

  const rows = data?.data ?? []
  const meta = data?.meta
  const totalPages = Math.max(1, meta?.last_page ?? 1)

  const fetchExportData = useCallback(
    async (coverage: "all" | "filtered") => {
      const res = await api.get("/stok-opname", {
        params: {
          per_page: 9999,
          search:
            coverage === "filtered" ? deferredSearch || undefined : undefined,
          status:
            statusFilter && statusFilter !== "all" ? statusFilter : undefined,
          gudang_id:
            gudangFilter && gudangFilter !== "all"
              ? Number(gudangFilter)
              : undefined,
        },
      })
      const items = (res.data?.data ?? []) as Array<Record<string, unknown>>
      return items.map((row) => ({
        no_referensi: row.no_referensi ?? "-",
        tanggal: formatDate(row.tanggal as string),
        gudang: (row.gudang as Record<string, unknown>)?.nama ?? "-",
        total_sku: Array.isArray(row.details) ? row.details.length : 0,
        petugas: (row.createdBy as Record<string, unknown>)?.name ?? "-",
        status: statusLabel(row.status as string),
      }))
    },
    [deferredSearch, statusFilter, gudangFilter]
  )

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newNoDokumen, setNewNoDokumen] = useState("")
  const [newTanggal, setNewTanggal] = useState("")
  const [newGudang, setNewGudang] = useState("")
  const [newCatatan, setNewCatatan] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleOpenModal = () => {
    const today = new Date().toISOString().slice(0, 10)
    const existingRefs = rows.map((item) => item.no_referensi).filter(Boolean)
    const nextNoDoc = generateReferenceNumber("SO", {
      date: today,
      existingRefs,
    })
    setNewNoDokumen(nextNoDoc)
    setNewTanggal(today)
    setNewGudang("")
    setNewCatatan("")
    setIsModalOpen(true)
  }

  const handleRegenerateOpnameRef = () => {
    const existingRefs = rows.map((item) => item.no_referensi).filter(Boolean)
    const nextNoDoc = generateReferenceNumber("SO", {
      date: newTanggal || new Date(),
      existingRefs,
      currentRef: newNoDokumen,
    })
    setNewNoDokumen(nextNoDoc)
  }

  const handleCreateOpname = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const response = await createMutation.mutateAsync({
        no_referensi: newNoDokumen,
        gudang_id: Number(newGudang),
        tanggal: newTanggal,
        keterangan: newCatatan || undefined,
      })
      toast.success(response.message)
      setIsModalOpen(false)
      if (hasPermission("stok-opname-start")) {
        await startMutation.mutateAsync(response.data.id)
        toast.success("Audit opname dimulai")
        router.push(`/inventory/opname/${response.data.id}?mode=edit`)
      } else {
        router.push(`/inventory/opname/${response.data.id}?mode=view`)
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleStart = async (row: StokOpname) => {
    try {
      const response = await startMutation.mutateAsync(row.id)
      toast.success(response.message)
      router.push(`/inventory/opname/${row.id}?mode=edit`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const renderStatusBadge = (status: string) => (
    <ColoredBadge color={statusColor(status)}>
      {statusLabel(status)}
    </ColoredBadge>
  )

  const renderVarianceBadge = (selisihTotal: number | null) => {
    if (selisihTotal === null || selisihTotal === undefined) {
      return (
        <span className="font-sans text-sm whitespace-nowrap text-muted-foreground">
          Belum Audit
        </span>
      )
    }
    if (selisihTotal === 0) {
      return <ColoredBadge color="green">0 (Aman)</ColoredBadge>
    }
    return (
      <ColoredBadge color={selisihTotal < 0 ? "red" : "yellow"}>
        {selisihTotal > 0 ? "+" : ""}
        {selisihTotal}
      </ColoredBadge>
    )
  }

  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[{ label: "Aktivitas Gudang" }, { label: "Stok Opname" }]}
            title="Stok Opname"
            icon={BiClipboard}
            description="Cocokkan stok sistem dengan stok fisik aktual."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export (.excel/.pdf)
            </Button>
            <Button variant="default" onClick={handleOpenModal}>
              + Opname Baru
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="wrapper mt-[35px]">
          <StatGridSkeleton count={4} />
        </div>
      ) : (
        <div className="wrapper mt-[35px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <BiClipboard className="size-4 text-muted-foreground" />
              <span>Total Sesi Bulan Ini</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {meta?.total ?? 0}
              </span>
              <span className="text-xs font-semibold text-muted-foreground/70">Sesi</span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-muted-foreground/70">
              Audit rutin & insidental
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <BiTimeFive className="size-4 text-amber-600 dark:text-amber-400" />
              <span>Dalam Proses Audit</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#D97706]">
                {inProgressData?.meta?.total ?? 0}
              </span>
              <span className="text-xs font-semibold text-[#D97706]/85">
                Sesi
              </span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-muted-foreground/70">
              Sedang dihitung auditor
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <BiCheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Selesai (Completed)</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#1E824C]">
                {completedData?.meta?.total ?? 0}
              </span>
              <span className="text-xs font-semibold text-[#1E824C]/85">
                Sesi
              </span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-muted-foreground/70">
              Sudah diapprove & diadjust
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <BiClipboard className="size-4 text-blue-600" />
              <span>Akurasi Stok Rata-rata</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {completedData?.meta?.total && meta?.total
                  ? `${Math.round((completedData.meta.total / Math.max(meta.total, 1)) * 100)}%`
                  : "-"}
              </span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-muted-foreground/70">
              Rasio sesi selesai terhadap total
            </div>
          </div>
        </div>
      )}

      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-3">
          <InputSearch
            placeholder="Cari no. dokumen, lokasi, atau petugas..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="flex-1"
          />
          <Opsion
            placeholder="Semua Status"
            value={statusFilter || ""}
            onValueChange={(val) => {
              setStatusFilter(val)
              setCurrentPage(1)
            }}
            className="w-[245px]"
            options={STATUS_OPTIONS}
          />
          <Opsion
            placeholder="Semua Gudang"
            value={gudangFilter || ""}
            onValueChange={(val) => {
              setGudangFilter(val)
              setCurrentPage(1)
            }}
            className="w-[245px]"
            options={gudangOptions}
          />
        </div>
      </div>

      <div className="wrapper mt-[25px]">
        <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <TableHeader className="border-b border-border/60 bg-card">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    No. Dokumen Audit
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Tanggal Audit
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Lokasi Gudang
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Total SKU
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Variance (Selisih)
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Petugas Audit
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Status
                  </TableHead>
                  <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="min-h-[300px]">
                {isLoading && <TableSkeletonRows columns={8} rows={6} />}
                {!isLoading && rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-48 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data opname.
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((row) => {
                  const selisihTotal = row.details?.length
                    ? row.details.reduce((sum, d) => sum + (d.selisih ?? 0), 0)
                    : null
                  return (
                    <TableRow
                      key={row.id}
                      className="h-16 border-b border-border/40 hover:bg-muted/30"
                    >
                      <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                        {row.no_referensi}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        {formatDate(row.tanggal)}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        {row.gudang?.nama ?? "-"}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        {row.details?.length
                          ? `${row.details.length} SKU`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                        {renderVarianceBadge(selisihTotal)}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        {row.createdBy?.name ?? "-"}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                        {renderStatusBadge(row.status)}
                      </TableCell>
                      <TableCell className="pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          {row.status === "in_progress" && (
                            <button
                              onClick={() =>
                                router.push(
                                  `/inventory/opname/${row.id}?mode=edit`
                                )
                              }
                              className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] bg-foreground px-3.5 text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
                            >
                              <span>Lanjutkan</span>
                              <span className="text-sm font-light">→</span>
                            </button>
                          )}
                          {(row.status === "completed" ||
                            row.status === "cancelled") && (
                            <button
                              onClick={() =>
                                router.push(
                                  `/inventory/opname/${row.id}?mode=view`
                                )
                              }
                              className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] border border-border bg-card px-3.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              <BiShow className="size-4 text-muted-foreground/90" />
                              <span>Detail</span>
                            </button>
                          )}
                          {row.status === "draft" && (
                            <button
                              onClick={() => handleStart(row)}
                              className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] border border-border bg-card px-3.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              <BiPlay className="size-4 text-muted-foreground/90" />
                              <span>Mulai Audit</span>
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {rows.length < itemsPerPage && rows.length > 0 && (
                  <TableRow
                    style={{ height: `${(itemsPerPage - rows.length) * 64}px` }}
                    className="pointer-events-none border-none hover:bg-transparent"
                  >
                    <TableCell colSpan={8} className="border-none p-0" />
                  </TableRow>
                )}
              </TableBody>
            </table>
          </div>

          <div className="flex h-14 items-center justify-between border-t border-border/50 bg-card px-6 font-sans text-xs text-muted-foreground select-none">
            <span>
              Menampilkan{" "}
              {meta?.total ? (currentPage - 1) * itemsPerPage + 1 : 0}-
              {Math.min(currentPage * itemsPerPage, meta?.total ?? 0)} dari{" "}
              {meta?.total ?? 0} data
            </span>
            <div className="flex items-center">
              <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        "flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 font-medium transition-colors last:border-r-0",
                        currentPage === p
                          ? "bg-muted/60 text-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  &gt;
                </button>
              </div>
            </div>
            <span>{itemsPerPage} per halaman</span>
          </div>
        </div>
      </div>

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Buat Sesi Opname Baru"
        description="Inisiasi jadwal audit fisik barang di gudang"
        icon={BiPlusCircle}
      >
        <form onSubmit={handleCreateOpname}>
          <FormModal.Body>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormReferenceInput
                label="Nomor Referensi"
                required
                value={newNoDokumen}
                onRegenerate={handleRegenerateOpnameRef}
                placeholder="cth. SO-202608-001"
                onChange={(e) => setNewNoDokumen(e.target.value)}
              />
              <FormDate
                label="Tanggal Audit"
                required
                value={newTanggal}
                onChange={(e) => setNewTanggal(e.target.value)}
              />
              <FormSelect
                label="Lokasi Gudang"
                required
                value={newGudang}
                onValueChange={(val) => setNewGudang(val || "")}
                options={toOptions(gudangList)}
              />
              <FormTextarea
                label="Catatan / Instruksi Audit"
                placeholder="Masukkan catatan khusus untuk petugas lapangan..."
                value={newCatatan}
                onChange={(e) => setNewCatatan(e.target.value)}
                className="col-span-1 md:col-span-2"
                rows={3}
              />
            </div>
          </FormModal.Body>
          <FormModal.Footer>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="h-10 min-h-10 px-6 font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={submitting}
              className="flex h-10 min-h-10 items-center gap-1.5 px-6 font-semibold"
            >
              <BiPlay className="size-4" />
              <span>{submitting ? "Menyimpan..." : "Buat Opname"}</span>
            </Button>
          </FormModal.Footer>
        </form>
      </FormModal>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Laporan Opname"
        totalItemsCount={meta?.total ?? 0}
        totalItemsLabel="Total Opname"
        filterLabel="Filter Aktif"
        checkboxes={[
          { id: "noOpname", label: "No. Opname", defaultChecked: true },
          { id: "gudang", label: "Lokasi Gudang", defaultChecked: true },
          { id: "barang", label: "Detail Barang & SKU", defaultChecked: true },
          { id: "status", label: "Status Opname", defaultChecked: true },
        ]}
        fetchExportData={fetchExportData}
        exportColumns={[
          { header: "No. Dokumen", accessor: "no_referensi" },
          { header: "Tanggal", accessor: "tanggal" },
          { header: "Gudang", accessor: "gudang" },
          { header: "Total SKU", accessor: "total_sku" },
          { header: "Petugas", accessor: "petugas" },
          { header: "Status", accessor: "status" },
        ]}
      />
    </>
  )
}