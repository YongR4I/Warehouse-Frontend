import * as React from "react"
import { cn } from "@/lib/utils"

export function Avatar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border/40 shadow-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function AvatarFallback({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground select-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
