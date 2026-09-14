"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { StatGridSkeleton } from "@/components/skeletons"
import { ColoredBadge } from "@/components/ui/colored-badge"
import type { LucideIcon } from "lucide-react"

export interface ReportSummaryCardItem {
  title: string
  value: string | number
  subLabel?: string
  description?: string
  icon: LucideIcon
  badge?: {
    text: string
    color?: "green" | "red" | "yellow" | "gray" | "blue"
  }
}

export interface ReportSummaryCardsProps {
  items: ReportSummaryCardItem[]
  isLoading?: boolean
  className?: string
}

export function ReportSummaryCards({
  items,
  isLoading = false,
  className,
}: ReportSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className={cn("wrapper mt-6", className)}>
        <StatGridSkeleton count={items.length || 4} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "wrapper mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {items.map((item, idx) => {
        const Icon = item.icon
        return (
          <div
            key={item.title || idx}
            className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Icon className="size-4 text-muted-foreground" />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <ColoredBadge color={item.badge.color || "gray"}>
                  {item.badge.text}
                </ColoredBadge>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {item.value}
              </span>
              {item.subLabel && (
                <span className="text-xs font-semibold text-muted-foreground/70">
                  {item.subLabel}
                </span>
              )}
            </div>

            {item.description && (
              <div className="mt-2 text-[11px] font-semibold text-muted-foreground/60">
                {item.description}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}