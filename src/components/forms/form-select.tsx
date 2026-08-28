"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormField, type FormFieldProps } from "./form-field"
import { cn } from "@/lib/utils"

export interface FormSelectOption {
  value: string
  label: string
}

export interface FormSelectProps extends Omit<FormFieldProps, "children"> {
  value?: string
  onValueChange?: (value: string | null) => void
  placeholder?: string
  options?: FormSelectOption[]
  disabled?: boolean
  icon?: React.ReactNode
  triggerClassName?: string
  children?: React.ReactNode
}

export function FormSelect({
  label,
  required,
  error,
  className,
  labelClassName,
  value,
  onValueChange,
  placeholder = "Pilih...",
  options,
  disabled,
  icon,
  triggerClassName,
  children,
}: FormSelectProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      className={className}
      labelClassName={labelClassName}
    >
      {children ? (
        children
      ) : (
        <Select
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          items={options}
        >
          <SelectTrigger
            className={cn(
              "h-10 min-h-10 w-full rounded-xl border-border bg-card px-3.5",
              triggerClassName
            )}
          >
            {icon}
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border bg-popover">
            {options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  )
}