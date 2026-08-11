"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Opsion } from "@/components/opsion"
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics"
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import { DashboardLogTable } from "@/components/dashboard/dashboard-log-table"
import { DashboardInsightsPanel } from "@/components/dashboard/dashboard-insights-panel"
import { BiBuilding, BiDownload, BiRefresh } from "react-icons/bi"

export default function DashboardPage() {
  const [selectedGudang, setSelectedGudang] = useState("all")

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
                { value: "1", label: "Gudang Utama Jakarta" },
                { value: "2", label: "Gudang Cabang Bekasi" },
                { value: "3", label: "Gudang Cabang Tangerang" },
                { value: "4", label: "Gudang Surabaya Hub" },
              ]}
              value={selectedGudang}
              onValueChange={(val) => setSelectedGudang(val || "all")}
            />

            <Button variant="outline-black" className="gap-1 text-xs">
              <BiRefresh className="size-4" /> Refresh
            </Button>

            <Button variant="default" className="gap-1 text-xs">
              <BiDownload className="size-4" /> Export Laporan
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Cloudflare-Style Top Metrics Summary Strip ── */}
      <div className="wrapper mt-6">
        <DashboardMetrics />
      </div>

      {/* ── 3. Main Body: Chart + Sampled Logs + Right Insights Panel ── */}
      <div className="wrapper mt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column (Chart + Sampled Logs) — takes 2 cols on lg */}
          <div className="space-y-8 lg:col-span-2">
            <DashboardChart />
            <DashboardLogTable />
          </div>

          {/* Right Column (Cloudflare Insights & Detection Tests style) */}
          <div className="lg:col-span-1 border-l border-border/40 lg:pl-6">
            <DashboardInsightsPanel />
          </div>
        </div>
      </div>
    </>
  )
}
