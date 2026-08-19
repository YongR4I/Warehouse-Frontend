"use client"

import * as React from "react"
import { BiCalendar, BiChevronDown, BiCheck } from "react-icons/bi"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface DateRangeFilterProps {
  startDate: string
  endDate: string
  onStartDateChange?: (val: string) => void
  onEndDateChange?: (val: string) => void
  onChange?: (range: { startDate: string; endDate: string }) => void
  className?: string
  size?: "default" | "sm"
  showPresets?: boolean
  disabled?: boolean
}

function formatToYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getPresetList() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const d7 = new Date(today)
  d7.setDate(d7.getDate() - 6)

  const d30 = new Date(today)
  d30.setDate(d30.getDate() - 29)

  const firstThisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const firstLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

  return [
    {
      id: "today",
      label: "Hari Ini",
      start: formatToYMD(today),
      end: formatToYMD(today),
    },
    {
      id: "7days",
      label: "7 Hari Terakhir",
      start: formatToYMD(d7),
      end: formatToYMD(today),
    },
    {
      id: "30days",
      label: "30 Hari Terakhir",
      start: formatToYMD(d30),
      end: formatToYMD(today),
    },
    {
      id: "thisMonth",
      label: "Bulan Ini",
      start: formatToYMD(firstThisMonth),
      end: formatToYMD(lastThisMonth),
    },
    {
      id: "lastMonth",
      label: "Bulan Lalu",
      start: formatToYMD(firstLastMonth),
      end: formatToYMD(lastLastMonth),
    },
  ]
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onChange,
  className,
  size = "default",
  showPresets = true,
  disabled = false,
}: DateRangeFilterProps) {
  const presets = React.useMemo(() => getPresetList(), [])

  const handleStart = (val: string) => {
    if (onStartDateChange) onStartDateChange(val)
    if (onChange) onChange({ startDate: val, endDate })
  }

  const handleEnd = (val: string) => {
    if (onEndDateChange) onEndDateChange(val)
    if (onChange) onChange({ startDate, endDate: val })
  }

  const handleSelectPreset = (presetStart: string, presetEnd: string) => {
    if (onStartDateChange) onStartDateChange(presetStart)
    if (onEndDateChange) onEndDateChange(presetEnd)
    if (onChange) onChange({ startDate: presetStart, endDate: presetEnd })
  }

  const activePreset = presets.find(
    (p) => p.start === startDate && p.end === endDate
  )

  const isSmall = size === "sm"

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card px-3 text-sm text-foreground transition-[color,box-shadow] duration-200",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
        isSmall ? "h-9 text-xs px-2.5 rounded-xl" : "h-[42px]",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <BiCalendar className={cn("shrink-0 text-muted-foreground", isSmall ? "size-3.5" : "size-4")} />
      
      {/* Start Date */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-medium text-muted-foreground select-none hidden sm:inline">
          Dari
        </span>
        <input
          type="date"
          value={startDate}
          max={endDate || undefined}
          disabled={disabled}
          onChange={(e) => handleStart(e.target.value)}
          className={cn(
            "bg-transparent text-foreground outline-none font-medium cursor-pointer",
            "transition-colors hover:text-foreground/80 focus:text-foreground",
            isSmall ? "w-[108px] text-xs" : "w-[124px] text-sm"
          )}
          title="Tanggal Mulai"
        />
      </div>

      <span className="text-xs font-semibold text-muted-foreground/60 select-none px-0.5">
        —
      </span>

      {/* End Date */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-medium text-muted-foreground select-none hidden sm:inline">
          S/d
        </span>
        <input
          type="date"
          value={endDate}
          min={startDate || undefined}
          disabled={disabled}
          onChange={(e) => handleEnd(e.target.value)}
          className={cn(
            "bg-transparent text-foreground outline-none font-medium cursor-pointer",
            "transition-colors hover:text-foreground/80 focus:text-foreground",
            isSmall ? "w-[108px] text-xs" : "w-[124px] text-sm"
          )}
          title="Tanggal Akhir"
        />
      </div>

      {/* Quick Presets Dropdown */}
      {showPresets && (
        <>
          <div className="h-4 w-px bg-border my-auto mx-0.5" />
          <DropdownMenu>
            <DropdownMenuTrigger
              type="button"
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring",
                activePreset && "text-foreground font-semibold"
              )}
              title="Pilih Preset Rentang Waktu"
            >
              <span className="hidden md:inline max-w-[80px] truncate">
                {activePreset ? activePreset.label : "Preset"}
              </span>
              <BiChevronDown className="size-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
                Pilih Periode Cepat
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {presets.map((preset) => {
                const isSelected =
                  startDate === preset.start && endDate === preset.end
                return (
                  <DropdownMenuItem
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.start, preset.end)}
                    className="flex items-center justify-between cursor-pointer py-1.5 text-xs"
                  >
                    <span>{preset.label}</span>
                    {isSelected && (
                      <BiCheck className="size-4 text-primary shrink-0 ml-2" />
                    )}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  )
}
