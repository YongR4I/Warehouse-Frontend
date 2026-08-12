"use client"

import { ExportModal } from "@/components/export-modal"
import { useState, useMemo } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  BiCalendar,
  BiChevronLeft,
  BiChevronRight,
  BiDotsVerticalRounded,
  BiSolidReport,
} from "react-icons/bi"
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
import { cn } from "@/lib/utils"

// ─── Date Utilities ──────────────────────────────────────────────────────────

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Sunday = 0, shift so Monday = 0
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

const HARI_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
const HARI_KEYS = ["sen", "sel", "rab", "kam", "jum", "sab", "min"] as const

type HariKey = (typeof HARI_KEYS)[number]

interface WeekDay {
  label: string
  key: HariKey
  date: Date
  dayNum: number
  isToday: boolean
}

function generateWeekDays(weekStart: Date, today: Date): WeekDay[] {
  return HARI_LABELS.map((label, i) => {
    const date = addDays(weekStart, i)
    return {
      label,
      key: HARI_KEYS[i],
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

// ─── Types & Dummy Data ───────────────────────────────────────────────────────

interface ShiftSchedule {
  id: string
  nama: string
  tanggungJawab: string
  jadwal: Record<HariKey, string>
}

const dummyData: ShiftSchedule[] = [
  {
    id: "1",
    nama: "Ahmad Fauzi",
    tanggungJawab: "Operator Forklift",
    jadwal: {
      sen: "Shift 1",
      sel: "Shift 1",
      rab: "Shift 1",
      kam: "Shift 1",
      jum: "Shift 1",
      sab: "OFF",
      min: "OFF",
    },
  },
  {
    id: "2",
    nama: "Budi Santoso",
    tanggungJawab: "Admin Inbound",
    jadwal: {
      sen: "Shift 2",
      sel: "Shift 2",
      rab: "Shift 2",
      kam: "Shift 2",
      jum: "OFF",
      sab: "Shift 2",
      min: "OFF",
    },
  },
  {
    id: "3",
    nama: "Dedi Kurniawan",
    tanggungJawab: "Packer Outbound",
    jadwal: {
      sen: "Shift 3",
      sel: "Shift 3",
      rab: "Shift 3",
      kam: "OFF",
      jum: "Shift 3",
      sab: "Shift 3",
      min: "OFF",
    },
  },
  {
    id: "4",
    nama: "Eko Prasetyo",
    tanggungJawab: "Staff Quality Control",
    jadwal: {
      sen: "Shift 1",
      sel: "Shift 1",
      rab: "OFF",
      kam: "Shift 1",
      jum: "Shift 1",
      sab: "Shift 1",
      min: "OFF",
    },
  },
]

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
    [currentWeekStart, today],
  )

  const isThisWeek = isSameDay(currentWeekStart, thisMonday)

  // Limit forward navigation to 4 weeks ahead
  const maxWeekStart = addDays(thisMonday, 4 * 7)
  const isAtMaxWeek =
    currentWeekStart.getTime() >= maxWeekStart.getTime()

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

  const renderShiftBadge = (shift: string) => {
    if (shift === "Shift 1") {
      return (
        <ColoredBadge color="sky" className="min-w-[55px] justify-center py-1">
          Shift 1
        </ColoredBadge>
      )
    }
    if (shift === "Shift 2") {
      return (
        <ColoredBadge
          color="yellow"
          className="min-w-[55px] justify-center py-1"
        >
          Shift 2
        </ColoredBadge>
      )
    }
    if (shift === "Shift 3") {
      return (
        <ColoredBadge
          color="purple"
          className="min-w-[55px] justify-center py-1"
        >
          Shift 3
        </ColoredBadge>
      )
    }
    return (
      <ColoredBadge
        color="gray"
        className="min-w-[55px] justify-center py-1 font-medium"
      >
        OFF
      </ColoredBadge>
    )
  }

  return (
    <>
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
            <Button variant="default" onClick={() => setDrawerOpen(true)}>
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
          <div className="flex items-center rounded-lg border border-border/80 bg-card text-xs font-semibold text-foreground/80 select-none overflow-hidden">
            <button
              onClick={handlePrevWeek}
              title="Minggu sebelumnya"
              className="flex h-9 w-9 cursor-pointer items-center justify-center transition-colors hover:bg-muted hover:text-foreground"
            >
              <BiChevronLeft className="size-4" />
            </button>

            <div className="flex items-center gap-1.5 border-x border-border/80 px-3 h-9">
              <BiCalendar className="size-3.5 text-muted-foreground" />
              <span className="tabular-nums">{formatWeekRange(currentWeekStart)}</span>
            </div>

            <button
              onClick={handleNextWeek}
              disabled={isAtMaxWeek}
              title={isAtMaxWeek ? "Tidak dapat maju lebih jauh" : "Minggu berikutnya"}
              className={cn(
                "flex h-9 w-9 cursor-pointer items-center justify-center transition-colors",
                isAtMaxWeek
                  ? "cursor-not-allowed text-foreground/30"
                  : "hover:bg-muted hover:text-foreground",
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
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 hover:border-primary/60"
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
                  key={day.key}
                  className={cn(
                    "text-center text-xs font-semibold tracking-normal normal-case",
                    day.isToday ? "text-primary" : "text-foreground",
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
            {dummyData.map((row) => (
              <TableRow
                key={row.id}
                className="h-16 border-b border-border/40 hover:bg-muted/30"
              >
                <TableCell className="pl-6 font-sans text-sm text-foreground">
                  {row.nama}
                </TableCell>
                <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                  <ColoredBadge
                    color="gray"
                    className="text-[10px] font-medium"
                  >
                    {row.tanggungJawab}
                  </ColoredBadge>
                </TableCell>

                {weekDays.map((day) => (
                  <TableCell
                    key={day.key}
                    className={cn(
                      "text-center font-sans text-sm",
                      day.isToday && "bg-primary/[0.03]",
                    )}
                  >
                    {renderShiftBadge(row.jadwal[day.key])}
                  </TableCell>
                ))}

                <TableCell className="pr-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1 text-muted-foreground">
                    <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                      <BiChevronRight className="size-4 text-foreground/75" />
                    </button>
                    <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                      <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <JadwalShiftForm open={drawerOpen} onOpenChange={setDrawerOpen} />
    
      
    
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Jadwal Shift"
        totalItemsCount={dummyData.length}
        totalItemsLabel="Total Jadwal"
        filterLabel="Filter Aktif"
        checkboxes={[
        {
          "id": "petugas",
          "label": "Nama Petugas",
          "defaultChecked": true
        },
        {
          "id": "shift",
          "label": "Shift & Jam Kerja",
          "defaultChecked": true
        },
        {
          "id": "tanggal",
          "label": "Tanggal Jadwal",
          "defaultChecked": true
        },
        {
          "id": "keterangan",
          "label": "Keterangan Tambahan",
          "defaultChecked": false
        }
      ]}
      />
    </>
  )
}
