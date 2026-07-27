import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { BiUpload } from "react-icons/bi"

import { cn } from "@/lib/utils"

function UploadInput({
  className,
  children,
  ...props
}: React.ComponentProps<"input"> & { children?: React.ReactNode }) {
  return (
    <label
      data-slot="input-upload"
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-slate-100/40 dark:bg-zinc-900/40 py-8 px-4 cursor-pointer text-center select-none w-full transition-all duration-200 hover:bg-muted/30 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <BiUpload className="h-6 w-6 shrink-0 text-slate-500 dark:text-zinc-400" />
      <span className="truncate text-sm font-semibold text-slate-800 dark:text-zinc-200">
        {children || "Klik untuk upload atau seret file ke sini"}
      </span>
      <span className="text-xs text-muted-foreground">
        PDF, JPG, atau PNG (Maks. 5MB)
      </span>
      <InputPrimitive type="file" className="hidden" {...props} />
    </label>
  )
}

export { UploadInput }
