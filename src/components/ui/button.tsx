import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background hover:bg-foreground/90 border-transparent shadow-xs font-semibold",
        outline:
          "border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        destructive:
          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8.5 gap-1.5 px-4",
        xs: "h-6.5 gap-1 px-2.5 text-[11px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7.5 gap-1 px-3 text-xs",
        lg: "h-9.5 gap-2 px-5 text-sm",
        icon: "size-8 rounded-full",
        "icon-xs": "size-6.5 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7.5 rounded-full",
        "icon-lg": "size-9.5 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
