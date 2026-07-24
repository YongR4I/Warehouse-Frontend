"use client"

import { Badge } from "@/components/ui/badge"
import {
  BiError,
  BiTimeFive,
  BiCheckShield,
  BiCalendarCheck,
  BiChevronRight,
  BiCheckCircle,
} from "react-icons/bi"

interface ExceptionAlertStripProps {
  stokKritisCount: number
  approvalPendingCount: number
  selisihOpnameCount: number
  izinPendingCount: number
  onOpenDrawer: (type: "stok" | "approval" | "opname" | "izin") => void
}

export function ExceptionAlertStrip({
  stokKritisCount,
  approvalPendingCount,
  selisihOpnameCount,
  izinPendingCount,
  onOpenDrawer,
}: ExceptionAlertStripProps) {
  const totalExceptions =
    stokKritisCount + approvalPendingCount + selisihOpnameCount + izinPendingCount

  if (totalExceptions === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 md:p-5 text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs animate-in fade-in-50">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <BiCheckCircle className="size-6" />
          </span>
          <div>
            <h3 className="font-medium text-sm md:text-base font-heading text-foreground">
              Semua Operasional Gudang Normal Hari Ini
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tidak ada stok di bawah batas minimum, approval tertunda, atau selisih opname yang membutuhkan tindakan.
            </p>
          </div>
        </div>
        <Badge variant="success" className="px-3 py-1 text-xs hidden sm:inline-flex shrink-0">
          100% Operational OK
        </Badge>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
            Exception & Action Center
          </h2>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          Klik card untuk tindakan langsung
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Stok Kritis Badge Card */}
        <button
          type="button"
          onClick={() => onOpenDrawer("stok")}
          className={`group text-left rounded-2xl border p-4 transition-all duration-200 active:scale-[0.98] flex items-center justify-between shadow-xs ${
            stokKritisCount > 0
              ? "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-foreground"
              : "border-border/60 bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span
              className={`p-2.5 rounded-xl shrink-0 ${
                stokKritisCount > 0
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <BiError className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-bold tabular-nums text-foreground">
                  {stokKritisCount}
                </span>
                <span className="text-xs text-muted-foreground font-mono">SKU</span>
              </div>
              <p className="text-xs font-medium truncate text-foreground">Stok Kritis / Restok</p>
            </div>
          </div>
          <span className="p-1.5 rounded-full bg-muted/60 border border-border/40 group-hover:translate-x-0.5 transition-transform shrink-0">
            <BiChevronRight className="size-4 text-muted-foreground" />
          </span>
        </button>

        {/* 2. Approval Pending Badge Card */}
        <button
          type="button"
          onClick={() => onOpenDrawer("approval")}
          className={`group text-left rounded-2xl border p-4 transition-all duration-200 active:scale-[0.98] flex items-center justify-between shadow-xs ${
            approvalPendingCount > 0
              ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-foreground"
              : "border-border/60 bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span
              className={`p-2.5 rounded-xl shrink-0 ${
                approvalPendingCount > 0
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <BiTimeFive className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-bold tabular-nums text-foreground">
                  {approvalPendingCount}
                </span>
                <span className="text-xs text-muted-foreground font-mono">TX</span>
              </div>
              <p className="text-xs font-medium truncate text-foreground">Approval Menunggu</p>
            </div>
          </div>
          <span className="p-1.5 rounded-full bg-muted/60 border border-border/40 group-hover:translate-x-0.5 transition-transform shrink-0">
            <BiChevronRight className="size-4 text-muted-foreground" />
          </span>
        </button>

        {/* 3. Selisih Opname Badge Card */}
        <button
          type="button"
          onClick={() => onOpenDrawer("opname")}
          className={`group text-left rounded-2xl border p-4 transition-all duration-200 active:scale-[0.98] flex items-center justify-between shadow-xs ${
            selisihOpnameCount > 0
              ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-foreground"
              : "border-border/60 bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span
              className={`p-2.5 rounded-xl shrink-0 ${
                selisihOpnameCount > 0
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <BiCheckShield className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-bold tabular-nums text-foreground">
                  {selisihOpnameCount}
                </span>
                <span className="text-xs text-muted-foreground font-mono">Lap</span>
              </div>
              <p className="text-xs font-medium truncate text-foreground">Selisih Stok Opname</p>
            </div>
          </div>
          <span className="p-1.5 rounded-full bg-muted/60 border border-border/40 group-hover:translate-x-0.5 transition-transform shrink-0">
            <BiChevronRight className="size-4 text-muted-foreground" />
          </span>
        </button>

        {/* 4. Izin / Cuti Menunggu Badge Card */}
        <button
          type="button"
          onClick={() => onOpenDrawer("izin")}
          className={`group text-left rounded-2xl border p-4 transition-all duration-200 active:scale-[0.98] flex items-center justify-between shadow-xs ${
            izinPendingCount > 0
              ? "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-foreground"
              : "border-border/60 bg-card hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span
              className={`p-2.5 rounded-xl shrink-0 ${
                izinPendingCount > 0
                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <BiCalendarCheck className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-bold tabular-nums text-foreground">
                  {izinPendingCount}
                </span>
                <span className="text-xs text-muted-foreground font-mono">Req</span>
              </div>
              <p className="text-xs font-medium truncate text-foreground">Izin / Cuti Staff</p>
            </div>
          </div>
          <span className="p-1.5 rounded-full bg-muted/60 border border-border/40 group-hover:translate-x-0.5 transition-transform shrink-0">
            <BiChevronRight className="size-4 text-muted-foreground" />
          </span>
        </button>
      </div>
    </div>
  )
}
