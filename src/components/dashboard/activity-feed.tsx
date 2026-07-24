"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-secondary text-foreground border border-border/60">
              <BiHistory className="size-5" />
            </span>
            <CardTitle className="text-base md:text-lg font-medium text-foreground font-heading">
              Activity Stream & Audit Log
            </CardTitle>
          </div>
          <CardDescription className="mt-0.5 text-muted-foreground text-xs">
            Jejak aktivitas operasional petugas real-time
          </CardDescription>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterCategory("all")}
            className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all active:scale-[0.98] ${
              filterCategory === "all"
                ? "bg-secondary text-secondary-foreground border border-border/60 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("masuk")}
            className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all active:scale-[0.98] ${
              filterCategory === "masuk"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("keluar")}
            className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all active:scale-[0.98] ${
              filterCategory === "keluar"
                ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Keluar
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("mutasi")}
            className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all active:scale-[0.98] ${
              filterCategory === "mutasi"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mutasi
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
          {filteredActivities.map((act) => (
            <div key={act.id} className="relative flex items-start gap-3 group">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />

              <Avatar className="h-7 w-7 mt-0.5 shrink-0 border border-border/60 bg-muted">
                <AvatarFallback className="text-[10px] bg-muted text-foreground font-bold font-mono">
                  {act.user.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="font-semibold text-xs text-foreground truncate">{act.user}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">({act.role})</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono">
                      {act.gudangNama.replace("Gudang ", "")}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0 tabular-nums">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-xs text-foreground/90 font-medium leading-relaxed">{act.aksi}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
