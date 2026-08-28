"use client"

import { ExportModal } from "@/components/export-modal"
import { useMemo, useState, useCallback } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { useConfirmDialog } from "@/components/confirm-dialog"
import { toast } from "sonner"
import api from "@/lib/api"
import {
  BiCalendar,
  BiChevronLeft,
  BiChevronRight,
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
} from "@/components/ui/table"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { JadwalShiftForm } from "@/components/jadwal-shift/jadwal-shift-form"
import { useApiList, useApiDelete } from "@/hooks/use-api"
import { getErrorMessage } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { JadwalPetugas, Shift, User } from "@/types"

function unwrapRows<T>(data: unknown): T[] {
  const body = data as { data?: unknown } | T[] | null | undefined
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === "object" && Array.isArray(body.data)) {
    return body.data as T[]
  }
  return []
}

// ─── Date Utilities ──────────────────────────────────────────────────────────

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function toDateParam(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const HARI_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]

interface WeekDay {
  label: string
  date: Date
  dayNum: number
  isToday: boolean
}

function generateWeekDays(weekStart: Date, today: Date): WeekDay[] {
  return HARI_LABELS.map((label, i) => {
    const date = addDays(weekStart, i)
    return {
      label,
      date,
      dayNum: date.getDate(),
      isToday: isSameDay(date, today),
    }
  })
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
]

function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6)
  const startDay = weekStart.getDate()
  const startMonth = MONTH_SHORT[weekStart.getMonth()]
  const endDay = weekEnd.getDate()
  const endMonth = MONTH_SHORT[weekEnd.getMonth()]
  const endYear = weekEnd.getFullYear()

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${startDay} – ${endDay} ${endMonth} ${endYear}`
  }
  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear}`
}

const SHIFT_COLORS = ["sky", "yellow", "purple", "blue", "green"] as const

// ─── Component ────────────────────────────────────────────────────────────────

export default function JadwalShiftPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const thisMonday = useMemo(() => getMonday(today), [today])

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(thisMonday)

  const weekDays = useMemo(
    () => generateWeekDays(currentWeekStart, today),
    [currentWeekStart, today]
  )

  const isThisWeek = isSameDay(currentWeekStart, thisMonday)

  const maxWeekStart = addDays(thisMonday, 4 * 7)
  const isAtMaxWeek = currentWeekStart.getTime() >= maxWeekStart.getTime()

  const shiftsQuery = useApiList<Shift>({
    key: "shifts",
    url: "/shift",
    params: { per_page: 100 },
  })
  const jadwalQuery = useApiList<JadwalPetugas>({
    key: "jadwal-petugas",
    url: "/jadwal-petugas",
    params: { per_page: 100 },
  })
  const usersQuery = useApiList<User>({
    key: "users",
    url: "/user",
    params: { per_page: 100 },
  })

  const shifts = unwrapRows<Shift>(shiftsQuery.data)
  const allJadwal = unwrapRows<JadwalPetugas>(jadwalQuery.data)
  const users = unwrapRows<User>(usersQuery.data)

  const userMap = useMemo(() => {
    const map = new Map<number, User>()
    for (const user of users) map.set(user.id, user)
    for (const entry of allJadwal) {
      if (entry.user) map.set(entry.user.id, entry.user)
    }
    return map
  }, [users, allJadwal])

  const weekStartParam = toDateParam(currentWeekStart)
  const weekEndParam = toDateParam(addDays(currentWeekStart, 6))

  const weekJadwal = useMemo(
    () =>
      allJadwal.filter((entry) => {
        const t = entry.tanggal
        return t && t >= weekStartParam && t <= weekEndParam
      }),
    [allJadwal, weekStartParam, weekEndParam]
  )

  const weekUserIds = useMemo(
    () => [...new Set(weekJadwal.map((entry) => entry.user_id))],
    [weekJadwal]
  )

  const shiftMap = useMemo(() => {
    const map = new Map<number, Shift>()
    for (const shift of shifts) map.set(shift.id, shift)
    return map
  }, [shifts])

  const shiftColor = (shiftId: number): (typeof SHIFT_COLORS)[number] => {
    const index = Math.max(
      0,
      shifts.findIndex((s) => s.id === shiftId)
    )
    return SHIFT_COLORS[index % SHIFT_COLORS.length]
  }

  const renderShiftBadge = (
    shiftId: number | null | undefined,
    nama?: string
  ) => {
    if (shiftId === undefined || shiftId === null) {
      return (
        <ColoredBadge
          color="gray"
          className="min-w-[55px] justify-center py-1 font-medium"
        >
          OFF
        </ColoredBadge>
      )
    }
    const shift = shiftMap.get(shiftId)
    const label = shift?.nama ?? nama ?? "Shift"
    return (
      <ColoredBadge
        color={shiftColor(shiftId)}
        className="min-w-[55px] justify-center py-1"
      >
        {label}
      </ColoredBadge>
    )
  }

  const userShiftOn = (userId: number, day: WeekDay) => {
    const param = toDateParam(day.date)
    return weekJadwal.find(
      (entry) => entry.user_id === userId && entry.tanggal === param
    )
  }

  function handlePrevWeek() {
    setCurrentWeekStart((d) => addDays(d, -7))
  }

  function handleNextWeek() {
    if (!isAtMaxWeek) {
      setCurrentWeekStart((d) => addDays(d, 7))
    }
  }

  function handleThisWeek() {
    setCurrentWeekStart(thisMonday)
  }

  const openCreate = () => {
    setDrawerOpen(true)
  }

  const deleteMutation = useApiDelete("jadwal-petugas", "/jadwal-petugas")

  const fetchExportData = useCallback(async () => {
    const weekStartStr = toDateParam(currentWeekStart)
    const weekEndStr = toDateParam(addDays(currentWeekStart, 6))

    const [jadwalRes, shiftsRes, usersRes] = await Promise.all([
      api.get("/jadwal-petugas", { params: { per_page: 9999 } }),
      api.get("/shift", { params: { per_page: 100 } }),
      api.get("/user", { params: { per_page: 9999 } }),
    ])

    const unwrap = <T,>(d: unknown): T[] => {
      const body = d as { data?: unknown } | T[] | null
      if (Array.isArray(body)) return body as T[]
      if (body && typeof body === "object" && Array.isArray(body.data))
        return body.data as T[]
      return []
    }

    const allJadwal = unwrap<JadwalPetugas>(jadwalRes.data)
    const allShifts = unwrap<Shift>(shiftsRes.data)
    const allUsers = unwrap<User>(usersRes.data)

    const shiftMap = new Map<number, Shift>()
    for (const s of allShifts) shiftMap.set(s.id, s)

    const userMap = new Map<number, User>()
    for (const u of allUsers) userMap.set(u.id, u)
    for (const j of allJadwal) {
      if (j.user) userMap.set(j.user.id, j.user)
    }

    const weekJadwal = allJadwal.filter((j) => {
      const t = j.tanggal
      return t && t >= weekStartStr && t <= weekEndStr
    })

    const weekUserIds = [...new Set(weekJadwal.map((j) => j.user_id))]

    return weekUserIds.map((userId) => {
      const user = userMap.get(userId)
      const userName = user?.name ?? `Petugas #${userId}`
      const peran = user?.roles?.map((r) => r.name).join(", ") || "-"
      const row: Record<string, unknown> = {
        nama: userName,
        peran,
      }
      for (let i = 0; i < 7; i++) {
        const dayDate = addDays(currentWeekStart, i)
        const param = toDateParam(dayDate)
        const entry = weekJadwal.find(
          (e) => e.user_id === userId && e.tanggal === param
        )
        const dayLabel = HARI_LABELS[i]
        row[dayLabel] =
          entry?.shift?.nama ??
          (entry?.shift_id != null
            ? shiftMap.get(entry.shift_id)?.nama
            : undefined) ??
          "OFF"
      }
      return row
    })
  }, [currentWeekStart])

  const { confirm, ConfirmDialog } = useConfirmDialog()

  const handleDeleteUserWeek = (userId: number, userName: string) => {
    const entries = weekJadwal.filter((entry) => entry.user_id === userId)
    if (entries.length === 0) return
    confirm({
      title: "Hapus Jadwal Shift",
      itemName: `${userName} (${entries.length} Shift Minggu Ini)`,
      description:
        "Apakah Anda yakin ingin menghapus seluruh jadwal shift petugas ini pada periode minggu terpilih?",
      confirmLabel: "Ya, Hapus Jadwal",
      onConfirm: async () => {
        try {
          for (const entry of entries) {
            await deleteMutation.mutateAsync(entry.id)
          }
          toast.success("Jadwal shift berhasil dihapus")
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
            items={[{ label: "SDM & Kehadiran" }, { label: "Jadwal Shift" }]}
            title="Jadwal Shift"
            icon={BiCalendar}
            description="Atur dan pantau pembagian jam kerja harian petugas operasional gudang."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
            <Button variant="default" onClick={openCreate}>
              <BiCalendar className="mr-2" />
              Atur Shift
            </Button>
          </div>
        </div>
      </div>

      {/* ── Week Navigator ── */}
      <div className="wrapper mt-[35px]">
        <div className="flex items-center gap-2">
          {/* Prev / Label / Next */}
          <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-card text-xs font-semibold text-foreground/80 select-none">
            <button
              onClick={handlePrevWeek}
              title="Minggu sebelumnya"
              className="flex h-9 w-9 cursor-pointer items-center justify-center transition-colors hover:bg-muted hover:text-foreground"
            >
              <BiChevronLeft className="size-4" />
            </button>

            <div className="flex h-9 items-center gap-1.5 border-x border-border/80 px-3">
              <BiCalendar className="size-3.5 text-muted-foreground" />
              <span className="tabular-nums">
                {formatWeekRange(currentWeekStart)}
              </span>
            </div>

            <button
              onClick={handleNextWeek}
              disabled={isAtMaxWeek}
              title={
                isAtMaxWeek
                  ? "Tidak dapat maju lebih jauh"
                  : "Minggu berikutnya"
              }
              className={cn(
                "flex h-9 w-9 cursor-pointer items-center justify-center transition-colors",
                isAtMaxWeek
                  ? "cursor-not-allowed text-foreground/30"
                  : "hover:bg-muted hover:text-foreground"
              )}
            >
              <BiChevronRight className="size-4" />
            </button>
          </div>

          {/* "Minggu Ini" reset button — only shown when not on current week */}
          {!isThisWeek && (
            <button
              onClick={handleThisWeek}
              title="Kembali ke minggu ini"
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 px-3 text-xs font-semibold text-primary transition-colors hover:border-primary/60 hover:bg-primary/10"
            >
              <BiCalendar className="size-3.5" />
              Minggu Ini
            </button>
          )}
        </div>
      </div>

      {/* ── Schedule Table ── */}
      <div className="wrapper mt-[25px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Nama Petugas
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Tanggung Jawab
              </TableHead>

              {weekDays.map((day) => (
                <TableHead
                  key={day.label}
                  className={cn(
                    "text-center text-xs font-semibold tracking-normal normal-case",
                    day.isToday ? "text-primary" : "text-foreground"
                  )}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span>
                      {day.label} ({String(day.dayNum).padStart(2, "0")})
                    </span>
                    {day.isToday && (
                      <span className="h-1 w-1 rounded-full bg-primary" />
                    )}
                  </div>
                </TableHead>
              ))}

              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jadwalQuery.isLoading && (
              <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                <TableCell
                  colSpan={9}
                  className="text-center text-sm text-muted-foreground"
                >
                  Memuat data...
                </TableCell>
              </TableRow>
            )}
            {!jadwalQuery.isLoading && weekUserIds.length === 0 && (
              <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                <TableCell
                  colSpan={9}
                  className="text-center text-sm text-muted-foreground"
                >
                  Tidak ada jadwal shift pada minggu ini.
                </TableCell>
              </TableRow>
            )}
            {weekUserIds.map((userId) => {
              const user = userMap.get(userId)
              const userName = user?.name ?? `Petugas #${userId}`
              const peran =
                user?.roles?.map((role) => role.name).join(", ") || "-"
              const userEntries = weekJadwal.filter(
                (entry) => entry.user_id === userId
              )
              return (
                <TableRow
                  key={userId}
                  className="h-16 border-b border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-sans text-sm text-foreground">
                    {userName}
                  </TableCell>
                  <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                    <ColoredBadge
                      color="gray"
                      className="text-[10px] font-medium"
                    >
                      {peran}
                    </ColoredBadge>
                  </TableCell>

                  {weekDays.map((day) => {
                    const entry = userShiftOn(userId, day)
                    return (
                      <TableCell
                        key={day.label}
                        className={cn(
                          "text-center font-sans text-sm",
                          day.isToday && "bg-primary/[0.03]"
                        )}
                      >
                        {renderShiftBadge(entry?.shift_id, entry?.shift?.nama)}
                      </TableCell>
                    )
                  })}

                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors outline-none hover:bg-muted">
                          <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Aksi Jadwal</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={userEntries.length === 0}
                            onClick={openCreate}
                          >
                            <BiEditAlt />
                            <span>Ubah Jadwal</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={userEntries.length === 0}
                            onClick={() =>
                              handleDeleteUserWeek(userId, userName)
                            }
                          >
                            <BiTrash />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <JadwalShiftForm open={drawerOpen} onOpenChange={setDrawerOpen} />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Jadwal Shift"
        totalItemsCount={weekUserIds.length}
        totalItemsLabel="Total Jadwal"
        filterLabel="Filter Aktif"
        checkboxes={[
          {
            id: "petugas",
            label: "Nama Petugas",
            defaultChecked: true,
          },
          {
            id: "shift",
            label: "Shift & Jam Kerja",
            defaultChecked: true,
          },
          {
            id: "tanggal",
            label: "Tanggal Jadwal",
            defaultChecked: true,
          },
          {
            id: "keterangan",
            label: "Keterangan Tambahan",
            defaultChecked: false,
          },
        ]}
        fetchExportData={fetchExportData}
        exportColumns={[
          { header: "Nama Petugas", accessor: "nama" },
          { header: "Peran", accessor: "peran" },
          ...HARI_LABELS.map((label) => ({ header: label, accessor: label })),
        ]}
      />
    </>
  )
}
