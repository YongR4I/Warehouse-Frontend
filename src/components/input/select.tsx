"use client"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
}

export interface SelectInputProps {
  options: SelectOption[]
  placeholder?: string
  value?: string
  onValueChange?: (value: string | null) => void
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  name?: string
  className?: string
}

function SelectInput({
  className,
  placeholder,
  options = [],
  value,
  onValueChange,
  defaultValue,
  disabled,
  required,
  name,
}: SelectInputProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      disabled={disabled}
      required={required}
      name={name}
    >
      <SelectTrigger
        className={cn(
          "h-10 w-full bg-card border-border px-3.5 text-sm transition-colors focus:border-ring focus:ring-3 focus:ring-ring/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 data-[size=default]:h-10",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border border-border bg-popover rounded-2xl">
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="focus:bg-accent focus:text-accent-foreground rounded-xl cursor-pointer"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { SelectInput }
