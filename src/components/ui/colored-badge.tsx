import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const coloredBadgeVariants = cva(
  "inline-flex items-center rounded-[6px] px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
  {
    variants: {
      color: {
        blue: "bg-[#EEF2FF] text-[#4F46E5] dark:bg-blue-500/20 dark:text-blue-300",
        red: "bg-[#FEE2E2] text-[#DC2626] dark:bg-red-500/20 dark:text-red-300",
        yellow: "bg-[#FEF3C7] text-[#D97706] dark:bg-amber-500/20 dark:text-amber-300",
        green: "bg-[#E2FBE9] text-[#1E824C] dark:bg-emerald-500/20 dark:text-emerald-300",
        purple: "bg-[#F3E8FF] text-[#9333EA] dark:bg-purple-500/20 dark:text-purple-300",
        sky: "bg-[#E0F2FE] text-[#0284C7] dark:bg-sky-500/20 dark:text-sky-300",
        gray: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      color: "blue",
    },
  }
)

export interface ColoredBadgeProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof coloredBadgeVariants> {}

function ColoredBadge({ className, color, ...props }: ColoredBadgeProps) {
  return (
    <span
      className={cn(coloredBadgeVariants({ color }), className)}
      {...props}
    />
  )
}

export { ColoredBadge, coloredBadgeVariants }