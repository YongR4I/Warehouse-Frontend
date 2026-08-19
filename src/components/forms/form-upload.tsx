"use client"

import * as React from "react"
import { UploadInput, type UploadInputProps } from "@/components/input/upload"
import { FormField, type FormFieldProps } from "./form-field"

export interface FormUploadProps
  extends Omit<FormFieldProps, "children">,
    UploadInputProps {
  uploadClassName?: string
}

export function FormUpload({
  label,
  required,
  error,
  className,
  labelClassName,
  uploadClassName,
  children,
  ...props
}: FormUploadProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      className={className}
      labelClassName={labelClassName}
    >
      <UploadInput className={uploadClassName} {...props}>
        {children}
      </UploadInput>
    </FormField>
  )
}

