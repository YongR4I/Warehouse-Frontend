"use client"

import type { DashboardChartData } from "@/types"

interface DashboardChartProps {
  data?: DashboardChartData
  range?: "24h" | "7d" | "30d"
  onRangeChange?: (range: "24h" | "7d" | "30d") => void
}

export function DashboardChart({
  data,
  range = "24h",
  onRangeChange,
}: DashboardChartProps) {
  const labels = data?.labels ?? []
  const masukValues = data?.masuk ?? []
  const keluarValues = data?.keluar ?? []

  const totalMasuk = masukValues.reduce((acc, v) => acc + v, 0)
  const totalKeluar = keluarValues.reduce((acc, v) => acc + v, 0)
  const totalMovement = totalMasuk + totalKeluar

  const width = 800
  const height = 200
  const paddingX = 40
  const paddingY = 20
  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingY * 2

  const allValues = [...masukValues, ...keluarValues]
  const maxVal = Math.max(1, ...allValues)
  const gridMax = Math.ceil(maxVal / 70) * 70 || 280

  const getX = (index: number) =>
    labels.length > 1
      ? paddingX + (index / (labels.length - 1)) * chartWidth
      : paddingX + chartWidth / 2

  const getY = (value: number) =>
    height - paddingY - (value / gridMax) * chartHeight

  const gridLines = Array.from(
    { length: Math.floor(gridMax / 70) + 1 },
    (_, i) => i * 70
  ).filter((v) => v <= gridMax)

  const masukPoints = masukValues
    .map((v, i) => `${getX(i)},${getY(v)}`)
    .join(" L ")
  const keluarPoints = keluarValues
    .map((v, i) => `${getX(i)},${getY(v)}`)
    .join(" L ")

  const masukAreaPath =
    masukValues.length > 0
      ? `M ${getX(0)},${height - paddingY} L ${masukPoints} L ${getX(
          masukValues.length - 1
        )},${height - paddingY} Z`
      : ""

  return (
    <div className="border-b border-border/60 pb-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col justify-between gap-3 border-b border-border/40 pb-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-6 text-sm font-medium">
          <span className="pb-3 font-semibold border-b-2 border-primary text-foreground">
            Pergerakan Stok (In / Out)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Rentang:
          </span>
          <div className="inline-flex rounded-md border border-border/60 bg-muted/40 p-0.5 text-xs">
            {(["24h", "7d", "30d"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRangeChange?.(r)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  range === r
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "24h" ? "24 Jam" : r === "7d" ? "7 Hari" : "30 Hari"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Metric Totals */}
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
            <span className="text-xs text-muted-foreground">
              Barang Masuk:
            </span>
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

      {/* SVG Chart */}
      <div className="relative mt-4 w-full overflow-hidden">
        {labels.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Belum ada data pergerakan
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-48 w-full overflow-visible"
            preserveAspectRatio="none"
          >
            {gridLines.map((val) => {
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

            {masukAreaPath && (
              <path d={masukAreaPath} className="fill-blue-500/10" />
            )}

            {masukPoints && (
              <path
                d={`M ${masukPoints}`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {keluarPoints && (
              <path
                d={`M ${keluarPoints}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {labels.map((label, i) => (
              <g key={`${label}-${i}`}>
                <circle
                  cx={getX(i)}
                  cy={getY(masukValues[i] ?? 0)}
                  r="3"
                  className="fill-background stroke-blue-500"
                  strokeWidth="2"
                />
                <circle
                  cx={getX(i)}
                  cy={getY(keluarValues[i] ?? 0)}
                  r="3"
                  className="fill-background stroke-amber-500"
                  strokeWidth="2"
                />
                <text
                  x={getX(i)}
                  y={height - 2}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px] font-medium"
                >
                  {labels.length <= 12
                    ? label
                    : i % Math.ceil(labels.length / 12) === 0
                      ? label
                      : ""}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  )
}
