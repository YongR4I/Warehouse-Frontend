"use client"

import * as React from "react"
import {
  BiUpload,
  BiImage,
  BiTrash,
  BiFile,
  BiFileBlank,
  BiRefresh,
  BiCheckCircle,
} from "react-icons/bi"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface UploadInputProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "onChange"
> {
  value?: File | File[] | string | string[] | null
  initialUrl?: string | string[] | null
  onChange?: (files: File[]) => void
  onRemove?: (index?: number) => void
  maxSize?: number // in MB, default 10MB
  helperText?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
  previewType?: "image" | "file" | "auto"
  children?: React.ReactNode
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function isImageUrl(url: string): boolean {
  if (!url) return false
  if (url.startsWith("blob:") || url.startsWith("data:image/")) return true
  const cleanUrl = url.split("?")[0].toLowerCase()
  return (
    /\.(jpg|jpeg|png|webp|gif|svg|avif)$/.test(cleanUrl) ||
    cleanUrl.includes("/uploads/") ||
    cleanUrl.includes("/storage/")
  )
}

export function UploadInput({
  className,
  children,
  value,
  initialUrl,
  onChange,
  onRemove,
  maxSize = 10,
  helperText,
  accept = "image/*",
  multiple = false,
  disabled = false,
  previewType = "auto",
  id,
  ...props
}: UploadInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [internalError, setInternalError] = React.useState<string | null>(null)
  const uniqueId = React.useId()
  const inputId = id || uniqueId

  // Normalize files and existing URLs
  const normalizedFiles = React.useMemo<File[]>(() => {
    if (!value) return []
    if (Array.isArray(value)) {
      return value.filter((v): v is File => v instanceof File)
    }
    if (value instanceof File) {
      return [value]
    }
    return []
  }, [value])

  const existingUrls = React.useMemo<string[]>(() => {
    const urls: string[] = []
    if (typeof value === "string" && value.trim()) {
      urls.push(value)
    } else if (Array.isArray(value)) {
      value.forEach((v) => {
        if (typeof v === "string" && v.trim()) urls.push(v)
      })
    }
    if (initialUrl) {
      if (typeof initialUrl === "string" && initialUrl.trim()) {
        if (!urls.includes(initialUrl)) urls.push(initialUrl)
      } else if (Array.isArray(initialUrl)) {
        initialUrl.forEach((u) => {
          if (typeof u === "string" && u.trim() && !urls.includes(u))
            urls.push(u)
        })
      }
    }
    return urls
  }, [value, initialUrl])

  // Track Object URLs for local files to prevent memory leaks
  const previewUrls = React.useMemo(() => {
    if (typeof window === "undefined") return []
    return normalizedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
  }, [normalizedFiles])

  React.useEffect(() => {
    return () => {
      previewUrls.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url)
      })
    }
  }, [previewUrls])

  const handleFiles = (incomingFiles: FileList | File[]) => {
    setInternalError(null)
    const fileArray = Array.from(incomingFiles)
    if (fileArray.length === 0) return

    // Size validation
    const maxBytes = maxSize * 1024 * 1024
    const validFiles: File[] = []
    for (const file of fileArray) {
      if (file.size > maxBytes) {
        setInternalError(
          `Ukuran file "${file.name}" melebihi batas maksimal ${maxSize}MB`
        )
        return
      }
      validFiles.push(file)
    }

    if (multiple) {
      const merged = [...normalizedFiles, ...validFiles]
      onChange?.(merged)
    } else {
      onChange?.([validFiles[0]])
    }

    // Reset input value so re-selecting same file triggers change
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleRemoveFile = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setInternalError(null)
    const updated = normalizedFiles.filter((_, i) => i !== index)
    onChange?.(updated)
    onRemove?.(index)
  }

  const handleRemoveExistingUrl = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setInternalError(null)
    onRemove?.(index)
  }

  const triggerPicker = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (!disabled && inputRef.current) {
      inputRef.current.click()
    }
  }

  const isImageMode =
    previewType === "image" ||
    (previewType === "auto" &&
      !multiple &&
      (accept.includes("image") ||
        (previewUrls[0] && previewUrls[0].file.type.startsWith("image/")) ||
        (existingUrls.length > 0 && isImageUrl(existingUrls[0]))))

  // 1. Single Image Mode Preview
  if (isImageMode && (previewUrls.length > 0 || existingUrls.length > 0)) {
    const displayUrl = previewUrls[0]?.url || existingUrls[0]
    const fileObj = previewUrls[0]?.file
    const fileName = fileObj ? fileObj.name : "Foto Produk Tersimpan"
    const fileSize = fileObj ? formatFileSize(fileObj.size) : null

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-xs transition-all duration-200 hover:border-border/80 dark:bg-zinc-900/60",
            disabled && "pointer-events-none opacity-60"
          )}
        >
          <div className="relative flex aspect-video max-h-56 w-full items-center justify-center overflow-hidden rounded-xl bg-muted/40 dark:bg-zinc-950/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt={fileName}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />

            {/* Top Action Overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={triggerPicker}
                className="h-8 gap-1.5 rounded-lg bg-background/90 px-2.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-xs hover:bg-background"
                title="Ganti Foto"
              >
                <BiRefresh className="size-4" />
                <span>Ganti</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  if (previewUrls.length > 0) {
                    handleRemoveFile(0, e)
                  } else {
                    handleRemoveExistingUrl(0, e)
                  }
                }}
                className="h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium shadow-sm hover:bg-destructive/90"
                title="Hapus Foto"
              >
                <BiTrash className="size-4" />
                <span>Hapus</span>
              </Button>
            </div>
          </div>

          {/* Bottom File Info Bar */}
          <div className="mt-2.5 flex items-center justify-between px-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 overflow-hidden">
              <BiImage className="size-4 shrink-0 text-primary" />
              <span className="truncate font-medium text-foreground">
                {fileName}
              </span>
            </div>
            {fileSize && (
              <span className="shrink-0 text-[11px] font-medium">
                {fileSize}
              </span>
            )}
          </div>
        </div>

        {internalError && (
          <p className="text-xs font-medium text-destructive">
            {internalError}
          </p>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={handleInputChange}
          {...props}
        />
      </div>
    )
  }

  // 2. Multi-File / Document Mode with selected items
  const hasFiles = previewUrls.length > 0 || existingUrls.length > 0

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Dropzone Area */}
      <label
        htmlFor={inputId}
        data-slot="input-upload"
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-all duration-200 select-none",
          "border-border bg-slate-50/50 hover:border-slate-400 hover:bg-muted/40 dark:bg-zinc-900/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60",
          isDragging && "border-primary bg-primary/5 ring-4 ring-primary/10",
          disabled && "pointer-events-none cursor-not-allowed opacity-50",
          hasFiles && !multiple && "py-5"
        )}
      >
        <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shadow-xs dark:bg-zinc-800 dark:text-zinc-300">
          <BiUpload className="size-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            {children || "Klik untuk upload atau seret file ke sini"}
          </span>
          <span className="text-xs text-muted-foreground">
            {helperText ||
              (accept.includes("image")
                ? `PNG, JPG, JPEG, atau WEBP (Maks. ${maxSize}MB)`
                : `PDF, JPG, PNG, atau Dokumen (Maks. ${maxSize}MB)`)}
          </span>
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={handleInputChange}
          {...props}
        />
      </label>

      {/* Internal Error Message */}
      {internalError && (
        <p className="text-xs font-medium text-destructive">{internalError}</p>
      )}

      {/* File List for Multi-File or Document uploads */}
      {hasFiles && (
        <div className="flex flex-col gap-2">
          {/* Newly selected files */}
          {previewUrls.map(({ file, url }, idx) => {
            const isImg = file.type.startsWith("image/")
            return (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-2.5 shadow-2xs transition-colors dark:bg-zinc-900/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {isImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={file.name}
                      className="size-10 shrink-0 rounded-lg border border-border/60 object-cover"
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {file.type.includes("pdf") ? (
                        <BiFile className="size-5" />
                      ) : (
                        <BiFileBlank className="size-5" />
                      )}
                    </div>
                  )}

                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {file.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                        <BiCheckCircle className="size-3" /> Siap diupload
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleRemoveFile(idx, e)}
                  disabled={disabled}
                  className="size-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Hapus file"
                >
                  <BiTrash className="size-4" />
                </Button>
              </div>
            )
          })}

          {/* Existing URL files */}
          {existingUrls.map((url, idx) => {
            const isImg = isImageUrl(url)
            const cleanName = url.split("/").pop() || `Dokumen ${idx + 1}`
            return (
              <div
                key={`${url}-${idx}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-2.5 shadow-2xs transition-colors dark:bg-zinc-900/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {isImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={cleanName}
                      className="size-10 shrink-0 rounded-lg border border-border/60 object-cover"
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <BiFile className="size-5" />
                    </div>
                  )}

                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {cleanName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      File tersimpan
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleRemoveExistingUrl(idx, e)}
                  disabled={disabled}
                  className="size-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="Hapus file"
                >
                  <BiTrash className="size-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
