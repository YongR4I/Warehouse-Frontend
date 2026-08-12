"use client"

import { ColoredBadge } from "@/components/ui/colored-badge"
import { Progress } from "@/components/ui/progress"
import { BiErrorCircle, BiTimeFive, BiCheckShield, BiUserCheck } from "react-icons/bi"

export function DashboardInsightsPanel() {
  const warehouseCapacities = [
    { nama: "Gudang Utama Jakarta", terpakai: 3800, kapasitas: 5000, pct: 76, color: "bg-amber-500" },
    { nama: "Gudang Cabang Bekasi", terpakai: 1200, kapasitas: 3000, pct: 40, color: "bg-emerald-500" },
    { nama: "Gudang Cabang Tangerang", terpakai: 2380, kapasitas: 2500, pct: 95, color: "bg-rose-500" },
    { nama: "Gudang Surabaya Hub", terpakai: 1500, kapasitas: 4000, pct: 37, color: "bg-emerald-500" },
  ]

  const shiftStatus = [
    { nama: "Shift Pagi (07:00-15:00)", hadir: 3, total: 3, status: "Lengkap" },
    { nama: "Shift Siang (15:00-23:00)", hadir: 2, total: 3, status: "1 Absen" },
    { nama: "Shift Malam (23:00-07:00)", hadir: 2, total: 2, status: "Lengkap" },
  ]

  return (
    <div className="space-y-6">
      {/* ── 1. Operational Insights & Action items (Cloudflare Insights style) ── */}
      <div>
        <div className="border-b border-border/60 pb-2">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Insights &amp; Action Required
          </h3>
        </div>

        <div className="mt-3 space-y-3 text-xs">
          {/* Action item 1 */}
          <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2.5">
            <div className="flex items-start gap-2">
              <BiErrorCircle className="mt-0.5 size-4 text-rose-600 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">11 SKU Barang</span>{" "}
                <span className="text-muted-foreground">berada di bawah stok minimum dan perlu restok.</span>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 text-[11px] font-medium text-primary hover:underline"
            >
              Filter
            </button>
          </div>

          {/* Action item 2 */}
          <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-2.5">
            <div className="flex items-start gap-2">
              <BiTimeFive className="mt-0.5 size-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">3 Transaksi Inbound</span>{" "}
                <span className="text-muted-foreground">membutuhkan konfirmasi approval Supervisor.</span>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 text-[11px] font-medium text-primary hover:underline"
            >
              Filter
            </button>
          </div>

          {/* Action item 3 */}
          <div className="flex items-start justify-between gap-2 pb-1">
            <div className="flex items-start gap-2">
              <BiCheckShield className="mt-0.5 size-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">2 Laporan Opname</span>{" "}
                <span className="text-muted-foreground">terdeteksi selisih fisik vs sistem.</span>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 text-[11px] font-medium text-primary hover:underline"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Capacity Summary (Cloudflare Detection Tests style) ── */}
      <div>
        <div className="border-b border-border/60 pb-2">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Utilisasi Kapasitas Gudang
          </h3>
        </div>

        <div className="mt-3 space-y-3">
          {warehouseCapacities.map((wh) => (
            <div key={wh.nama} className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{wh.nama}</span>
                <span className="text-muted-foreground tabular-nums">
                  {wh.pct}% ({wh.terpakai.toLocaleString("id-ID")}/{wh.kapasitas.toLocaleString("id-ID")})
                </span>
              </div>
              <Progress value={wh.pct} className="h-1.5" indicatorClassName={wh.color} />
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Shift Staffing (Cloudflare Bot Analysis summary style) ── */}
      <div>
        <div className="border-b border-border/60 pb-2">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Presensi Staff Shift Hari Ini
          </h3>
        </div>

        <div className="mt-3 space-y-2.5">
          {shiftStatus.map((st) => (
            <div
              key={st.nama}
              className="flex items-center justify-between rounded border border-border/40 bg-muted/20 px-2.5 py-1.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <BiUserCheck className="size-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{st.nama}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground tabular-nums">
                  {st.hadir}/{st.total}
                </span>
                <ColoredBadge
                  color={st.hadir === st.total ? "green" : "yellow"}
                  className="text-[9px] px-1.5 py-0"
                >
                  {st.status}
                </ColoredBadge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
