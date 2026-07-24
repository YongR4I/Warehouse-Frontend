"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BiWallet,
  BiDownload,
  BiUpload,
  BiUserCheck,
  BiTrendingUp,
} from "react-icons/bi"

interface KPIData {
  totalNilaiStok: number
  barangMasukUnits: number
  barangMasukRp: number
  barangKeluarUnits: number
  barangKeluarRp: number
  petugasHadir: number
  totalPetugas: number
}

interface KPISummaryCardsProps {
  data: KPIData
}

export function KPISummaryCards({ data }: KPISummaryCardsProps) {
  const formatRp = (val: number) => {
    if (val >= 1000000000) {
      return `Rp ${(val / 1000000000).toFixed(2)} M`
    }
    if (val >= 1000000) {
      return `Rp ${(val / 1000000).toFixed(0)} Jt`
    }
    return `Rp ${val.toLocaleString("id-ID")}`
  }

  const attendancePercent = Math.round((data.petugasHadir / data.totalPetugas) * 100)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* 1. Total Nilai Stok */}
      <Card className="relative overflow-hidden group hover:border-border transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground">
              Total Nilai Stok
            </span>
            <span className="p-2 rounded-xl bg-secondary text-foreground border border-border/60 group-hover:scale-105 transition-transform shrink-0">
              <BiWallet className="size-4" />
            </span>
          </div>

          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-light font-heading tracking-tight text-foreground font-mono tabular-nums">
              {formatRp(data.totalNilaiStok)}
            </div>
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <Badge variant="success" className="text-[10px]">
                <BiTrendingUp className="size-3" /> +4.8% MoM
              </Badge>
              <span className="text-[11px] text-muted-foreground font-mono">Real-time Balance</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Barang Masuk Hari Ini */}
      <Card className="relative overflow-hidden group hover:border-border transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground">
              Barang Masuk Hari Ini
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <BiDownload className="size-4" />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-light font-heading tracking-tight text-foreground font-mono tabular-nums">
                {data.barangMasukUnits}
              </span>
              <span className="text-xs font-medium text-muted-foreground font-mono">Unit</span>
            </div>
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <Badge variant="neutral" className="text-[10px]">
                Nilai: {formatRp(data.barangMasukRp)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Barang Keluar Hari Ini */}
      <Card className="relative overflow-hidden group hover:border-border transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground">
              Barang Keluar Hari Ini
            </span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <BiUpload className="size-4" />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-light font-heading tracking-tight text-foreground font-mono tabular-nums">
                {data.barangKeluarUnits}
              </span>
              <span className="text-xs font-medium text-muted-foreground font-mono">Unit</span>
            </div>
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <Badge variant="neutral" className="text-[10px]">
                Nilai: {formatRp(data.barangKeluarRp)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Kehadiran Petugas Hari Ini */}
      <Card className="relative overflow-hidden group hover:border-border transition-all">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground">
              Kehadiran Shift
            </span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
              <BiUserCheck className="size-4" />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-light font-heading tracking-tight text-foreground font-mono tabular-nums">
                {data.petugasHadir} <span className="text-sm font-medium text-muted-foreground font-mono">/ {data.totalPetugas}</span>
              </span>
              <span className="text-xs font-medium text-muted-foreground font-mono">Staff</span>
            </div>
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <Badge variant={attendancePercent >= 90 ? "success" : "warning"} className="text-[10px]">
                {attendancePercent}% Attendance Rate
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
