"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BiBarChartAlt2 } from "react-icons/bi"

export function TrendAnalytics() {
  const topOutboundItems = [
    { nama: "Kabel Power Heavy Duty 3 Pin", sku: "BRG-ELK-001", volume: 1420, persen: 92, nilai: 63900000 },
    { nama: "Adaptor Type-C Fast Charge 65W", sku: "BRG-ELK-088", volume: 980, persen: 75, nilai: 88200000 },
    { nama: "Kardus Master Box 40x30x30", sku: "BRG-PAK-044", volume: 850, persen: 65, nilai: 7225000 },
    { nama: "Label Thermal Barcode 100x150", sku: "BRG-OFF-019", volume: 620, persen: 48, nilai: 38440000 },
    { nama: "Sarung Tangan Safety Rubberized", sku: "BRG-SAF-008", volume: 410, persen: 32, nilai: 7585000 },
  ]

  const topInboundItems = [
    { nama: "Bubble Wrap Roll 1.25m x 50m", sku: "BRG-PAK-012", volume: 1200, persen: 88, nilai: 102000002 },
    { nama: "Kabel Power Heavy Duty 3 Pin", sku: "BRG-ELK-001", volume: 1100, persen: 80, nilai: 49500000 },
    { nama: "Pallet Plastik Heavy Duty", sku: "BRG-LOG-102", volume: 450, persen: 55, nilai: 171000000 },
    { nama: "Tape Lakban Bening Heavy Duty", sku: "BRG-PAK-009", volume: 400, persen: 45, nilai: 5200000 },
    { nama: "Strech Film Roll 50cm x 300m", sku: "BRG-PAK-031", volume: 320, persen: 38, nilai: 14400000 },
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
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-secondary text-foreground border border-border/60">
              <BiBarChartAlt2 className="size-5" />
            </span>
            <CardTitle className="text-base md:text-lg font-medium text-foreground font-heading">
              Analitik Pergerakan & Top Barang
            </CardTitle>
          </div>
          <CardDescription className="mt-0.5 text-muted-foreground text-xs">
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
              <div className="flex items-center justify-end gap-4 text-xs font-mono font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Inbound (Masuk)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">Outbound (Keluar)</span>
                </div>
              </div>

              {/* Technical Bar Chart */}
              <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-border/60">
                {dailyTrend.map((d) => (
                  <div key={d.hari} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Inbound Bar */}
                      <div
                        className="w-3 md:w-5 bg-emerald-500/80 hover:bg-emerald-600 rounded-t-md transition-all duration-300 relative group/bar"
                        style={{ height: `${(d.masuk / maxVal) * 100}%` }}
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold bg-popover border border-border px-1.5 py-0.5 rounded shadow-xs opacity-0 group-hover/bar:opacity-100 transition-opacity tabular-nums text-foreground">
                          {d.masuk}
                        </span>
                      </div>
                      {/* Outbound Bar */}
                      <div
                        className="w-3 md:w-5 bg-blue-500/80 hover:bg-blue-600 rounded-t-md transition-all duration-300 relative group/bar"
                        style={{ height: `${(d.keluar / maxVal) * 100}%` }}
                      >
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold bg-popover border border-border px-1.5 py-0.5 rounded shadow-xs opacity-0 group-hover/bar:opacity-100 transition-opacity tabular-nums text-foreground">
                          {d.keluar}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-medium text-muted-foreground">{d.hari}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 2. Top Outbound Items */}
          <TabsContent value="top-outbound">
            <div className="space-y-3">
              {topOutboundItems.map((item, i) => (
                <div key={item.sku} className="space-y-1.5 p-2.5 rounded-xl bg-muted/30 border border-border/40 hover:border-border transition-colors">
                  <div className="flex items-center justify-between text-xs md:text-sm gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-muted-foreground font-mono w-4 shrink-0">#{i + 1}</span>
                      <span className="font-medium text-foreground truncate">{item.nama}</span>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">({item.sku})</span>
                    </div>
                    <div className="font-mono font-bold text-foreground tabular-nums shrink-0">
                      {item.volume.toLocaleString("id-ID")} Pcs{" "}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        (Rp {item.nilai.toLocaleString("id-ID")})
                      </span>
                    </div>
                  </div>
                  <Progress value={item.persen} indicatorClassName="bg-blue-500" />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 3. Top Inbound Items */}
          <TabsContent value="top-inbound">
            <div className="space-y-3">
              {topInboundItems.map((item, i) => (
                <div key={item.sku} className="space-y-1.5 p-2.5 rounded-xl bg-muted/30 border border-border/40 hover:border-border transition-colors">
                  <div className="flex items-center justify-between text-xs md:text-sm gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-muted-foreground font-mono w-4 shrink-0">#{i + 1}</span>
                      <span className="font-medium text-foreground truncate">{item.nama}</span>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">({item.sku})</span>
                    </div>
                    <div className="font-mono font-bold text-foreground tabular-nums shrink-0">
                      {item.volume.toLocaleString("id-ID")} Pcs{" "}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        (Rp {item.nilai.toLocaleString("id-ID")})
                      </span>
                    </div>
                  </div>
                  <Progress value={item.persen} indicatorClassName="bg-emerald-500" />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
