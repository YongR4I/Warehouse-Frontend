"use client"

import * as React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table"
import { BiPlus } from "react-icons/bi"
import { cn } from "@/lib/utils"
import type { FieldError } from "react-hook-form"

export interface ItemTableColumnHeader {
  label: string
  className?: string
}

export interface ItemTableProps {
  headers: Array<string | ItemTableColumnHeader>
  children: React.ReactNode
  onAdd?: () => void
  addLabel?: string
  error?: string | FieldError
  className?: string
  showIndexHeader?: boolean
}

export function ItemTable({
  headers,
  children,
  onAdd,
  addLabel = "Tambah item",
  error,
  className,
  showIndexHeader = true,
}: ItemTableProps) {
  const errorMessage = typeof error === "string" ? error : error?.message

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-card",
          className
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              {showIndexHeader && (
                <TableHead className="w-12 text-center text-xs font-semibold text-muted-foreground normal-case">
                  #
                </TableHead>
              )}
              {headers.map((header, idx) => {
                const isObj = typeof header === "object"
                const label = isObj ? header.label : header
                const headerClass = isObj ? header.className : undefined

                return (
                  <TableHead
                    key={idx}
                    className={cn(
                      "text-xs font-semibold text-muted-foreground normal-case",
                      headerClass
                    )}
                  >
                    {label}
                  </TableHead>
                )
              })}
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>

        {onAdd && (
          <div className="border-t border-dashed border-border/60 bg-muted/20 dark:bg-muted/10">
            <button
              type="button"
              onClick={onAdd}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground dark:hover:bg-muted/20"
            >
              <BiPlus className="size-4" />
              <span>{addLabel}</span>
            </button>
          </div>
        )}
      </div>

      {errorMessage && <p className="text-xs text-rose-500">{errorMessage}</p>}
    </div>
  )
}