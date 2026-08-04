"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { FieldError } from "react-hook-form"

export interface FormFieldProps {
  label?: string
  required?: boolean
  error?: string | FieldError
  className?: string
  labelClassName?: string
  children: React.ReactNode
}

export function FormField({
  label,
  required,
  error,
  className,
  labelClassName,
  children,
}: FormFieldProps) {
  const errorMessage = typeof error === "string" ? error : error?.message

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label
          className={cn(
            "text-xs font-semibold text-[#4c4546]",
            required && "after:ml-0.5 after:text-rose-500 after:content-['*']",
            labelClassName
          )}
        >
          {label}
        </Label>
      )}
      {children}
      {errorMessage && (
        <p className="text-xs text-rose-500">{errorMessage}</p>
      )}
    </div>
  )
}
