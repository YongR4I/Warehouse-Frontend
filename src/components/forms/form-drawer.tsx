"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export interface FormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  children: React.ReactNode
  className?: string
}

export function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  children,
  className,
}: FormDrawerProps) {
  const renderIcon = () => {
    if (!Icon) return null
    if (React.isValidElement(Icon)) return Icon
    const IconComponent = Icon as React.ComponentType<{ className?: string }>
    return <IconComponent className="size-10 text-foreground" />
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          "flex w-full flex-col border-l border-border bg-background p-0 text-foreground sm:max-w-3xl!",
          className
        )}
      >
        {/* Header */}
        <SheetHeader className="border-b border-border/60 p-6">
          <div className="flex items-center gap-3">
            {Icon && (
              <span>
                {renderIcon()}
              </span>
            )}
            <div>
              <SheetTitle className="font-heading text-2xl font-semibold text-foreground">
                {title}
              </SheetTitle>
              {description && (
                <SheetDescription className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        {children}
      </SheetContent>
    </Sheet>
  )
}

export interface FormDrawerBodyProps {
  children: React.ReactNode
  className?: string
}

function FormDrawerBody({ children, className }: FormDrawerBodyProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto bg-[#f9f9f9] p-6", className)}>
      {children}
    </div>
  )
}

export interface FormDrawerFooterProps {
  summary?: React.ReactNode
  children: React.ReactNode
  className?: string
}

function FormDrawerFooter({ summary, children, className }: FormDrawerFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border/50 bg-white px-6 py-5",
        className
      )}
    >
      {summary ? <div>{summary}</div> : <div />}
      <div className="flex items-center gap-3">{children}</div>
    </div>
  )
}

FormDrawer.Body = FormDrawerBody
FormDrawer.Footer = FormDrawerFooter
