"use client"

import { ExportModal } from "@/components/export-modal"
import { useMemo, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Opsion } from "@/components/opsion"
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics"
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import { DashboardLogTable } from "@/components/dashboard/dashboard-log-table"
import { DashboardInsightsPanel } from "@/components/dashboard/dashboard-insights-panel"
import { useApiList } from "@/hooks/use-api"
import { useOptions, toOptions } from "@/hooks/use-options"
import { useQueryClient } from "@tanstack/react-query"
import type { Gudang, LaporanRow, LaporanStokRow } from "@/types"
import { BiBuilding, BiDownload, BiRefresh } from "react-icons/bi"

function unwrapRows<T>(data: unknown): T[] {
  const body = data as { data?: unknown } | T[] | null | undefined
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === "object" && Array.isArray(body.data)) {
    return body.data as T[]
  }
  return []
}

export default function DashboardPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [selectedGudang, setSelectedGudang] = useState("all")
  const queryClient = useQueryClient()

  const gudangOptions = useOptions<Gudang>("gudang", "/gudang")

  const gudangId = selectedGudang !== "all" ? selectedGudang : undefined

  const params = useMemo(() => ({ gudang_id: gudangId }), [gudangId])

  const stokQuery = useApiList<LaporanStokRow>({
    key: "laporan-stok",
    url: "/laporan/stok",
    params,
  })
  const masukQuery = useApiList<LaporanRow>({
    key: "laporan-masuk",
    url: "/laporan/barang-masuk",
    params,
  })
  const keluarQuery = useApiList<LaporanRow>({
    key: "laporan-keluar",
    url: "/laporan/barang-keluar",
    params,
  })
  const opnamePendingQuery = useApiList<LaporanRow>({
    key: "laporan-opname-pending",
    url: "/laporan/stok-opname",
    params: { ...params, status: "pending" },
  })
  const masukPendingQuery = useApiList<LaporanRow>({
    key: "laporan-masuk-pending",
    url: "/laporan/barang-masuk",
    params: { ...params, status: "pending" },
  })

  const stokRows = unwrapRows<LaporanStokRow>(stokQuery.data)
  const masukRows = unwrapRows<LaporanRow>(masukQuery.data)
  const keluarRows = unwrapRows<LaporanRow>(keluarQuery.data)
  const opnamePendingRows = unwrapRows<LaporanRow>(opnamePendingQuery.data)
  const masukPendingRows = unwrapRows<LaporanRow>(masukPendingQuery.data)

  const hasData =
    stokQuery.isSuccess || masukQuery.isSuccess || keluarQuery.isSuccess

  const metricsData = useMemo(() => {
    if (!hasData) return undefined
    const totalBarang = stokRows.reduce(
      (acc, row) => acc + (row.total_stok ?? 0),
      0
    )
    const nilaiStok = stokRows.reduce(
      (acc, row) => acc + (row.nilai_stok ?? 0),
      0
    )
    const barangMasukQty = masukRows.reduce(
      (acc, row) => acc + (row.total_qty ?? 0),
      0
    )
    const barangMasukCount = masukRows.length
    const barangKeluarQty = keluarRows.reduce(
      (acc, row) => acc + (row.total_qty ?? 0),
      0
    )
    const barangKeluarCount = keluarRows.length
    const opnameQty = opnamePendingRows.reduce(
      (acc, row) => acc + (row.total_qty ?? 0),
      0
    )
    const masukQty = masukPendingRows.reduce(
      (acc, row) => acc + (row.total_qty ?? 0),
      0
    )
    const pendingApprovals =
      opnameQty + masukQty > 0
        ? opnameQty + masukQty
        : opnamePendingRows.length + masukPendingRows.length
    return {
      totalBarang,
      nilaiStok,
      barangMasukQty,
      barangMasukCount,
      barangKeluarQty,
      barangKeluarCount,
      pendingApprovals,
      gudangCount: gudangOptions.items.length,
    }
  }, [
    hasData,
    stokRows,
    masukRows,
    keluarRows,
    opnamePendingRows,
    masukPendingRows,
    gudangOptions.items.length,
  ])

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["laporan-stok"] })
    queryClient.invalidateQueries({ queryKey: ["laporan-masuk"] })
    queryClient.invalidateQueries({ queryKey: ["laporan-keluar"] })
    queryClient.invalidateQueries({ queryKey: ["laporan-opname-pending"] })
    queryClient.invalidateQueries({ queryKey: ["laporan-masuk-pending"] })
    queryClient.invalidateQueries({ queryKey: ["gudang"] })
  }

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
              onClick={handleRefresh}
              className="gap-1 text-xs"
            >
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
        <DashboardMetrics data={metricsData} />
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
          <div className="border-l border-border/40 lg:col-span-1 lg:pl-6">
            <DashboardInsightsPanel />
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
