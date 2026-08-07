"use client"

import { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { ActivityLogItem } from "@/hooks/use-dashboard-data"
import { BiHistory } from "react-icons/bi"

interface ActivityFeedProps {
  activities: ActivityLogItem[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const filteredActivities = activities.filter((act) => {
    if (filterCategory === "all") return true
    return act.kategori === filterCategory
  })

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="flex flex-col justify-between gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-border/60 bg-secondary p-2 text-foreground">
              <BiHistory className="size-5" />
            </span>
            <CardTitle className="font-heading text-base font-medium text-foreground md:text-lg">
              Activity Stream & Audit Log
            </CardTitle>
          </div>
          <CardDescription className="mt-0.5 text-xs text-muted-foreground">
            Jejak aktivitas operasional petugas real-time
          </CardDescription>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterCategory("all")}
            className={`rounded-full px-2.5 py-1 font-mono text-xs font-medium transition-all active:scale-[0.98] ${
              filterCategory === "all"
                ? "border border-border/60 bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("masuk")}
            className={`rounded-full px-2.5 py-1 font-mono text-xs font-medium transition-all active:scale-[0.98] ${
              filterCategory === "masuk"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 shadow-xs dark:text-emerald-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("keluar")}
            className={`rounded-full px-2.5 py-1 font-mono text-xs font-medium transition-all active:scale-[0.98] ${
              filterCategory === "keluar"
                ? "border border-blue-500/30 bg-blue-500/10 text-blue-700 shadow-xs dark:text-blue-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Keluar
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("mutasi")}
            className={`rounded-full px-2.5 py-1 font-mono text-xs font-medium transition-all active:scale-[0.98] ${
              filterCategory === "mutasi"
                ? "border border-amber-500/30 bg-amber-500/10 text-amber-700 shadow-xs dark:text-amber-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mutasi
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="relative space-y-4 pl-4 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-border/60">
          {filteredActivities.map((act) => (
            <div key={act.id} className="group relative flex items-start gap-3">
              <span className="absolute top-1.5 -left-[21px] h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />

              <Avatar className="mt-0.5 h-7 w-7 shrink-0 border border-border/60 bg-muted">
                <AvatarFallback className="bg-muted font-mono text-[10px] font-bold text-foreground">
                  {act.user.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {act.user}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      ({act.role})
                    </span>
                    <ColoredBadge
                      color="gray"
                      className="px-1.5 py-0 font-mono text-[9px]"
                    >
                      {act.gudangNama.replace("Gudang ", "")}
                    </ColoredBadge>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-xs leading-relaxed font-medium text-foreground/90">
                  {act.aksi}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
