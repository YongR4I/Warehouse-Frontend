import * as React from "react"
import { Input as ShadcnInput } from "@/components/ui/input"
import { BiSearch } from "react-icons/bi"

import { cn } from "@/lib/utils"

function InputSearch({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <div className="relative w-full" style={{ height: "43px" }}>
      <BiSearch className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
      <ShadcnInput
        data-slot="input-search"
        className={cn(
          "h-full w-full border-border bg-card pr-3.5 pl-10 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
          className
        )}
        {...props}
      />
    </div>
  )
}

export { InputSearch }