"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function FilterBarSkeleton({
  showSearch = true,
  opsionCount = 2,
}: {
  showSearch?: boolean
  opsionCount?: number
}) {
  return (
    <div className="flex items-center gap-2">
      {showSearch && <Skeleton className="h-[42px] flex-1 rounded-2xl" />}
      {Array.from({ length: opsionCount }).map((_, i) => (
        <Skeleton key={i} className="h-[42px] w-[160px] rounded-2xl" />
      ))}
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="wrapper">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="h-7 w-56 rounded-full" />
          <Skeleton className="h-3 w-72 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}