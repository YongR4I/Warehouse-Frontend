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

  const attendancePercent = Math.round(
    (data.petugasHadir / data.totalPetugas) * 100
  )

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
      {/* 1. Total Nilai Stok */}
      <Card className="group relative overflow-hidden transition-all hover:border-border">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Total Nilai Stok
            </span>
            <span className="shrink-0 rounded-xl border border-border/60 bg-secondary p-2 text-foreground transition-transform group-hover:scale-105">
              <BiWallet className="size-4" />
            </span>
          </div>

          <div className="mt-4">
            <div className="font-heading font-mono text-2xl font-light tracking-tight text-foreground tabular-nums md:text-3xl">
              {formatRp(data.totalNilaiStok)}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Badge variant="success" className="text-[10px]">
                <BiTrendingUp className="size-3" /> +4.8% MoM
              </Badge>
              <span className="font-mono text-[11px] text-muted-foreground">
                Real-time Balance
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Barang Masuk Hari Ini */}
      <Card className="group relative overflow-hidden transition-all hover:border-border">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Barang Masuk Hari Ini
            </span>
            <span className="shrink-0 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-600 transition-transform group-hover:scale-105 dark:text-emerald-400">
              <BiDownload className="size-4" />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-mono text-2xl font-light tracking-tight text-foreground tabular-nums md:text-3xl">
                {data.barangMasukUnits}
              </span>
              <span className="font-mono text-xs font-medium text-muted-foreground">
                Unit
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Badge variant="neutral" className="text-[10px]">
                Nilai: {formatRp(data.barangMasukRp)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Barang Keluar Hari Ini */}
      <Card className="group relative overflow-hidden transition-all hover:border-border">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Barang Keluar Hari Ini
            </span>
            <span className="shrink-0 rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-600 transition-transform group-hover:scale-105 dark:text-blue-400">
              <BiUpload className="size-4" />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-mono text-2xl font-light tracking-tight text-foreground tabular-nums md:text-3xl">
                {data.barangKeluarUnits}
              </span>
              <span className="font-mono text-xs font-medium text-muted-foreground">
                Unit
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Badge variant="neutral" className="text-[10px]">
                Nilai: {formatRp(data.barangKeluarRp)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Kehadiran Petugas Hari Ini */}
      <Card className="group relative overflow-hidden transition-all hover:border-border">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Kehadiran Shift
            </span>
            <span className="shrink-0 rounded-xl border border-purple-500/20 bg-purple-500/10 p-2 text-purple-600 transition-transform group-hover:scale-105 dark:text-purple-400">
              <BiUserCheck className="size-4" />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-mono text-2xl font-light tracking-tight text-foreground tabular-nums md:text-3xl">
                {data.petugasHadir}{" "}
                <span className="font-mono text-sm font-medium text-muted-foreground">
                  / {data.totalPetugas}
                </span>
              </span>
              <span className="font-mono text-xs font-medium text-muted-foreground">
                Staff
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Badge
                variant={attendancePercent >= 90 ? "success" : "warning"}
                className="text-[10px]"
              >
                {attendancePercent}% Attendance Rate
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
