"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  BiTrash,
  BiErrorCircle,
  BiCheckDouble,
  BiInfoCircle,
  BiLoaderAlt,
} from "react-icons/bi"
import { cn } from "@/lib/utils"

export type ConfirmVariant = "destructive" | "warning" | "success" | "info"

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: React.ReactNode
  itemName?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  icon?: React.ReactNode
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

const variantStyles: Record<
  ConfirmVariant,
  {
    iconBg: string
    iconColor: string
    defaultIcon: React.ReactNode
    confirmButtonClass: string
    confirmButtonVariant: "destructive" | "default" | "secondary"
  }
> = {
  destructive: {
    iconBg: "bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40",
    iconColor: "text-rose-600 dark:text-rose-400",
    defaultIcon: <BiTrash className="size-5" />,
    confirmButtonClass: "bg-rose-600 hover:bg-rose-700 text-white shadow-xs",
    confirmButtonVariant: "destructive",
  },
  warning: {
    iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    defaultIcon: <BiErrorCircle className="size-5" />,
    confirmButtonClass: "bg-amber-600 hover:bg-amber-700 text-white shadow-xs",
    confirmButtonVariant: "default",
  },
  success: {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    defaultIcon: <BiCheckDouble className="size-5" />,
    confirmButtonClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs",
    confirmButtonVariant: "default",
  },
  info: {
    iconBg: "bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900/40",
    iconColor: "text-sky-600 dark:text-sky-400",
    defaultIcon: <BiInfoCircle className="size-5" />,
    confirmButtonClass: "bg-sky-600 hover:bg-sky-700 text-white shadow-xs",
    confirmButtonVariant: "default",
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  itemName,
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  variant = "destructive",
  icon,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const currentVariant = variantStyles[variant] || variantStyles.destructive

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault()
    await onConfirm()
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
      <DialogContent
        className="max-w-[440px]! gap-0 overflow-hidden rounded-2xl border border-border bg-card p-6 text-foreground shadow-2xl select-none"
        showCloseButton={!isLoading}
      >
        <div className="flex flex-col items-center text-center">
          {/* Icon Header */}
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-2xl transition-transform duration-200",
              currentVariant.iconBg,
              currentVariant.iconColor
            )}
          >
            {icon || currentVariant.defaultIcon}
          </div>

          {/* Dialog Header */}
          <DialogHeader className="mt-4 flex flex-col items-center text-center">
            <DialogTitle className="font-heading text-lg font-bold tracking-tight text-foreground">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-xs font-normal leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>

          {/* Item Highlight Badge (if present) */}
          {itemName && (
            <div className="mt-3 flex max-w-full items-center justify-center rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground">
              <span className="truncate">{itemName}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-6 flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-10 flex-1 rounded-xl border-border font-medium text-foreground hover:bg-muted/40"
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={currentVariant.confirmButtonVariant}
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                "h-10 flex-1 gap-2 rounded-xl font-semibold transition-all",
                currentVariant.confirmButtonClass
              )}
            >
              {isLoading && <BiLoaderAlt className="size-4 animate-spin" />}
              <span>{confirmLabel}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export interface ConfirmOptions {
  title?: string
  description?: React.ReactNode
  itemName?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  icon?: React.ReactNode
  onConfirm: () => Promise<any> | void
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null)

  const confirm = React.useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    setIsOpen(true)
  }, [])

  const handleConfirm = React.useCallback(async () => {
    if (!options) return
    try {
      setIsLoading(true)
      await options.onConfirm()
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const dialogElement = options ? (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isLoading) {
          setIsOpen(open)
        }
      }}
      title={options.title}
      description={options.description}
      itemName={options.itemName}
      confirmLabel={options.confirmLabel}
      cancelLabel={options.cancelLabel}
      variant={options.variant}
      icon={options.icon}
      isLoading={isLoading}
      onConfirm={handleConfirm}
    />
  ) : null

  return { confirm, ConfirmDialog: dialogElement }
}

