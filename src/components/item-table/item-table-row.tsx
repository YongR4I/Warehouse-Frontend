"use client"

import * as React from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import { BiTrash } from "react-icons/bi"
import { cn } from "@/lib/utils"

export interface ItemTableRowProps {
  index: number
  children: React.ReactNode
  onRemove?: () => void
  canRemove?: boolean
  className?: string
  showIndex?: boolean
}

export function ItemTableRow({
  index,
  children,
  onRemove,
  canRemove = true,
  className,
  showIndex = true,
}: ItemTableRowProps) {
  return (
    <TableRow
      className={cn("border-b border-border/40 hover:bg-muted/20", className)}
    >
      {showIndex && (
        <TableCell className="text-center text-sm text-[#4c4546]">
          {index + 1}
        </TableCell>
      )}
      {children}
      <TableCell className="w-12">
        {canRemove && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400"
          >
            <BiTrash className="size-4" />
          </button>
        )}
      </TableCell>
    </TableRow>
  )
}