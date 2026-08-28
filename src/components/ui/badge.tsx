import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium tabular-nums transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        secondary:
          "border-border/60 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:text-rose-400",
        outline: "border-border/80 bg-background text-foreground",
        critical:
          "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:text-rose-400 dark:border-rose-500/30 dark:text-rose-300",
        warning:
          "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:text-amber-300",
        info: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:border-blue-500/30 dark:text-blue-300",
        success:
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:text-emerald-400 dark:border-emerald-500/30 dark:text-emerald-300",
        neutral: "border-border/60 bg-muted/80 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }