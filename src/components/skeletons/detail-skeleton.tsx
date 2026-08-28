"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function DetailHeaderSkeleton() {
  return (
    <div className="wrapper">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-3">
          <Skeleton className="h-3 w-40 rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-48 rounded-full" />
            <Skeleton className="size-3 rounded-full" />
          </div>
          <Skeleton className="h-3 w-64 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function DetailMetaSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="wrapper mt-10 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-4 w-28 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function DetailTableSkeleton({
  columns = 6,
  rows = 6,
}: {
  columns?: number
  rows?: number
}) {
  return (
    <div className="wrapper mt-[45px]">
      <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs">
        <div className="border-b border-border/40 bg-card px-6 py-3">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-3 flex-1 rounded-full" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1 rounded-full" />
              ))}
            </div>
          ))}
        </div>
        <div className="flex h-14 items-center justify-between border-t border-border/40 bg-card px-6">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="h-8 w-40 rounded-lg" />
          <Skeleton className="h-3 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function DetailPageSkeleton({
  metaCount = 8,
  columns = 6,
  rows = 6,
}: {
  metaCount?: number
  columns?: number
  rows?: number
}) {
  return (
    <div className="font-sans">
      <DetailHeaderSkeleton />
      <DetailMetaSkeleton count={metaCount} />
      <DetailTableSkeleton columns={columns} rows={rows} />
    </div>
  )
}