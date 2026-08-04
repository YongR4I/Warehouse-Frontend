"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
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
        <CardHeader className="flex flex-col justify-between gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-xl border border-border/60 bg-secondary p-2 text-foreground">
                <BiBuilding className="size-5" />
              </span>
              <CardTitle className="font-heading text-base font-medium text-foreground md:text-lg">
                Cross-Warehouse Performance Comparison
              </CardTitle>
            </div>
            <CardDescription className="mt-1 text-xs text-muted-foreground">
              Ringkasan performa stok & kapasitas antar lokasi. Klik baris
              gudang untuk drill-down detail.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 self-start font-mono text-xs sm:self-auto"
          >
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
                  className="group cursor-pointer transition-colors hover:bg-muted/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground transition-colors group-hover:text-primary md:text-sm">
                      <span>{wh.nama}</span>
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {wh.alamat}
                    </div>
                  </TableCell>

                  <TableCell className="text-xs font-medium text-muted-foreground">
                    {wh.pic}
                  </TableCell>

                  <TableCell className="text-right font-mono text-xs font-bold text-foreground tabular-nums md:text-sm">
                    {wh.totalItem.toLocaleString("id-ID")}
                  </TableCell>

                  <TableCell className="text-right font-mono text-xs font-bold text-foreground tabular-nums md:text-sm">
                    {formatRp(wh.nilaiStok)}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-mono text-[11px] font-medium text-muted-foreground tabular-nums">
                        <span>{wh.kapasitasPersen}%</span>
                        <span className="text-[10px] text-muted-foreground">
                          {wh.kapasitasPersen > 85 ? "Overload" : "Optimal"}
                        </span>
                      </div>
                      <Progress
                        value={wh.kapasitasPersen}
                        indicatorClassName={
                          wh.kapasitasPersen > 85
                            ? "bg-rose-500"
                            : wh.kapasitasPersen > 70
                              ? "bg-amber-500"
                              : "bg-emerald-500"
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
                    <span className="inline-flex items-center font-mono text-xs font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      Inspect <BiRightArrowAlt className="ml-0.5 size-4" />
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
      <CardHeader className="flex flex-col justify-between gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-border/60 bg-secondary p-2 text-foreground">
              <BiGridAlt className="size-5" />
            </span>
            <CardTitle className="font-heading text-base font-medium text-foreground md:text-lg">
              Storage Allocation & Rack Breakdown —{" "}
              {selectedWh?.nama || "Selected Node"}
            </CardTitle>
          </div>
          <CardDescription className="mt-1 text-xs text-muted-foreground">
            Penataan zona rak penyimpanan, kapasitas terisi, dan hotspot
            bottleneck.
          </CardDescription>
        </div>
        <button
          type="button"
          onClick={() => onSelectWarehouse("all")}
          className="flex shrink-0 items-center gap-1 font-mono text-xs font-medium text-foreground hover:underline active:scale-[0.98]"
        >
          ← Back to All Nodes
        </button>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {storageRacks.map((rack) => (
            <div
              key={rack.kodeRak}
              className={`space-y-3 rounded-2xl border p-4 shadow-xs transition-all ${
                rack.status === "Overcapacity"
                  ? "border-rose-500/30 bg-rose-500/5"
                  : rack.status === "Hampir Penuh"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border/60 bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-heading text-xs font-medium text-foreground md:text-sm">
                    {rack.kodeRak}
                  </h4>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {rack.kategori}
                  </p>
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
                <div className="flex justify-between font-mono text-xs font-medium text-muted-foreground tabular-nums">
                  <span>
                    {rack.terisi} / {rack.kapasitasMax} Items
                  </span>
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
