import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const coloredBadgeVariants = cva(
  "inline-flex items-center rounded-[6px] px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
  {
    variants: {
      color: {
        blue: "bg-[#EEF2FF] text-[#4F46E5]",
        red: "bg-[#FEE2E2] text-[#DC2626]",
        yellow: "bg-[#FEF3C7] text-[#D97706]",
        green: "bg-[#E2FBE9] text-[#1E824C]",
        purple: "bg-[#F3E8FF] text-[#9333EA]",
        sky: "bg-[#E0F2FE] text-[#0284C7]",
        gray: "bg-[#F3F4F6] text-[#6B7280]",
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
