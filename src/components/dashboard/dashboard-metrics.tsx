"use client"

import { ColoredBadge } from "@/components/ui/colored-badge"
import { formatCurrency, formatNumber } from "@/lib/status"

interface MetricItem {
  label: string
  mainValue: string
  subText: string
  badgeText?: string
  badgeColor?: "green" | "red" | "yellow" | "gray" | "blue"
  progressPercent?: number
  barColor?: string
}

export interface DashboardMetricsData {
  totalBarang: number
  nilaiStok: number | null
  barangMasukQty: number
  barangMasukCount: number
  barangKeluarQty: number
  barangKeluarCount: number
  pendingApprovals: number | null
  gudangCount: number
}

interface DashboardMetricsProps {
  data?: DashboardMetricsData
}

const DEFAULT_METRICS: MetricItem[] = [
  {
    label: "TOTAL NILAI STOK",
    mainValue: "Rp 4.82 M",
    subText: "Real-time Valuation",
    badgeText: "+4.8% MoM",
    badgeColor: "green",
    progressPercent: 78,
    barColor: "bg-emerald-600",
  },
  {
    label: "BARANG MASUK (INBOUND)",
    mainValue: "850 unit",
    subText: "12 PO Selesai • Rp 128.4 M",
    badgeText: "Hari Ini",
    badgeColor: "gray",
    progressPercent: 65,
    barColor: "bg-foreground/70",
  },
  {
    label: "BARANG KELUAR (OUTBOUND)",
    mainValue: "570 unit",
    subText: "18 SO Selesai • Rp 96.2 M",
    badgeText: "Hari Ini",
    badgeColor: "gray",
    progressPercent: 45,
    barColor: "bg-foreground/70",
  },
  {
    label: "STATUS OPERASIONAL",
    mainValue: "4 Gudang Active",
    subText: "8/10 Staff Shift • 11 Kritis",
    badgeText: "80% Attendance",
    badgeColor: "blue",
    progressPercent: 80,
    barColor: "bg-blue-600",
  },
]

function compactCurrency(value: number): string {
  if (value >= 1_000_000_000)
    return `Rp ${(value / 1_000_000_000).toFixed(2)} M`
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} Jt`
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} Rb`
  return formatCurrency(value)
}

export function DashboardMetrics({ data }: DashboardMetricsProps) {
  // Tiering: kartu yang datanya di-strip BE (null = tak berhak) tidak dirender.
  const metrics: MetricItem[] = data
    ? [
        ...(data.nilaiStok === null || data.nilaiStok === undefined
          ? []
          : [
              {
                label: "TOTAL NILAI STOK",
                mainValue: compactCurrency(data.nilaiStok),
                subText: `${formatNumber(data.totalBarang)} SKU • Real-time Valuation`,
                badgeText: "Live",
                badgeColor: "green",
                progressPercent: 78,
                barColor: "bg-emerald-600",
              } as MetricItem,
            ]),
        {
          label: "BARANG MASUK (INBOUND)",
          mainValue: `${formatNumber(data.barangMasukQty)} unit`,
          subText: `${formatNumber(data.barangMasukCount)} Transaksi Selesai`,
          badgeText: "Periode Ini",
          badgeColor: "gray",
          progressPercent: 65,
          barColor: "bg-foreground/70",
        },
        {
          label: "BARANG KELUAR (OUTBOUND)",
          mainValue: `${formatNumber(data.barangKeluarQty)} unit`,
          subText: `${formatNumber(data.barangKeluarCount)} Transaksi Selesai`,
          badgeText: "Periode Ini",
          badgeColor: "gray",
          progressPercent: 45,
          barColor: "bg-foreground/70",
        },
        ...(data.pendingApprovals === null ||
        data.pendingApprovals === undefined
          ? []
          : [
              {
                label: "STATUS OPERASIONAL",
                mainValue: `${formatNumber(data.pendingApprovals)} Menunggu`,
                subText: `${formatNumber(data.gudangCount)} Gudang Aktif`,
                badgeText: "Pending Approval",
                badgeColor: "yellow",
                progressPercent: 80,
                barColor: "bg-blue-600",
              } as MetricItem,
            ]),
      ]
    : DEFAULT_METRICS

  return (
    <div className="grid grid-cols-1 divide-y divide-border/60 border-b border-border/60 pb-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
      {metrics.map((m, idx) => (
        <div
          key={m.label}
          className={`flex flex-col justify-between py-2.5 ${
            idx === 0
              ? "sm:pr-6"
              : idx === metrics.length - 1
                ? "sm:pl-6"
                : "sm:px-6"
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-sans text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {m.label}
            </span>
            {m.badgeText && (
              <ColoredBadge
                color={m.badgeColor || "gray"}
                className="px-1.5 py-0 text-[10px]"
              >
                {m.badgeText}
              </ColoredBadge>
            )}
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              {m.mainValue}
            </span>
          </div>

          <div className="mt-1.5 text-xs text-muted-foreground">
            {m.subText}
          </div>

          {m.progressPercent !== undefined && (
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full ${m.barColor || "bg-primary"}`}
                style={{ width: `${m.progressPercent}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}