"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface FormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  children: React.ReactNode
  className?: string
}

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  children,
  className,
}: FormModalProps) {
  const renderIcon = () => {
    if (!Icon) return null
    if (React.isValidElement(Icon)) return Icon
    const IconComponent = Icon as React.ComponentType<{ className?: string }>
    return <IconComponent className="size-6 text-foreground" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className={cn(
          "max-w-[540px]! gap-0 overflow-hidden rounded-2xl border border-border bg-background p-0 text-foreground shadow-2xl",
          className
        )}
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex size-9 items-center justify-center rounded-xl bg-muted/10 text-foreground">
                {renderIcon()}
              </div>
            )}
            <div>
              <DialogTitle className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  )
}

export interface FormModalBodyProps {
  children: React.ReactNode
  className?: string
}

function FormModalBody({ children, className }: FormModalBodyProps) {
  return (
    <div className={cn("flex flex-col gap-4 px-6 pt-2 pb-6", className)}>
      {children}
    </div>
  )
}

export interface FormModalFooterProps {
  summary?: React.ReactNode
  children: React.ReactNode
  className?: string
}

function FormModalFooter({
  summary,
  children,
  className,
}: FormModalFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border/60 bg-card px-6 py-4.5",
        className
      )}
    >
      {summary ? <div>{summary}</div> : <div />}
      <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
        {children}
      </div>
    </div>
  )
}

FormModal.Body = FormModalBody
FormModal.Footer = FormModalFooter