"use client"

import { ExportModal } from "@/components/export-modal"
import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Opsion } from "@/components/opsion"
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics"
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import { DashboardLogTable } from "@/components/dashboard/dashboard-log-table"
import { DashboardInsightsPanel } from "@/components/dashboard/dashboard-insights-panel"
import {
  DashboardMetricsSkeleton,
  DashboardChartSkeleton,
  DashboardLogTableSkeleton,
  DashboardInsightsSkeleton,
} from "@/components/skeletons"
import { useOptions, toOptions } from "@/hooks/use-options"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import type { Gudang } from "@/types"
import { BiBuilding, BiDownload, BiRefresh } from "react-icons/bi"

export default function DashboardPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [selectedGudang, setSelectedGudang] = useState("all")
  const [chartRange, setChartRange] = useState<"24h" | "7d" | "30d">("24h")

  const gudangOptions = useOptions<Gudang>("gudang", "/gudang")

  const gudangId = selectedGudang !== "all" ? selectedGudang : undefined

  const { data, isLoading, refetch } = useDashboardData({
    gudangId,
    chartRange,
  })

  const metricsData = data
    ? {
        totalBarang: data.metrics.total_barang,
        nilaiStok: data.metrics.total_nilai_stok,
        barangMasukQty: data.metrics.barang_masuk_bulan_ini.qty,
        barangMasukCount: data.metrics.barang_masuk_bulan_ini.count,
        barangKeluarQty: data.metrics.barang_keluar_bulan_ini.qty,
        barangKeluarCount: data.metrics.barang_keluar_bulan_ini.count,
        pendingApprovals: data.metrics.pending_approvals,
        gudangCount: data.metrics.total_gudang,
      }
    : undefined

  return (
    <>
      {/* ── 1. Page Header (Standard Across All Pages) ── */}
      <div className="wrapper">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <PageHeader
            items={[{ label: "Dashboard" }, { label: "Overview" }]}
            title="Operational Overview"
            icon={BiBuilding}
            description="Ringkasan eksekutif & kontrol operasional real-time seluruh lokasi gudang."
          />

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scope Gudang Switcher */}
            <Opsion
              placeholder="Semua Gudang"
              options={[
                { value: "all", label: "Semua Gudang (Agregat)" },
                ...toOptions(gudangOptions.items),
              ]}
              value={selectedGudang}
              onValueChange={(val) => setSelectedGudang(val || "all")}
            />

            <Button
              variant="outline-black"
              onClick={() => refetch()}
              className="gap-1 text-xs"
              disabled={isLoading}
            >
              <BiRefresh
                className={`size-4 ${isLoading ? "animate-spin" : ""}`}
              />{" "}
              Refresh
            </Button>

            <Button variant="default" className="gap-1 text-xs">
              <BiDownload className="size-4" /> Export Laporan
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Cloudflare-Style Top Metrics Summary Strip ── */}
      <div className="wrapper mt-6">
        {isLoading ? (
          <DashboardMetricsSkeleton />
        ) : (
          <DashboardMetrics data={metricsData} />
        )}
      </div>

      {/* ── 3. Main Body: Chart + Sampled Logs + Right Insights Panel ── */}
      <div className="wrapper mt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column (Chart + Sampled Logs) — takes 2 cols on lg */}
          <div className="space-y-8 lg:col-span-2">
            {isLoading ? (
              <>
                <DashboardChartSkeleton />
                <DashboardLogTableSkeleton />
              </>
            ) : (
              <>
                <DashboardChart
                  data={data?.chart}
                  range={chartRange}
                  onRangeChange={setChartRange}
                />
                <DashboardLogTable logs={data?.recent_activity} />
              </>
            )}
          </div>

          {/* Right Column (Cloudflare Insights & Detection Tests style) */}
          <div className="border-l border-border/40 lg:col-span-1 lg:pl-6">
            {isLoading ? (
              <DashboardInsightsSkeleton />
            ) : (
              <DashboardInsightsPanel
                alerts={data?.alerts}
                warehouseCapacity={data?.warehouse_capacity}
                attendanceToday={data?.attendance_today}
              />
            )}
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Ringkasan Dashboard"
        totalItemsCount={"Semua"}
        totalItemsLabel="Total Gudang"
        filterLabel="Semua Gudang"
        checkboxes={[
          {
            id: "kpi",
            label: "Angka Indikator Utama (KPI)",
            defaultChecked: true,
          },
          {
            id: "charts",
            label: "Data Grafik & Tren",
            defaultChecked: true,
          },
          {
            id: "log",
            label: "Log Aktivitas Terbaru",
            defaultChecked: true,
          },
        ]}
      />
    </>
  )
}