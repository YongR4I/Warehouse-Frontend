"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { MasterGudang, RakStorageDetail } from "@/hooks/use-dashboard-data"
import { BiBuilding, BiGridAlt, BiRightArrowAlt } from "react-icons/bi"

interface CrossWarehouseComparisonProps {
  isAllWarehouses: boolean
  warehouses: MasterGudang[]
  selectedWarehouseId: string | null
  storageRacks: RakStorageDetail[]
  onSelectWarehouse: (id: string) => void
}

export function CrossWarehouseComparison({
  isAllWarehouses,
  warehouses,
  selectedWarehouseId,
  storageRacks,
  onSelectWarehouse,
}: CrossWarehouseComparisonProps) {
  const formatRp = (val: number) => `Rp ${val.toLocaleString("id-ID")}`

  if (isAllWarehouses) {
    return (
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-secondary text-foreground border border-border/60">
                <BiBuilding className="size-5" />
              </span>
              <CardTitle className="text-base md:text-lg font-medium text-foreground font-heading">
                Cross-Warehouse Performance Comparison
              </CardTitle>
            </div>
            <CardDescription className="mt-1 text-muted-foreground text-xs">
              Ringkasan performa stok & kapasitas antar lokasi. Klik baris gudang untuk drill-down detail.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto shrink-0">
            {warehouses.length} Active Nodes
          </Badge>
        </CardHeader>

        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gudang & Lokasi</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead className="text-right">SKU</TableHead>
                <TableHead className="text-right">Nilai Stok (Rp)</TableHead>
                <TableHead className="w-44">Kapasitas</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((wh) => (
                <TableRow
                  key={wh.id}
                  onClick={() => onSelectWarehouse(wh.id)}
                  className="cursor-pointer group hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div className="font-semibold text-xs md:text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                      <span>{wh.nama}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{wh.alamat}</div>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground font-medium">
                    {wh.pic}
                  </TableCell>

                  <TableCell className="text-right font-bold text-xs md:text-sm font-mono tabular-nums text-foreground">
                    {wh.totalItem.toLocaleString("id-ID")}
                  </TableCell>

                  <TableCell className="text-right font-bold text-xs md:text-sm font-mono tabular-nums text-foreground">
                    {formatRp(wh.nilaiStok)}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono font-medium tabular-nums text-muted-foreground">
                        <span>{wh.kapasitasPersen}%</span>
                        <span className="text-muted-foreground text-[10px]">
                          {wh.kapasitasPersen > 85 ? "Overload" : "Optimal"}
                        </span>
                      </div>
                      <Progress
                        value={wh.kapasitasPersen}
                        indicatorClassName={
                          wh.kapasitasPersen > 85 ? "bg-rose-500" : wh.kapasitasPersen > 70 ? "bg-amber-500" : "bg-emerald-500"
                        }
                      />
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    {wh.kritisCount > 0 ? (
                      <Badge variant="critical" className="text-[10px]">
                        {wh.kritisCount} Alert
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px]">
                        Normal
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="inline-flex items-center text-xs font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                      Inspect <BiRightArrowAlt className="size-4 ml-0.5" />
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  const selectedWh = warehouses.find((w) => w.id === selectedWarehouseId)

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-secondary text-foreground border border-border/60">
              <BiGridAlt className="size-5" />
            </span>
            <CardTitle className="text-base md:text-lg font-medium text-foreground font-heading">
              Storage Allocation & Rack Breakdown — {selectedWh?.nama || "Selected Node"}
            </CardTitle>
          </div>
          <CardDescription className="mt-1 text-muted-foreground text-xs">
            Penataan zona rak penyimpanan, kapasitas terisi, dan hotspot bottleneck.
          </CardDescription>
        </div>
        <button
          type="button"
          onClick={() => onSelectWarehouse("all")}
          className="text-xs font-mono font-medium text-foreground hover:underline flex items-center gap-1 active:scale-[0.98] shrink-0"
        >
          ← Back to All Nodes
        </button>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {storageRacks.map((rack) => (
            <div
              key={rack.kodeRak}
              className={`p-4 rounded-2xl border transition-all space-y-3 shadow-xs ${
                rack.status === "Overcapacity"
                  ? "border-rose-500/30 bg-rose-500/5"
                  : rack.status === "Hampir Penuh"
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-border/60 bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-xs md:text-sm text-foreground font-heading">
                    {rack.kodeRak}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{rack.kategori}</p>
                </div>
                <Badge
                  variant={
                    rack.status === "Overcapacity"
                      ? "critical"
                      : rack.status === "Hampir Penuh"
                      ? "warning"
                      : "success"
                  }
                  className="text-[10px]"
                >
                  {rack.status}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-medium tabular-nums text-muted-foreground">
                  <span>{rack.terisi} / {rack.kapasitasMax} Items</span>
                  <span>{rack.persen}%</span>
                </div>
                <Progress
                  value={rack.persen}
                  indicatorClassName={
                    rack.persen >= 95
                      ? "bg-rose-500"
                      : rack.persen >= 80
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
