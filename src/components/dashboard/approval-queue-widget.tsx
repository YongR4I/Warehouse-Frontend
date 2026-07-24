"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PendingApprovalItem } from "@/hooks/use-dashboard-data"
import { BiTimeFive, BiCheckCircle, BiRightArrowAlt } from "react-icons/bi"

interface ApprovalQueueWidgetProps {
  approvalsList: PendingApprovalItem[]
  onApprove: (id: string) => void
  onOpenFullDrawer: () => void
}

export function ApprovalQueueWidget({
  approvalsList,
  onApprove,
  onOpenFullDrawer,
}: ApprovalQueueWidgetProps) {
  const topApprovals = approvalsList.slice(0, 3)

  return (
    <Card className="border-border/80 shadow-xs flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-secondary text-foreground border border-border/60">
              <BiTimeFive className="size-5" />
            </span>
            <CardTitle className="text-base md:text-lg font-medium text-foreground font-heading">
              Approval Queue Ringkas
            </CardTitle>
          </div>
          <CardDescription className="mt-0.5 text-muted-foreground text-xs">
            Persetujuan cepat transaksi operasional
          </CardDescription>
        </div>
        <Button
          size="xs"
          variant="ghost"
          onClick={onOpenFullDrawer}
          className="text-xs font-mono font-medium text-foreground hover:bg-accent gap-1 active:scale-[0.98] shrink-0"
        >
          <span>All ({approvalsList.length})</span>
          <BiRightArrowAlt className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pt-4">
        {topApprovals.map((app) => (
          <div
            key={app.id}
            className="p-3.5 rounded-2xl border border-border/60 bg-muted/30 hover:border-border transition-all space-y-2.5 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge
                    variant={
                      app.tipe === "Barang Masuk"
                        ? "success"
                        : app.tipe === "Barang Keluar"
                        ? "warning"
                        : "info"
                    }
                    className="text-[10px]"
                  >
                    {app.tipe}
                  </Badge>
                  <span className="font-mono text-xs font-bold text-foreground truncate">
                    {app.kodeTransaksi}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 font-mono truncate">
                  {app.gudangNama.replace("Gudang ", "")} • {app.requester.split(" ")[0]}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-bold text-xs md:text-sm text-foreground font-mono tabular-nums">
                  Rp {app.nilaiTotal.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">{app.totalItems} items</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <span className="text-[10px] font-mono text-muted-foreground">{app.tanggal}</span>
              <Button
                size="xs"
                variant="default"
                onClick={() => onApprove(app.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1 text-[11px] h-6 px-3 active:scale-[0.98]"
              >
                <BiCheckCircle className="size-3.5" />
                <span>Quick Approve</span>
              </Button>
            </div>
          </div>
        ))}

        {topApprovals.length === 0 && (
          <div className="h-44 flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
            <BiCheckCircle className="size-8 text-emerald-500" />
            <p className="text-xs font-medium text-foreground">Tidak ada approval transaksi yang tertunda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
