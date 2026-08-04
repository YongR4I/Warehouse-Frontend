"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormSectionProps {
  title?: string
  children: React.ReactNode
  className?: string
  titleClassName?: string
}

export function FormSection({
  title,
  children,
  className,
  titleClassName,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h3
          className={cn(
            "text-xs font-semibold tracking-widest text-foreground uppercase",
            titleClassName
          )}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
