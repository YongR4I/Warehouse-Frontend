"use client"

import * as React from "react"
import { FormField, type FormFieldProps } from "./form-field"
import { cn } from "@/lib/utils"

export interface FormDateProps
  extends Omit<FormFieldProps, "children">,
    React.ComponentProps<"input"> {
  inputClassName?: string
}

export function FormDate({
  label,
  required,
  error,
  className,
  labelClassName,
  inputClassName,
  ...props
}: FormDateProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      className={className}
      labelClassName={labelClassName}
    >
      <input
        type="date"
        className={cn(
          "min-h-10 h-10 w-full rounded-xl border border-border bg-card px-3.5 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
          inputClassName
        )}
        {...props}
      />
    </FormField>
  )
}
