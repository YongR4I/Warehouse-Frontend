"use client"

import * as React from "react"
import { BiRefresh } from "react-icons/bi"
import { FormField, type FormFieldProps } from "./form-field"
import { cn } from "@/lib/utils"

export interface FormReferenceInputProps
  extends Omit<FormFieldProps, "children">,
    React.ComponentProps<"input"> {
  inputClassName?: string
  onRegenerate?: () => void
}

export const FormReferenceInput = React.forwardRef<
  HTMLInputElement,
  FormReferenceInputProps
>(function FormReferenceInput(
  {
    label = "No. Referensi",
    required = true,
    error,
    className,
    labelClassName,
    inputClassName,
    onRegenerate,
    disabled,
    ...props
  },
  ref
) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      className={className}
      labelClassName={labelClassName}
    >
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="text"
          disabled={disabled}
          className={cn(
            "h-10 min-h-10 w-full rounded-xl border border-border bg-card px-3.5 text-sm font-medium text-foreground transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60",
            onRegenerate && "pr-10",
            inputClassName
          )}
          {...props}
        />
        {onRegenerate && !disabled && (
          <button
            type="button"
            onClick={onRegenerate}
            title="Generate ulang nomor referensi"
            aria-label="Generate ulang nomor referensi"
            className="absolute right-2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
          >
            <BiRefresh className="size-4.5" />
          </button>
        )}
      </div>
    </FormField>
  )
})
