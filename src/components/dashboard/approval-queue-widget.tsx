"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
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
    <Card className="flex h-full flex-col border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-border/60 bg-secondary p-2 text-foreground">
              <BiTimeFive className="size-5" />
            </span>
            <CardTitle className="font-heading text-base font-medium text-foreground md:text-lg">
              Approval Queue Ringkas
            </CardTitle>
          </div>
          <CardDescription className="mt-0.5 text-xs text-muted-foreground">
            Persetujuan cepat transaksi operasional
          </CardDescription>
        </div>
        <Button
          size="xs"
          variant="ghost"
          onClick={onOpenFullDrawer}
          className="shrink-0 gap-1 font-mono text-xs font-medium text-foreground hover:bg-accent active:scale-[0.98]"
        >
          <span>All ({approvalsList.length})</span>
          <BiRightArrowAlt className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pt-4">
        {topApprovals.map((app) => (
          <div
            key={app.id}
            className="space-y-2.5 rounded-2xl border border-border/60 bg-muted/30 p-3.5 shadow-xs transition-all hover:border-border"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
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
                  <span className="truncate font-mono text-xs font-bold text-foreground">
                    {app.kodeTransaksi}
                  </span>
                </div>
                <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                  {app.gudangNama.replace("Gudang ", "")} •{" "}
                  {app.requester.split(" ")[0]}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="font-mono text-xs font-bold text-foreground tabular-nums md:text-sm">
                  Rp {app.nilaiTotal.toLocaleString("id-ID")}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {app.totalItems} items
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/40 pt-2">
              <span className="font-mono text-[10px] text-muted-foreground">
                {app.tanggal}
              </span>
              <Button
                size="xs"
                variant="default"
                onClick={() => onApprove(app.id)}
                className="h-6 gap-1 bg-emerald-600 px-3 text-[11px] font-medium text-white hover:bg-emerald-700 active:scale-[0.98]"
              >
                <BiCheckCircle className="size-3.5" />
                <span>Quick Approve</span>
              </Button>
            </div>
          </div>
        ))}

        {topApprovals.length === 0 && (
          <div className="flex h-44 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <BiCheckCircle className="size-8 text-emerald-500" />
            <p className="text-xs font-medium text-foreground">
              Tidak ada approval transaksi yang tertunda.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
