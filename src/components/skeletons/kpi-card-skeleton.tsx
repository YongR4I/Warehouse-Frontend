"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function KpiCardSkeleton() {
  return (
    <Card className="min-h-[105px] w-full border-border/70 bg-card p-4">
      <div className="flex h-full flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="size-5 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-3 w-32 rounded-full" />
        </div>
      </div>
    </Card>
  )
}

export function KpiGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5">
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-full" />
        <Skeleton className="h-3 w-32 rounded-full" />
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <Skeleton className="h-8 w-12 rounded-full" />
        <Skeleton className="h-3 w-10 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-3 w-24 rounded-full" />
    </div>
  )
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}