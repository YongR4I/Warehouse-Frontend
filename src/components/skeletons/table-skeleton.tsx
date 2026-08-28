"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

const WIDTHS = ["w-24", "w-32", "w-20", "w-28", "w-16", "w-24", "w-20", "w-12", "w-28", "w-16"] as const

export function TableSkeletonRows({
  columns,
  rows = 10,
}: {
  columns: number
  rows?: number
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow
          key={`sk-row-${rowIdx}`}
          className="h-16 border-b border-border/40 hover:bg-transparent"
        >
          {Array.from({ length: columns }).map((_, colIdx) => {
            const w = WIDTHS[colIdx % WIDTHS.length]
            // avatar/img cell mimic for first col when barang-like
            const isFirst = colIdx === 0
            const isLast = colIdx === columns - 1
            return (
              <TableCell
                key={`sk-cell-${rowIdx}-${colIdx}`}
                className={isFirst ? "pl-6" : isLast ? "pr-6 text-right" : undefined}
              >
                <div className={`flex items-center ${isLast ? "justify-end" : ""} gap-3`}>
                  {isFirst && rowIdx % 3 === 0 && columns >= 5 ? (
                    // occasionally render avatar block for barang rows
                    <Skeleton className="size-10 shrink-0 rounded-[6px]" />
                  ) : null}
                  <Skeleton className={`h-4 ${w} max-w-full rounded-full`} />
                  {/* second line for dense cells */}
                  {colIdx === 1 && rowIdx % 2 === 0 ? (
                    <Skeleton className="hidden h-3 w-16 rounded-full sm:block" />
                  ) : null}
                </div>
              </TableCell>
            )
          })}
        </TableRow>
      ))}
    </>
  )
}

export function TableSkeleton({
  columns,
  rows = 10,
}: {
  columns: number
  rows?: number
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="border-b border-border/60 bg-card px-6 py-3">
        <div className="flex gap-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-3 flex-1 ${i === 0 ? "max-w-[140px]" : ""} rounded-full`}
            />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton
                key={j}
                className={`h-4 flex-1 ${WIDTHS[j % WIDTHS.length]} rounded-full`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}