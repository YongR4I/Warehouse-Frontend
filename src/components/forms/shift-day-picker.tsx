"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const SHIFT_OPTIONS = [
  { value: "Shift 1", label: "Shift 1" },
  { value: "Shift 2", label: "Shift 2" },
  { value: "Shift 3", label: "Shift 3" },
  { value: "OFF", label: "OFF" },
] as const

type ShiftValue = (typeof SHIFT_OPTIONS)[number]["value"]

interface DayConfig {
  key: string
  label: string
}

const DAYS: DayConfig[] = [
  { key: "sen", label: "SENIN" },
  { key: "sel", label: "SELASA" },
  { key: "rab", label: "RABU" },
  { key: "kam", label: "KAMIS" },
  { key: "jum", label: "JUMAT" },
  { key: "sab", label: "SABTU" },
  { key: "min", label: "MINGGU" },
]

function getShiftColor(value: ShiftValue | undefined) {
  switch (value) {
    case "Shift 1":
      return "bg-sky-50 text-sky-700 border-sky-200"
    case "Shift 2":
      return "bg-yellow-50 text-yellow-700 border-yellow-200"
    case "Shift 3":
      return "bg-purple-50 text-purple-700 border-purple-200"
    case "OFF":
      return "bg-zinc-100 text-zinc-500 border-zinc-200"
    default:
      return "bg-background text-foreground border-border"
  }
}

export interface ShiftDayPickerValue {
  sen: ShiftValue
  sel: ShiftValue
  rab: ShiftValue
  kam: ShiftValue
  jum: ShiftValue
  sab: ShiftValue
  min: ShiftValue
}

interface ShiftDayPickerProps {
  value: ShiftDayPickerValue
  onChange: (value: ShiftDayPickerValue) => void
  error?: string
}

export function ShiftDayPicker({
  value,
  onChange,
  error,
}: ShiftDayPickerProps) {
  const handleDayChange = (dayKey: string, shift: string) => {
    onChange({
      ...value,
      [dayKey]: shift as ShiftValue,
    })
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Grid of 7 days — 5 top row + 2 bottom row */}
      <div className="flex flex-col gap-2">
        {/* Row 1: Mon–Fri */}
        <div className="grid grid-cols-5 gap-2">
          {DAYS.slice(0, 5).map((day) => (
            <DayCell
              key={day.key}
              day={day}
              value={value[day.key as keyof ShiftDayPickerValue]}
              onChange={handleDayChange}
            />
          ))}
        </div>
        {/* Row 2: Sat–Sun */}
        <div className="grid grid-cols-5 gap-2">
          {DAYS.slice(5).map((day) => (
            <DayCell
              key={day.key}
              day={day}
              value={value[day.key as keyof ShiftDayPickerValue]}
              onChange={handleDayChange}
            />
          ))}
        </div>
      </div>
      {/* Legend */}
      <p className="mt-1 text-[11px] text-muted-foreground">
        Shift 1 (07.00–15.00) &bull; Shift 2 (15.00–23.00) &bull; Shift 3
        (23.00–07.00)
      </p>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}

interface DayCellProps {
  day: DayConfig
  value: ShiftValue
  onChange: (dayKey: string, shift: string) => void
}

function DayCell({ day, value, onChange }: DayCellProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card px-2 pt-2.5 pb-3">
      <span className="text-[10px] font-bold tracking-wider text-foreground/60">
        {day.label}
      </span>
      <Select
        value={value}
        onValueChange={(val) => val && onChange(day.key, val)}
      >
        <SelectTrigger
          className={cn(
            "h-8 w-full rounded-lg border px-2 text-[11px] font-semibold transition-colors",
            getShiftColor(value)
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border bg-popover">
          {SHIFT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
