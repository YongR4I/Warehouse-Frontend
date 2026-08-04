"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BiBarChartAlt2 } from "react-icons/bi"

export function TrendAnalytics() {
  const topOutboundItems = [
    {
      nama: "Kabel Power Heavy Duty 3 Pin",
      sku: "BRG-ELK-001",
      volume: 1420,
      persen: 92,
      nilai: 63900000,
    },
    {
      nama: "Adaptor Type-C Fast Charge 65W",
      sku: "BRG-ELK-088",
      volume: 980,
      persen: 75,
      nilai: 88200000,
    },
    {
      nama: "Kardus Master Box 40x30x30",
      sku: "BRG-PAK-044",
      volume: 850,
      persen: 65,
      nilai: 7225000,
    },
    {
      nama: "Label Thermal Barcode 100x150",
      sku: "BRG-OFF-019",
      volume: 620,
      persen: 48,
      nilai: 38440000,
    },
    {
      nama: "Sarung Tangan Safety Rubberized",
      sku: "BRG-SAF-008",
      volume: 410,
      persen: 32,
      nilai: 7585000,
    },
  ]

  const topInboundItems = [
    {
      nama: "Bubble Wrap Roll 1.25m x 50m",
      sku: "BRG-PAK-012",
      volume: 1200,
      persen: 88,
      nilai: 102000002,
    },
    {
      nama: "Kabel Power Heavy Duty 3 Pin",
      sku: "BRG-ELK-001",
      volume: 1100,
      persen: 80,
      nilai: 49500000,
    },
    {
      nama: "Pallet Plastik Heavy Duty",
      sku: "BRG-LOG-102",
      volume: 450,
      persen: 55,
      nilai: 171000000,
    },
    {
      nama: "Tape Lakban Bening Heavy Duty",
      sku: "BRG-PAK-009",
      volume: 400,
      persen: 45,
      nilai: 5200000,
    },
    {
      nama: "Strech Film Roll 50cm x 300m",
      sku: "BRG-PAK-031",
      volume: 320,
      persen: 38,
      nilai: 14400000,
    },
  ]

  const dailyTrend = [
    { hari: "Sen", masuk: 120, keluar: 85 },
    { hari: "Sel", masuk: 140, keluar: 95 },
    { hari: "Rab", masuk: 90, keluar: 110 },
    { hari: "Kam", masuk: 180, keluar: 130 },
    { hari: "Jum", masuk: 210, keluar: 160 },
    { hari: "Sab", masuk: 80, keluar: 90 },
    { hari: "Min", masuk: 40, keluar: 30 },
  ]

  const maxVal = 250

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="flex flex-col justify-between gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-border/60 bg-secondary p-2 text-foreground">
              <BiBarChartAlt2 className="size-5" />
            </span>
            <CardTitle className="font-heading text-base font-medium text-foreground md:text-lg">
              Analitik Pergerakan & Top Barang
            </CardTitle>
          </div>
          <CardDescription className="mt-0.5 text-xs text-muted-foreground">
            Grafik tren arus masuk/keluar dan produk paling aktif
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <Tabs defaultValue="movement">
          <TabsList className="mb-4">
            <TabsTrigger value="movement">Movement Trend (7d)</TabsTrigger>
            <TabsTrigger value="top-outbound">Top Outbound Items</TabsTrigger>
            <TabsTrigger value="top-inbound">Top Inbound Items</TabsTrigger>
          </TabsList>

          {/* 1. Movement Chart View */}
          <TabsContent value="movement">
            <div className="space-y-4">
              <div className="flex items-center justify-end gap-4 font-mono text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Inbound (Masuk)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">
                    Outbound (Keluar)
                  </span>
                </div>
              </div>

              {/* Technical Bar Chart */}
              <div className="flex h-56 items-end justify-between gap-2 border-b border-border/60 px-2 pt-6 pb-2">
                {dailyTrend.map((d) => (
                  <div
                    key={d.hari}
                    className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="flex h-full w-full items-end justify-center gap-1.5">
                      {/* Inbound Bar */}
                      <div
                        className="group/bar relative w-3 rounded-t-md bg-emerald-500/80 transition-all duration-300 hover:bg-emerald-600 md:w-5"
                        style={{ height: `${(d.masuk / maxVal) * 100}%` }}
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded border border-border bg-popover px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground tabular-nums opacity-0 shadow-xs transition-opacity group-hover/bar:opacity-100">
                          {d.masuk}
                        </span>
                      </div>
                      {/* Outbound Bar */}
                      <div
                        className="group/bar relative w-3 rounded-t-md bg-blue-500/80 transition-all duration-300 hover:bg-blue-600 md:w-5"
                        style={{ height: `${(d.keluar / maxVal) * 100}%` }}
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded border border-border bg-popover px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground tabular-nums opacity-0 shadow-xs transition-opacity group-hover/bar:opacity-100">
                          {d.keluar}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-medium text-muted-foreground">
                      {d.hari}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 2. Top Outbound Items */}
          <TabsContent value="top-outbound">
            <div className="space-y-3">
              {topOutboundItems.map((item, i) => (
                <div
                  key={item.sku}
                  className="space-y-1.5 rounded-xl border border-border/40 bg-muted/30 p-2.5 transition-colors hover:border-border"
                >
                  <div className="flex items-center justify-between gap-2 text-xs md:text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-4 shrink-0 font-mono font-semibold text-muted-foreground">
                        #{i + 1}
                      </span>
                      <span className="truncate font-medium text-foreground">
                        {item.nama}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                        ({item.sku})
                      </span>
                    </div>
                    <div className="shrink-0 font-mono font-bold text-foreground tabular-nums">
                      {item.volume.toLocaleString("id-ID")} Pcs{" "}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        (Rp {item.nilai.toLocaleString("id-ID")})
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={item.persen}
                    indicatorClassName="bg-blue-500"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 3. Top Inbound Items */}
          <TabsContent value="top-inbound">
            <div className="space-y-3">
              {topInboundItems.map((item, i) => (
                <div
                  key={item.sku}
                  className="space-y-1.5 rounded-xl border border-border/40 bg-muted/30 p-2.5 transition-colors hover:border-border"
                >
                  <div className="flex items-center justify-between gap-2 text-xs md:text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-4 shrink-0 font-mono font-semibold text-muted-foreground">
                        #{i + 1}
                      </span>
                      <span className="truncate font-medium text-foreground">
                        {item.nama}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                        ({item.sku})
                      </span>
                    </div>
                    <div className="shrink-0 font-mono font-bold text-foreground tabular-nums">
                      {item.volume.toLocaleString("id-ID")} Pcs{" "}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        (Rp {item.nilai.toLocaleString("id-ID")})
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={item.persen}
                    indicatorClassName="bg-emerald-500"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
