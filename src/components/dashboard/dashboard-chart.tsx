"use client"

import { useState } from "react"

interface DataPoint {
  time: string
  masuk: number
  keluar: number
}

const timeSeriesData: DataPoint[] = [
  { time: "00:00", masuk: 12, keluar: 5 },
  { time: "03:00", masuk: 5, keluar: 0 },
  { time: "06:00", masuk: 45, keluar: 15 },
  { time: "09:00", masuk: 180, keluar: 120 },
  { time: "12:00", masuk: 240, keluar: 190 },
  { time: "15:00", masuk: 210, keluar: 160 },
  { time: "18:00", masuk: 110, keluar: 70 },
  { time: "21:00", masuk: 48, keluar: 10 },
]

export function DashboardChart() {
  const [activeTab, setActiveTab] = useState<
    "movement" | "opname" | "capacity"
  >("movement")
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h")

  const totalMasuk = timeSeriesData.reduce((acc, d) => acc + d.masuk, 0)
  const totalKeluar = timeSeriesData.reduce((acc, d) => acc + d.keluar, 0)
  const totalMovement = totalMasuk + totalKeluar

  // SVG Chart Dimensions & Scaling
  const width = 800
  const height = 200
  const paddingX = 40
  const paddingY = 20
  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingY * 2

  const maxVal = 280

  const getX = (index: number) =>
    paddingX + (index / (timeSeriesData.length - 1)) * chartWidth

  const getY = (value: number) =>
    height - paddingY - (value / maxVal) * chartHeight

  // Generate SVG path string
  const masukPoints = timeSeriesData
    .map((d, i) => `${getX(i)},${getY(d.masuk)}`)
    .join(" L ")
  const keluarPoints = timeSeriesData
    .map((d, i) => `${getX(i)},${getY(d.keluar)}`)
    .join(" L ")

  const masukAreaPath = `M ${getX(0)},${height - paddingY} L ${masukPoints} L ${getX(
    timeSeriesData.length - 1
  )},${height - paddingY} Z`

  return (
    <div className="border-b border-border/60 pb-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col justify-between gap-3 border-b border-border/40 pb-3 sm:flex-row sm:items-center">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("movement")}
            className={`pb-3 font-semibold transition-colors ${
              activeTab === "movement"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pergerakan Stok (In / Out)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("opname")}
            className={`pb-3 transition-colors ${
              activeTab === "opname"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Aktivitas Stok Opname
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("capacity")}
            className={`pb-3 transition-colors ${
              activeTab === "capacity"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Utilisasi Kapasitas Gudang
          </button>
        </div>

        {/* Time Selector Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Rentang:
          </span>
          <div className="inline-flex rounded-md border border-border/60 bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setTimeRange("24h")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                timeRange === "24h"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              24 Jam
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("7d")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                timeRange === "7d"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("30d")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                timeRange === "30d"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              30 Hari
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Totals (Cloudflare style) */}
      <div className="mt-4 flex flex-wrap items-baseline gap-8">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Total Pergerakan
          </span>
          <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums md:text-3xl">
            {totalMovement.toLocaleString("id-ID")}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              unit
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <div>
            <span className="text-xs text-muted-foreground">Barang Masuk:</span>
            <span className="ml-1.5 text-base font-semibold text-foreground tabular-nums">
              {totalMasuk.toLocaleString("id-ID")} unit
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <div>
            <span className="text-xs text-muted-foreground">
              Barang Keluar:
            </span>
            <span className="ml-1.5 text-base font-semibold text-foreground tabular-nums">
              {totalKeluar.toLocaleString("id-ID")} unit
            </span>
          </div>
        </div>
      </div>

      {/* Cloudflare Precision SVG Chart */}
      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-48 w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Horizontal Gridlines */}
          {[0, 70, 140, 210, 280].map((val) => {
            const y = getY(val)
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-border/40"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-muted-foreground text-[9px] font-medium"
                >
                  {val}
                </text>
              </g>
            )
          })}

          {/* Area Fill for Masuk */}
          <path d={masukAreaPath} className="fill-blue-500/10" />

          {/* Masuk Line */}
          <path
            d={`M ${masukPoints}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Keluar Line */}
          <path
            d={`M ${keluarPoints}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {timeSeriesData.map((d, i) => (
            <g key={d.time}>
              <circle
                cx={getX(i)}
                cy={getY(d.masuk)}
                r="3"
                className="fill-background stroke-blue-500"
                strokeWidth="2"
              />
              <circle
                cx={getX(i)}
                cy={getY(d.keluar)}
                r="3"
                className="fill-background stroke-amber-500"
                strokeWidth="2"
              />
              {/* X Axis Labels */}
              <text
                x={getX(i)}
                y={height - 2}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] font-medium"
              >
                {d.time}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
