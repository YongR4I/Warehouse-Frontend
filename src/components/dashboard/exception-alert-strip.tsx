"use client"

import { ColoredBadge } from "@/components/ui/colored-badge"
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
    stokKritisCount +
    approvalPendingCount +
    selisihOpnameCount +
    izinPendingCount

  if (totalExceptions === 0) {
    return (
      <div className="flex animate-in items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 shadow-xs fade-in-50 md:p-5 dark:text-emerald-300">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <BiCheckCircle className="size-6" />
          </span>
          <div>
            <h3 className="font-heading text-sm font-medium text-foreground md:text-base">
              Semua Operasional Gudang Normal Hari Ini
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tidak ada stok di bawah batas minimum, approval tertunda, atau
              selisih opname yang membutuhkan tindakan.
            </p>
          </div>
        </div>
        <ColoredBadge
          color="green"
          className="hidden shrink-0 px-3 py-1 text-xs sm:inline-flex"
        >
          100% Operational OK
        </ColoredBadge>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
          <h2 className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Exception & Action Center
          </h2>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          Klik card untuk tindakan langsung
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Stok Kritis Badge Card */}
        <button
          type="button"
          onClick={() => onOpenDrawer("stok")}
          className={`group flex items-center justify-between rounded-2xl border p-4 text-left shadow-xs transition-all duration-200 active:scale-[0.98] ${
            stokKritisCount > 0
              ? "border-rose-500/30 bg-rose-500/5 text-foreground hover:bg-rose-500/10"
              : "border-border/60 bg-card text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              className={`shrink-0 rounded-xl p-2.5 ${
                stokKritisCount > 0
                  ? "border border-rose-500/20 bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <BiError className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-bold text-foreground tabular-nums">
                  {stokKritisCount}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  SKU
                </span>
              </div>
              <p className="truncate text-xs font-medium text-foreground">
                Stok Kritis / Restok
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-border/40 bg-muted/60 p-1.5 transition-transform group-hover:translate-x-0.5">
            <BiChevronRight className="size-4 text-muted-foreground" />
          </span>
        </button>

        {/* 2. Approval Pending Badge Card */}
        <button
          type="button"
          onClick={() => onOpenDrawer("approval")}
          className={`group flex items-center justify-between rounded-2xl border p-4 text-left shadow-xs transition-all duration-200 active:scale-[0.98] ${
            approvalPendingCount > 0
              ? "border-amber-500/30 bg-amber-500/5 text-foreground hover:bg-amber-500/10"
              : "border-border/60 bg-card text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              className={`shrink-0 rounded-xl p-2.5 ${
                approvalPendingCount > 0
                  ? "border border-amber-500/20 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <BiTimeFive className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-bold text-foreground tabular-nums">
                  {approvalPendingCount}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  TX
                </span>
              </div>
              <p className="truncate text-xs font-medium text-foreground">
                Approval Menunggu
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-border/40 bg-muted/60 p-1.5 transition-transform group-hover:translate-x-0.5">
            <BiChevronRight className="size-4 text-muted-foreground" />
          </span>
        </button>

        {/* 3. Selisih Opname Badge Card */}
        <button
          type="button"
          onClick={() => onOpenDrawer("opname")}
          className={`group flex items-center justify-between rounded-2xl border p-4 text-left shadow-xs transition-all duration-200 active:scale-[0.98] ${
            selisihOpnameCount > 0
              ? "border-amber-500/30 bg-amber-500/5 text-foreground hover:bg-amber-500/10"
              : "border-border/60 bg-card text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              className={`shrink-0 rounded-xl p-2.5 ${
                selisihOpnameCount > 0
                  ? "border border-amber-500/20 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <BiCheckShield className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-bold text-foreground tabular-nums">
                  {selisihOpnameCount}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  Lap
                </span>
              </div>
              <p className="truncate text-xs font-medium text-foreground">
                Selisih Stok Opname
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-border/40 bg-muted/60 p-1.5 transition-transform group-hover:translate-x-0.5">
            <BiChevronRight className="size-4 text-muted-foreground" />
          </span>
        </button>

        {/* 4. Izin / Cuti Menunggu Badge Card */}
        <button
          type="button"
          onClick={() => onOpenDrawer("izin")}
          className={`group flex items-center justify-between rounded-2xl border p-4 text-left shadow-xs transition-all duration-200 active:scale-[0.98] ${
            izinPendingCount > 0
              ? "border-blue-500/30 bg-blue-500/5 text-foreground hover:bg-blue-500/10"
              : "border-border/60 bg-card text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              className={`shrink-0 rounded-xl p-2.5 ${
                izinPendingCount > 0
                  ? "border border-blue-500/20 bg-blue-500/15 text-blue-600 dark:text-blue-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <BiCalendarCheck className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-xl font-bold text-foreground tabular-nums">
                  {izinPendingCount}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  Req
                </span>
              </div>
              <p className="truncate text-xs font-medium text-foreground">
                Izin / Cuti Staff
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-border/40 bg-muted/60 p-1.5 transition-transform group-hover:translate-x-0.5">
            <BiChevronRight className="size-4 text-muted-foreground" />
          </span>
        </button>
      </div>
    </div>
  )
}
