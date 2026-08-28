"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { ExportModal } from "@/components/export-modal"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch, DateInput } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  BiUserCheck,
  BiChevronRight,
  BiChevronLeft,
  BiDotsVerticalRounded,
  BiSolidReport,
  BiShow,
  BiEditAlt,
  BiQr,
  BiCalendar,
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
import { FormDrawer, FormInput, FormSelect } from "@/components/forms"
import { useApiList, useApiCreate } from "@/hooks/use-api"
import { useOptions } from "@/hooks/use-options"
import { getErrorMessage } from "@/lib/api"
import { formatDate, statusColor, statusLabel } from "@/lib/status"
import { QrScannerPanel } from "@/components/absensi/qr-scanner-panel"
import { cn } from "@/lib/utils"
import type { Absensi, AbsensiPayload, Gudang, Shift, User } from "@/types"

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

function addDaysParam(param: string, days: number): string {
  const d = new Date(param + "T00:00:00")
  d.setDate(d.getDate() + days)
  return toDateParam(d)
}

const ABSENSI_STATUS_OPTIONS = [
  { value: "hadir", label: "Hadir" },
  { value: "terlambat", label: "Terlambat" },
  { value: "izin", label: "Izin" },
  { value: "cuti", label: "Cuti" },
  { value: "sakit", label: "Sakit" },
  { value: "alpha", label: "Alpha" },
]

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Semua Status" },
  ...ABSENSI_STATUS_OPTIONS,
]

export default function PresensiPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("hari-ini")
  const [selectedDate, setSelectedDate] = useState(() =>
    toDateParam(new Date())
  )
  const [searchQuery, setSearchQuery] = useState("")
  const deferredSearch = useDeferredValue(searchQuery)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formUserId, setFormUserId] = useState("")
  const [formGudangId, setFormGudangId] = useState("")
  const [formShiftId, setFormShiftId] = useState("")
  const [formStatus, setFormStatus] = useState("hadir")
  const [formJamMasuk, setFormJamMasuk] = useState("")
  const [formJamPulang, setFormJamPulang] = useState("")
  const [formKeterangan, setFormKeterangan] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const absensiQuery = useApiList<Absensi>({
    key: "absensi",
    url: "/absensi",
    params: { tanggal: selectedDate, per_page: 100 },
  })

  const usersOptions = useOptions<User>("users", "/user")
  const gudangOptions = useOptions<Gudang>("gudang", "/gudang")
  const shiftsQuery = useApiList<Shift>({
    key: "shifts",
    url: "/shift",
    params: { per_page: 100 },
  })
  const shifts = unwrapRows<Shift>(shiftsQuery.data)

  const rawRows = unwrapRows<Absensi>(absensiQuery.data)

  const todayParam = toDateParam(new Date())
  const isToday = selectedDate === todayParam

  const shiftDate = (days: number) => {
    setSelectedDate((prev) => addDaysParam(prev, days))
  }

  const handleStatusChange = (val: string | null) => {
    if (!val || val === "all") setStatusFilter(null)
    else setStatusFilter(val)
  }

  const rows = useMemo(() => {
    const query = deferredSearch.toLowerCase().trim()
    return rawRows.filter((row) => {
      // Kontrak v3: baris bisa milik karyawan native (petugas) atau akun
      const nama = row.nama ?? row.user?.name ?? ""
      const kode = row.petugas?.kode ?? row.user?.no_pegawai ?? ""
      const matchesSearch =
        !query ||
        nama.toLowerCase().includes(query) ||
        kode.toLowerCase().includes(query)

      const matchesStatus =
        !statusFilter || statusFilter === "all" || row.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [rawRows, deferredSearch, statusFilter])

  const userOptions = usersOptions.items.map((user) => ({
    value: String(user.id),
    label: user.name,
  }))
  const gudangOptionsList = gudangOptions.items.map((gudang) => ({
    value: String(gudang.id),
    label: gudang.nama,
  }))
  const shiftOptions = shifts.map((shift) => ({
    value: String(shift.id),
    label: `${shift.nama} (${shift.jam_masuk} - ${shift.jam_pulang})`,
  }))

  const createMutation = useApiCreate<Absensi, AbsensiPayload>(
    "absensi",
    "/absensi"
  )

  const openCreate = () => {
    setFormUserId("")
    setFormGudangId("")
    setFormShiftId("")
    setFormStatus("hadir")
    setFormJamMasuk("")
    setFormJamPulang("")
    setFormKeterangan("")
    setDrawerOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formUserId || !formGudangId || !formShiftId) {
      toast.error("Petugas, gudang, dan shift wajib diisi")
      return
    }
    // Kontrak v4: koreksi manual wajib keterangan utk audit (min 5 karakter)
    if (!formKeterangan.trim() || formKeterangan.trim().length < 5) {
      toast.error("Keterangan wajib diisi minimal 5 karakter")
      return
    }
    setSubmitting(true)
    try {
      await createMutation.mutateAsync({
        user_id: Number(formUserId),
        gudang_id: Number(formGudangId),
        shift_id: Number(formShiftId),
        tanggal: selectedDate,
        status: formStatus,
        jam_masuk: formJamMasuk || undefined,
        jam_pulang: formJamPulang || undefined,
        keterangan: formKeterangan.trim() || undefined,
      })
      toast.success("Absensi berhasil dicatat")
      setDrawerOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const exportUrl = `/laporan/absensi?format=excel&from=${selectedDate}&to=${selectedDate}`

  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[{ label: "SDM & Kehadiran" }, { label: "Presensi Harian" }]}
            title="Presensi Harian"
            icon={BiUserCheck}
            description="Rekam kehadiran harian petugas via scan QR atau input manual."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
            <Button variant="default" onClick={openCreate}>
              <BiUserCheck className="mr-2" />
              Input Manual
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="wrapper mt-[30px]">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="hari-ini">
              <BiUserCheck className="mr-1.5 size-4" />
              Presensi Hari Ini
            </TabsTrigger>
            <TabsTrigger value="scan-qr">
              <BiQr className="mr-1.5 size-4" />
              Scan QR
            </TabsTrigger>
          </TabsList>

          {/* Tab: Presensi Hari Ini */}
          <TabsContent value="hari-ini">
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <InputSearch
                placeholder="Cari NIK, nama, atau nomor HP..."
                className="min-w-[220px] flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Date navigator — optimal untuk harian: 1 klik prev/next + Hari Ini */}
              <div className="flex h-[42px] items-center overflow-hidden rounded-2xl border border-border bg-card">
                <button
                  type="button"
                  aria-label="Hari sebelumnya"
                  onClick={() => shiftDate(-1)}
                  className="flex size-[42px] cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <BiChevronLeft className="size-4" />
                </button>
                <DateInput
                  value={selectedDate}
                  max={todayParam}
                  onChange={(e) =>
                    setSelectedDate(e.target.value || todayParam)
                  }
                  className="h-[42px] w-[148px] rounded-none border-0 border-x border-border bg-transparent px-2 text-center text-sm"
                  title="Pilih tanggal presensi"
                />
                <button
                  type="button"
                  aria-label="Hari berikutnya"
                  onClick={() => shiftDate(1)}
                  disabled={isToday}
                  className={cn(
                    "flex size-[42px] cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    isToday && "pointer-events-none opacity-30"
                  )}
                >
                  <BiChevronRight className="size-4" />
                </button>
                {!isToday && (
                  <>
                    <div className="h-6 w-px bg-border" />
                    <button
                      type="button"
                      onClick={() => setSelectedDate(todayParam)}
                      className="cursor-pointer px-3.5 text-xs font-semibold whitespace-nowrap text-foreground transition-colors hover:bg-muted h-full"
                    >
                      Hari Ini
                    </button>
                  </>
                )}
              </div>
              <Opsion
                placeholder="Semua Status"
                value={statusFilter ?? ""}
                onValueChange={handleStatusChange}
                options={STATUS_FILTER_OPTIONS}
                className="h-[42px] w-[160px]"
              />
            </div>
            {/* Feedback bar — bikin filter terasa bekerja */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 px-2.5 py-1 font-medium text-muted-foreground">
                <BiCalendar className="size-3.5" />
                {formatDate(selectedDate)}
                {isToday && " · Hari Ini"}
              </span>
              <span className="text-muted-foreground/70">
                {absensiQuery.isFetching
                  ? "Memperbarui…"
                  : absensiQuery.isLoading
                    ? "Memuat…"
                    : `${rows.length} data${statusFilter ? ` · ${statusLabel(statusFilter)}` : ""}${deferredSearch.trim() ? ` · cari “${deferredSearch.trim()}”` : ""}`}
              </span>
              {(statusFilter || deferredSearch.trim()) && !absensiQuery.isLoading && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter(null)
                  }}
                  className="cursor-pointer font-medium text-foreground underline-offset-2 hover:underline"
                >
                  Reset filter
                </button>
              )}
            </div>

            <div className="mt-4">
              <Table>
                <TableHeader className="border-b border-border/60 bg-white">
                  <TableRow className="h-14 hover:bg-transparent">
                    <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                      Kode Pegawai
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                      Nama Lengkap
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                      Tanggung Jawab
                    </TableHead>
                    <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                      Shift Kerja
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                      Jam Masuk
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                      Jam Keluar
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                      Keterangan Kehadiran
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                      Sumber
                    </TableHead>
                    <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absensiQuery.isLoading && (
                    <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                      <TableCell
                        colSpan={9}
                        className="text-center text-sm text-muted-foreground"
                      >
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  )}
                  {!absensiQuery.isLoading && rows.length === 0 && (
                    <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                      <TableCell
                        colSpan={9}
                        className="text-center text-sm text-muted-foreground"
                      >
                        {rawRows.length === 0
                          ? `Tidak ada data presensi pada ${formatDate(selectedDate)}.`
                          : `Tidak ada hasil untuk filter saat ini pada ${formatDate(selectedDate)}.`}
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="h-16 border-b border-border/40 hover:bg-muted/30"
                    >
                      <TableCell className="pl-6 font-sans text-sm text-foreground">
                        {row.petugas?.kode ?? row.user?.no_pegawai ?? "-"}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        {row.nama ?? row.user?.name ?? "-"}
                      </TableCell>
                      <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                        {row.petugas?.jabatan ??
                          (row.user?.roles
                            ?.map((role) => role.name)
                            .join(", ") ||
                            "-")}
                      </TableCell>
                      <TableCell className="font-sans text-sm">
                        <ColoredBadge color="gray">
                          {row.shift?.nama ?? "-"}
                        </ColoredBadge>
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm text-foreground">
                        {row.jam_masuk ?? "-"}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm text-foreground">
                        {row.jam_pulang ?? "-"}
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm">
                        <ColoredBadge color={statusColor(row.status)}>
                          {statusLabel(row.status)}
                        </ColoredBadge>
                      </TableCell>
                      <TableCell className="text-center font-sans text-sm">
                        <div className="flex items-center justify-center gap-1.5">
                          <ColoredBadge
                            color={row.sumber === "manual" ? "gray" : "blue"}
                          >
                            {row.sumber === "manual" ? "Manual" : "Scan QR"}
                          </ColoredBadge>
                          {row.di_luar_jadwal && (
                            <ColoredBadge color="yellow">
                              Di Luar Jadwal
                            </ColoredBadge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 text-muted-foreground">
                          <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                            <BiChevronRight className="size-4 text-foreground/75" />
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors outline-none hover:bg-muted">
                              <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel>
                                Aksi Presensi
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <BiShow />
                                <span>Lihat Detail</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BiEditAlt />
                                <span>Koreksi Absen</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tab: Scan QR */}
          <TabsContent value="scan-qr">
            <div className="mx-auto mt-4 max-w-lg">
              <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-sm font-medium text-blue-800">
                  💡 Mode Scan QR — Arahkan kamera ke QR Card petugas.
                </p>
                <p className="mt-0.5 text-xs text-blue-600">
                  Sistem akan otomatis mendeteksi apakah petugas sedang masuk
                  atau pulang berdasarkan data hari ini.
                </p>
              </div>
              <QrScannerPanel
                onSuccess={() => {
                  void absensiQuery.refetch()
                  setActiveTab("hari-ini")
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Manual Input Drawer */}
      <FormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Input Manual Absensi"
        description={`Rekam kehadiran petugas untuk ${formatDate(selectedDate)} (${selectedDate}).`}
        icon={BiUserCheck}
      >
        <FormDrawer.Body>
          <form
            id="absensi-form"
            onSubmit={(e) => void handleSubmit(e)}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <FormSelect
                label="Nama Petugas *"
                placeholder="Pilih petugas..."
                value={formUserId}
                onValueChange={(val) => setFormUserId(val ?? "")}
                options={userOptions}
              />
              <FormSelect
                label="Shift Kerja *"
                placeholder="Pilih shift..."
                value={formShiftId}
                onValueChange={(val) => setFormShiftId(val ?? "")}
                options={shiftOptions}
              />
              <FormSelect
                label="Gudang *"
                placeholder="Pilih gudang..."
                value={formGudangId}
                onValueChange={(val) => setFormGudangId(val ?? "")}
                options={gudangOptionsList}
              />
              <FormSelect
                label="Status Kehadiran *"
                placeholder="Pilih status..."
                value={formStatus}
                onValueChange={(val) => setFormStatus(val ?? "hadir")}
                options={ABSENSI_STATUS_OPTIONS}
              />
              <FormInput
                label="Jam Masuk"
                type="time"
                value={formJamMasuk}
                onChange={(e) => setFormJamMasuk(e.target.value)}
              />
              <FormInput
                label="Jam Pulang"
                type="time"
                value={formJamPulang}
                onChange={(e) => setFormJamPulang(e.target.value)}
              />
            </div>
            <FormInput
              label="Keterangan *"
              placeholder="Wajib — alasan/konteks koreksi manual..."
              value={formKeterangan}
              onChange={(e) => setFormKeterangan(e.target.value)}
            />
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
            form="absensi-form"
            className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
            disabled={submitting}
          >
            {submitting ? "Menyimpan..." : "Simpan Absensi"}
          </Button>
        </FormDrawer.Footer>
      </FormDrawer>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Data Presensi"
        totalItemsCount={rows.length}
        totalItemsLabel="Total Kehadiran"
        filterLabel="Filter Aktif"
        exportUrl={exportUrl}
        checkboxes={[
          { id: "nama", label: "Nama & NIP", defaultChecked: true },
          { id: "jadwal", label: "Jadwal Shift", defaultChecked: true },
          { id: "jamMasuk", label: "Jam Masuk & Keluar", defaultChecked: true },
          { id: "status", label: "Status Kehadiran", defaultChecked: true },
        ]}
      />
    </>
  )
}
