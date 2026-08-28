"use client"

import { ColoredBadge } from "@/components/ui/colored-badge"
import { Progress } from "@/components/ui/progress"
import {
  BiErrorCircle,
  BiTimeFive,
  BiCheckShield,
  BiUserCheck,
} from "react-icons/bi"
import type {
  DashboardAlerts,
  DashboardWarehouseCapacity,
  DashboardAttendanceShift,
} from "@/types"

interface DashboardInsightsPanelProps {
  alerts?: DashboardAlerts
  warehouseCapacity?: DashboardWarehouseCapacity[]
  attendanceToday?: DashboardAttendanceShift[]
}

function getProgressColor(persen: number): string {
  if (persen >= 90) return "bg-rose-500"
  if (persen >= 70) return "bg-amber-500"
  return "bg-emerald-500"
}

export function DashboardInsightsPanel({
  alerts,
  warehouseCapacity = [],
  attendanceToday = [],
}: DashboardInsightsPanelProps) {
  const stokKritisCount = alerts?.stok_kritis?.length ?? 0
  const pendingMasukCount = alerts?.pending_masuk?.length ?? 0
  const pendingOpnameCount = alerts?.pending_opname?.length ?? 0

  return (
    <div className="space-y-6">
      {/* ── 1. Operational Insights & Action items ── */}
      <div>
        <div className="border-b border-border/60 pb-2">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Insights &amp; Action Required
          </h3>
        </div>

        <div className="mt-3 space-y-3 text-xs">
          {stokKritisCount > 0 && (
            <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2.5">
              <div className="flex items-start gap-2">
                <BiErrorCircle className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <div>
                  <span className="font-semibold text-foreground">
                    {stokKritisCount} SKU Barang
                  </span>{" "}
                  <span className="text-muted-foreground">
                    berada di bawah stok minimum dan perlu restok.
                  </span>
                </div>
              </div>
            </div>
          )}

          {pendingMasukCount > 0 && (
            <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2.5">
              <div className="flex items-start gap-2">
                <BiTimeFive className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <span className="font-semibold text-foreground">
                    {pendingMasukCount} Transaksi Inbound
                  </span>{" "}
                  <span className="text-muted-foreground">
                    membutuhkan konfirmasi approval Supervisor.
                  </span>
                </div>
              </div>
            </div>
          )}

          {pendingOpnameCount > 0 && (
            <div className="flex items-start justify-between gap-2 pb-1">
              <div className="flex items-start gap-2">
                <BiCheckShield className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <span className="font-semibold text-foreground">
                    {pendingOpnameCount} Laporan Opname
                  </span>{" "}
                  <span className="text-muted-foreground">
                    terdeteksi selisih fisik vs sistem.
                  </span>
                </div>
              </div>
            </div>
          )}

          {stokKritisCount === 0 &&
            pendingMasukCount === 0 &&
            pendingOpnameCount === 0 && (
              <div className="py-2 text-center text-muted-foreground">
                Tidak ada action required saat ini
              </div>
            )}
        </div>
      </div>

      {/* ── 2. Capacity Summary ── */}
      <div>
        <div className="border-b border-border/60 pb-2">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Utilisasi Kapasitas Gudang
          </h3>
        </div>

        <div className="mt-3 space-y-3">
          {warehouseCapacity.length === 0 ? (
            <div className="py-2 text-center text-xs text-muted-foreground">
              Belum ada data kapasitas
            </div>
          ) : (
            warehouseCapacity.map((wh) => (
              <div key={wh.id} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{wh.nama}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {wh.persen}% ({wh.terisi.toLocaleString("id-ID")}/
                    {wh.kapasitas.toLocaleString("id-ID")})
                  </span>
                </div>
                <Progress
                  value={wh.persen}
                  className="h-1.5"
                  indicatorClassName={getProgressColor(wh.persen)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── 3. Shift Staffing ── */}
      <div>
        <div className="border-b border-border/60 pb-2">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Presensi Staff Shift Hari Ini
          </h3>
        </div>

        <div className="mt-3 space-y-2.5">
          {attendanceToday.length === 0 ? (
            <div className="py-2 text-center text-xs text-muted-foreground">
              Belum ada data presensi
            </div>
          ) : (
            attendanceToday.map((st) => (
              <div
                key={st.nama}
                className="flex items-center justify-between rounded border border-border/40 bg-muted/20 px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <BiUserCheck className="size-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {st.nama} ({st.jam_masuk}-{st.jam_pulang})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground tabular-nums">
                    {st.hadir}/{st.total}
                  </span>
                  <ColoredBadge
                    color={st.hadir === st.total ? "green" : "yellow"}
                    className="px-1.5 py-0 text-[9px]"
                  >
                    {st.hadir === st.total ? "Lengkap" : `${st.total - st.hadir} Absen`}
                  </ColoredBadge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}