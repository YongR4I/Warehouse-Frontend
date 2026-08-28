import * as React from "react"
import { Input as ShadcnInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { cn } from "@/lib/utils"
import { Textarea } from "./textarea"
import { DateInput } from "./date"
import { SelectInput, type SelectOption } from "./select"
import { SearchInput } from "./search"
import { UploadInput, type UploadInputProps } from "./upload"

type InputType = "text" | "textarea" | "date" | "select" | "search" | "upload"

type InputTypeProps =
  | ({ type: "textarea" } & React.ComponentProps<"textarea">)
  | { type: "select"; options: SelectOption[]; placeholder?: string }
  | ({ type: "upload" } & UploadInputProps)
  | ({ type: "text" | "date" | "search" } & React.ComponentProps<"input">)

export type InputProps = {
  label?: string
  required?: boolean
  className?: string
} & InputTypeProps

function InputWrapper({
  label,
  required,
  className,
  children,
}: {
  label?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  if (!label) return <>{children}</>

  return (
    <div
      data-slot="input-field"
      className={cn("flex flex-col gap-1.5", className)}
    >
      <Label
        className={cn(
          "text-xs font-medium text-muted-foreground select-none md:text-sm dark:text-zinc-400",
          required && "after:ml-0.5 after:text-destructive after:content-['*']"
        )}
      >
        {label}
      </Label>
      {children}
    </div>
  )
}

function Input({
  label,
  required,
  className,
  type = "text" as InputType,
  ...props
}: InputProps) {
  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            className={className}
            {...(props as React.ComponentProps<"textarea">)}
          />
        )
      case "date":
        return (
          <DateInput
            className={className}
            {...(props as React.ComponentProps<"input">)}
          />
        )
      case "select":
        return (
          <SelectInput
            className={className}
            options={(props as { options: SelectOption[] }).options}
            placeholder={(props as { placeholder?: string }).placeholder}
          />
        )
      case "search":
        return (
          <SearchInput
            className={className}
            {...(props as React.ComponentProps<"input">)}
          />
        )
      case "upload":
        return (
          <UploadInput className={className} {...(props as UploadInputProps)} />
        )
      default:
        return (
          <ShadcnInput
            data-slot="input"
            className={cn(
              "h-10 border-border bg-card px-3.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
              className
            )}
            {...(props as React.ComponentProps<"input">)}
          />
        )
    }
  }

  return (
    <InputWrapper label={label} required={required}>
      {renderInput()}
    </InputWrapper>
  )
}

export { Input }