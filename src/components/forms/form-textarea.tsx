"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { FormField, type FormFieldProps } from "./form-field"
import { cn } from "@/lib/utils"

export interface FormTextareaProps
  extends Omit<FormFieldProps, "children">,
    React.ComponentProps<"textarea"> {
  textareaClassName?: string
}

export function FormTextarea({
  label,
  required,
  error,
  className,
  labelClassName,
  textareaClassName,
  rows = 3,
  placeholder,
  ...props
}: FormTextareaProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      className={className}
      labelClassName={labelClassName}
    >
      <Textarea
        rows={rows}
        placeholder={placeholder}
        className={cn(
          "min-h-10 rounded-xl border-border bg-card text-sm",
          textareaClassName
        )}
        {...props}
      />
    </FormField>
  )
}
