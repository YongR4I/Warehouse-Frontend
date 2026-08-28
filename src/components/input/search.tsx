import * as React from "react"
import { Input as ShadcnInput } from "@/components/ui/input"
import { BiSearch } from "react-icons/bi"

import { cn } from "@/lib/utils"

function SearchInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <div className="relative w-full">
      <BiSearch className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
      <ShadcnInput
        data-slot="input-search"
        className={cn(
          "h-10 border-border bg-card pr-3.5 pl-10 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
          className
        )}
        {...props}
      />
    </div>
  )
}

export { SearchInput }