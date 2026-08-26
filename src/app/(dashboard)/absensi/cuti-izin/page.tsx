"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { ExportModal } from "@/components/export-modal"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch, DateInput } from "@/components/input"
import { toast } from "sonner"
import {
  BiCalendarAlt,
  BiPlus,
  BiSolidReport,
  BiChevronRight,
  BiDotsVerticalRounded,
  BiShow,
  BiCheckCircle,
  BiXCircle,
  BiPaperclip,
  BiBlock,
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
} from "@/components/ui/table"
import { ColoredBadge } from "@/components/ui/colored-badge"
import {
  FormDrawer,
  FormSelect,
  FormTextarea,
  FormDate,
} from "@/components/forms"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useApiList, useApiCreate } from "@/hooks/use-api"
import { useOptions } from "@/hooks/use-options"
import { useConfirmDialog } from "@/components/confirm-dialog"
import api, { getErrorMessage, uploadFile } from "@/lib/api"
import { formatDate } from "@/lib/status"
import { useAuthStore } from "@/store/use-auth-store"
import type { IzinJenis, IzinPayload, IzinRequest, User } from "@/types"

// Cuti & Izin — modul /api/izin dengan alur pengajuan → persetujuan

function unwrapRows<T>(data: unknown): T[] {
  const body = data as { data?: unknown } | T[] | null | undefined
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === "object" && Array.isArray(body.data)) {
    return body.data as T[]
  }
  return []
}

function toDateParam(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const JENIS_OPTIONS: { value: IzinJenis; label: string }[] = [
  { value: "cuti", label: "Cuti Tahunan" },
  { value: "izin", label: "Izin Mendadak" },
  { value: "sakit", label: "Sakit" },
]

const JENIS_LABEL: Record<IzinJenis, string> = {
  izin: "Izin",
  sakit: "Sakit",
  cuti: "Cuti",
}

const STATUS_STYLE: Record<
  string,
  { color: "green" | "red" | "yellow" | "gray"; label: string }
> = {
  menunggu: { color: "yellow", label: "Menunggu" },
  disetujui: { color: "green", label: "Disetujui" },
  ditolak: { color: "red", label: "Ditolak" },
  dibatalkan: { color: "gray", label: "Dibatalkan" },
}

export default function CutiIzinPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const authUser = useAuthStore((state) => state.user)
  const canApprove = hasPermission("izin-approve")
  // Kontrak izin-v2: pemegang izin-edit boleh mengajukan atas nama petugas
  // lain + backdate (rule 6.6 dokumen)
  const canOnBehalf = hasPermission("izin-edit")
  const canDeleteIzin = hasPermission("izin-delete")

  const [exportOpen, setExportOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<IzinRequest | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const deferredSearch = useDeferredValue(searchQuery)
  const [filterFrom, setFilterFrom] = useState("")
  const [filterTo, setFilterTo] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formJenis, setFormJenis] = useState<IzinJenis>("cuti")
  const [formTanggalMulai, setFormTanggalMulai] = useState(
    toDateParam(new Date())
  )
  const [formTanggalSelesai, setFormTanggalSelesai] = useState(
    toDateParam(new Date())
  )
  const [formAlasan, setFormAlasan] = useState("")
  const [formBukti, setFormBukti] = useState<File | null>(null)
  const [formTargetUserId, setFormTargetUserId] = useState("")

  const usersOptions = useOptions<User>("users", "/user")

  // Pengajuan izin/sakit/cuti via modul /izin
  const izinQuery = useApiList<IzinRequest>({
    key: "cuti-izin",
    url: "/izin",
    params: {
      per_page: 100,
      ...(filterFrom && { from: filterFrom }),
      ...(filterTo && { to: filterTo }),
    },
  })

  const rows = useMemo(() => {
    const base = unwrapRows<IzinRequest>(izinQuery.data)
    const q = deferredSearch.toLowerCase().trim()
    if (!q) return base
    return base.filter((r) => {
      // Kontrak portal-izin v2: baris bisa ber-subjek petugas native
      const nama = r.nama ?? r.user?.name ?? ""
      const kode = r.petugas?.kode ?? r.user?.no_pegawai ?? ""
      return nama.toLowerCase().includes(q) || kode.toLowerCase().includes(q)
    })
  }, [izinQuery.data, deferredSearch])

  const createMutation = useApiCreate<IzinRequest, IzinPayload>(
    "cuti-izin",
    "/izin"
  )

  const openCreate = () => {
    setFormJenis("cuti")
    setFormTanggalMulai(toDateParam(new Date()))
    setFormTanggalSelesai(toDateParam(new Date()))
    setFormAlasan("")
    setFormBukti(null)
    setFormTargetUserId("")
    setDrawerOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formTanggalSelesai < formTanggalMulai) {
      toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai")
      return
    }
    if (!formAlasan.trim()) {
      toast.error("Alasan wajib diisi")
      return
    }
    // Rule 6.6: self-service tidak boleh backdate
    const hariIni = toDateParam(new Date())
    if (!canOnBehalf && formTanggalMulai < hariIni) {
      toast.error(
        "Pengajuan mundur hanya bisa melalui Admin Gudang. Hubungi admin untuk koreksi."
      )
      return
    }
    const onBehalfOf =
      canOnBehalf &&
      formTargetUserId &&
      Number(formTargetUserId) !== authUser?.id
    if (onBehalfOf && !formTargetUserId) {
      toast.error("Pilih petugas tujuan")
      return
    }
    setSubmitting(true)
    try {
      let buktiUrl: string | undefined
      if (formBukti) {
        const uploaded = await uploadFile(formBukti)
        buktiUrl = uploaded.url
      }
      await createMutation.mutateAsync({
        jenis: formJenis,
        tanggal_mulai: formTanggalMulai,
        tanggal_selesai: formTanggalSelesai,
        alasan: formAlasan.trim(),
        ...(buktiUrl && { bukti: buktiUrl }),
        ...(onBehalfOf && { user_id: Number(formTargetUserId) }),
      })
      toast.success(
        onBehalfOf
          ? "Pengajuan atas nama petugas berhasil dikirim"
          : "Pengajuan cuti/izin berhasil dikirim"
      )
      setDrawerOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (row: IzinRequest) => {
    try {
      await api.post(`/izin/${row.id}/approve`)
      toast.success("Pengajuan disetujui")
      await izinQuery.refetch()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleRejectOpen = (row: IzinRequest) => {
    setSelectedRow(row)
    setRejectNote("")
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedRow) return
    // Kontrak izin-v2: catatan penolakan WAJIB min 5 karakter
    if (rejectNote.trim().length < 5) {
      toast.error("Alasan penolakan wajib diisi (minimal 5 karakter)")
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/izin/${selectedRow.id}/reject`, {
        catatan_penolakan: rejectNote.trim(),
      })
      toast.success("Pengajuan ditolak")
      setRejectDialogOpen(false)
      await izinQuery.refetch()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const { confirm, ConfirmDialog } = useConfirmDialog()

  const handleCancel = (row: IzinRequest) => {
    const isApproved = row.status === "disetujui"
    confirm({
      title: isApproved ? "Batalkan Pengajuan Disetujui" : "Batalkan Pengajuan",
      itemName: `${row.user?.name ?? `User #${row.user_id}`} · ${JENIS_LABEL[row.jenis] ?? row.jenis}`,
      description: isApproved
        ? "Pengajuan yang sudah disetujui akan dibatalkan dan record absensi hasil generate pada periode tersebut IKUT DIHAPUS. Riwayat pengajuan tetap tersimpan sebagai dibatalkan."
        : "Pengajuan akan ditandai dibatalkan. Data tidak bisa dikembalikan.",
      confirmLabel: "Ya, Batalkan",
      onConfirm: async () => {
        try {
          await api.post(`/izin/${row.id}/cancel`)
          toast.success("Pengajuan berhasil dibatalkan")
          await izinQuery.refetch()
        } catch (error) {
          toast.error(getErrorMessage(error))
        }
      },
    })
  }

  const exportUrl = `/laporan/absensi?format=excel${filterFrom ? `&from=${filterFrom}` : ""}${filterTo ? `&to=${filterTo}` : ""}`

  return (
    <>
      {ConfirmDialog}
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[{ label: "SDM & Kehadiran" }, { label: "Cuti & Izin" }]}
            title="Cuti & Izin"
            icon={BiCalendarAlt}
            description="Ajukan dan kelola cuti, izin, serta sakit petugas gudang."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export Rekap
            </Button>
            <Button variant="default" onClick={openCreate}>
              <BiPlus className="mr-2" />
              Ajukan Cuti/Izin
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari nama atau NIP petugas..."
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <DateInput
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="h-[42px] w-[150px] rounded-2xl"
            placeholder="Dari tanggal"
          />
          <DateInput
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="h-[42px] w-[150px] rounded-2xl"
            placeholder="Sampai tanggal"
          />
        </div>
      </div>

      {/* Table */}
      <div className="wrapper mt-[25px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Kode Pegawai
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Nama Petugas
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Jenis
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Periode
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Alasan
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
            {izinQuery.isLoading && (
              <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="text-center text-sm text-muted-foreground"
                >
                  Memuat data...
                </TableCell>
              </TableRow>
            )}
            {!izinQuery.isLoading && rows.length === 0 && (
              <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="text-center text-sm text-muted-foreground"
                >
                  Belum ada pengajuan cuti atau izin.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => {
              const status =
                STATUS_STYLE[row.status] ?? STATUS_STYLE["menunggu"]
              // Kontrak izin-v2: batalkan = owner saat menunggu, atau
              // pemegang izin-delete utk yang sudah disetujui
              const canBatalkan =
                (row.status === "menunggu" && row.user_id === authUser?.id) ||
                (canDeleteIzin && row.status === "disetujui")
              const hasRowMenu =
                (canApprove && row.status === "menunggu") || canBatalkan
              return (
                <TableRow
                  key={row.id}
                  className="h-16 border-b border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-sans text-sm text-foreground">
                    {row.petugas?.kode ?? row.user?.no_pegawai ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                    {row.nama ?? row.petugas?.nama ?? row.user?.name ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm">
                    <ColoredBadge
                      color={
                        row.jenis === "sakit"
                          ? "red"
                          : row.jenis === "cuti"
                            ? "blue"
                            : "gray"
                      }
                    >
                      {JENIS_LABEL[row.jenis] ?? row.jenis}
                    </ColoredBadge>
                  </TableCell>
                  <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                    {formatDate(row.tanggal_mulai)}
                    {row.tanggal_selesai !== row.tanggal_mulai &&
                      ` — ${formatDate(row.tanggal_selesai)}`}
                    {row.jumlah_hari ? ` (${row.jumlah_hari} hari)` : ""}
                  </TableCell>
                  <TableCell className="max-w-[220px] font-sans text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span className="truncate">
                        {row.status === "ditolak" && row.catatan_penolakan
                          ? `Ditolak: ${row.catatan_penolakan}`
                          : (row.alasan ?? "-")}
                      </span>
                      {row.bukti && (
                        <a
                          href={row.bukti}
                          target="_blank"
                          rel="noreferrer"
                          title="Lihat bukti"
                          className="shrink-0 text-blue-600 transition-colors hover:text-blue-700"
                        >
                          <BiPaperclip className="size-4" />
                        </a>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-sans text-sm">
                    <ColoredBadge color={status.color}>
                      {status.label}
                    </ColoredBadge>
                  </TableCell>
                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                        <BiChevronRight className="size-4 text-foreground/75" />
                      </button>
                      {hasRowMenu && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors outline-none hover:bg-muted">
                            <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>
                              {canApprove && row.status === "menunggu"
                                ? "Aksi Persetujuan"
                                : "Aksi Pengajuan"}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <BiShow />
                              <span>Lihat Detail</span>
                            </DropdownMenuItem>
                            {canApprove && row.status === "menunggu" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => void handleApprove(row)}
                                  className="text-green-600 focus:text-green-700"
                                >
                                  <BiCheckCircle />
                                  <span>Setujui</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRejectOpen(row)}
                                  className="text-red-600 focus:text-red-700"
                                >
                                  <BiXCircle />
                                  <span>Tolak</span>
                                </DropdownMenuItem>
                              </>
                            )}
                            {canBatalkan && (
                              <DropdownMenuItem
                                onClick={() => handleCancel(row)}
                                className="text-red-600 focus:text-red-700"
                              >
                                <BiBlock />
                                <span>Batalkan</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Form Drawer — Ajukan Cuti/Izin */}
      <FormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Ajukan Cuti / Izin"
        description={
          canOnBehalf
            ? "Anda dapat mengajukan atas nama petugas lain, termasuk koreksi tanggal mundur."
            : "Pengajuan tercatat atas nama akun Anda sendiri (tidak bisa mundur)."
        }
        icon={BiCalendarAlt}
      >
        <FormDrawer.Body>
          <form
            id="cuti-form"
            onSubmit={(e) => void handleSubmit(e)}
            className="space-y-5"
          >
            {canOnBehalf && (
              <FormSelect
                label="Ajukan Atas Nama"
                placeholder="Diri sendiri"
                value={formTargetUserId}
                onValueChange={(val) => setFormTargetUserId(val ?? "")}
                options={[
                  { value: "", label: "Diri sendiri" },
                  ...usersOptions.items.map((u) => ({
                    value: String(u.id),
                    label: `${u.name}${u.email ? ` (${u.email})` : ""}`,
                  })),
                ]}
              />
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <FormSelect
                label="Jenis Pengajuan *"
                placeholder="Pilih jenis..."
                value={formJenis}
                onValueChange={(val) =>
                  setFormJenis((val ?? "cuti") as IzinJenis)
                }
                options={JENIS_OPTIONS}
              />
              <div />
              <FormDate
                label="Tanggal Mulai *"
                value={formTanggalMulai}
                onChange={(e) => setFormTanggalMulai(e.target.value)}
              />
              <FormDate
                label="Tanggal Selesai *"
                value={formTanggalSelesai}
                onChange={(e) => setFormTanggalSelesai(e.target.value)}
              />
            </div>
            <FormTextarea
              label="Alasan / Keterangan"
              placeholder="Tuliskan alasan pengajuan cuti atau izin..."
              value={formAlasan}
              onChange={(e) => setFormAlasan(e.target.value)}
              rows={3}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Bukti (foto surat sakit / dokumen)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFormBukti(e.target.files?.[0] ?? null)}
                className="w-full cursor-pointer rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-background"
              />
              {formBukti && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formBukti.name}
                </p>
              )}
            </div>
          </form>
        </FormDrawer.Body>
        <FormDrawer.Footer>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDrawerOpen(false)}
            className="rounded-xl"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="cuti-form"
            className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
            disabled={submitting}
          >
            {submitting ? "Mengirim..." : "Ajukan"}
          </Button>
        </FormDrawer.Footer>
      </FormDrawer>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BiXCircle className="size-5 text-red-500" />
              Tolak Pengajuan
            </DialogTitle>
            <DialogDescription>
              Wajib isi alasan penolakan — akan dikirim sebagai notifikasi ke
              pengaju.
            </DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
              <p className="font-semibold text-foreground">
                {selectedRow.nama ??
                  selectedRow.petugas?.nama ??
                  selectedRow.user?.name ??
                  "-"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {JENIS_LABEL[selectedRow.jenis] ?? selectedRow.jenis} ·{" "}
                {formatDate(selectedRow.tanggal_mulai)} —{" "}
                {formatDate(selectedRow.tanggal_selesai)}
              </p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Alasan Penolakan *
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="Minimal 5 karakter — misal: kuota cuti habis, jadwal kritis..."
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm transition-colors outline-none focus:border-foreground/40"
            />
            {rejectNote.trim().length > 0 && rejectNote.trim().length < 5 && (
              <p className="text-xs text-red-500">Minimal 5 karakter.</p>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setRejectDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              className="flex-1 rounded-xl bg-red-600 text-white hover:bg-red-700"
              onClick={() => void handleRejectConfirm()}
              disabled={submitting || rejectNote.trim().length < 5}
            >
              {submitting ? "Memproses..." : "Konfirmasi Tolak"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Rekap Cuti & Izin"
        totalItemsCount={rows.length}
        totalItemsLabel="Total Pengajuan"
        filterLabel="Filter Aktif"
        exportUrl={exportUrl}
        checkboxes={[
          { id: "nama", label: "Nama & NIP", defaultChecked: true },
          { id: "jenis", label: "Jenis Cuti/Izin", defaultChecked: true },
          { id: "tanggal", label: "Periode", defaultChecked: true },
          { id: "status", label: "Status", defaultChecked: true },
        ]}
      />
    </>
  )
}
