"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function DashboardMetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 divide-y divide-border/60 border-b border-border/60 pb-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className={`flex flex-col justify-between py-2.5 ${
            idx === 0 ? "sm:pr-6" : idx === 3 ? "sm:pl-6" : "sm:px-6"
          }`}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-7 w-24 rounded-full" />
          <Skeleton className="mt-1.5 h-3 w-36 rounded-full" />
          <Skeleton className="mt-2.5 h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function DashboardChartSkeleton() {
  return (
    <div className="border-b border-border/60 pb-6">
      <div className="flex flex-col justify-between gap-3 border-b border-border/40 pb-3 sm:flex-row sm:items-center">
        <Skeleton className="h-4 w-40 rounded-full" />
        <Skeleton className="h-7 w-36 rounded-md" />
      </div>
      <div className="mt-4 flex flex-wrap items-baseline gap-8">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-6 w-32 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-48 w-full rounded-xl" />
    </div>
  )
}

export function DashboardLogTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-44 rounded-full" />
          <Skeleton className="h-3 w-64 rounded-full" />
        </div>
        <Skeleton className="h-6 w-40 rounded-full" />
      </div>
      <div className="overflow-hidden rounded-md border border-border/60 bg-background">
        <div className="border-b border-border/60 bg-muted/30 px-3 py-3">
          <div className="flex gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-3 flex-1 rounded-full" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-3 py-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-16 flex-1 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-3 w-20 flex-1 rounded-full" />
              <Skeleton className="hidden h-3 w-32 flex-1 rounded-full sm:block" />
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DashboardInsightsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((section) => (
        <div key={section}>
          <div className="border-b border-border/60 pb-2">
            <Skeleton className="h-4 w-40 rounded-full" />
          </div>
          <div className="mt-3 space-y-3">
            {Array.from({ length: section === 2 ? 3 : 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded border border-border/40 bg-muted/20 px-2.5 py-3"
              >
                <div className="flex items-center gap-2 flex-1">
                  <Skeleton className="size-4 rounded-full" />
                  <Skeleton className="h-3 w-28 rounded-full" />
                </div>
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function DashboardPageSkeleton() {
  return (
    <>
      <div className="wrapper">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-7 w-56 rounded-full" />
            <Skeleton className="h-3 w-80 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="wrapper mt-6">
        <DashboardMetricsSkeleton />
      </div>
      <div className="wrapper mt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <DashboardChartSkeleton />
            <DashboardLogTableSkeleton />
          </div>
          <div className="border-l border-border/40 lg:col-span-1 lg:pl-6">
            <DashboardInsightsSkeleton />
          </div>
        </div>
      </div>
    </>
  )
}