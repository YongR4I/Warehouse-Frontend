"use client"

import * as React from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BiDownload, BiCheck } from "react-icons/bi"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import api from "@/lib/api"
import axios from "axios"

export interface ExportCheckboxOption {
  id: string
  label: string
  defaultChecked?: boolean
}

export interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  totalItemsLabel?: string
  totalItemsCount?: string | number
  filterLabel?: string
  checkboxes?: ExportCheckboxOption[]
  exportUrl?: string // Backend endpoint, e.g. "/barang/export/excel"
  onExport?: (
    format: "xlsx" | "pdf",
    coverage: "all" | "filtered",
    options: Record<string, boolean>
  ) => void
}

export function ExportModal({
  isOpen,
  onClose,
  title,
  description = "Pilih format dan jangkauan data yang ingin diunduh.",
  totalItemsLabel = "Total SKU",
  totalItemsCount,
  filterLabel = "Semua Gudang",
  checkboxes = [
    { id: "sku", label: "Kode SKU & Barcode", defaultChecked: true },
    { id: "category", label: "Kategori & Unit", defaultChecked: true },
    { id: "stock", label: "Rincian Stok Min/Max", defaultChecked: true },
    { id: "attachment", label: "Lampiran Dokumen", defaultChecked: false },
  ],
  exportUrl,
  onExport,
}: ExportModalProps) {
  const [format, setFormat] = React.useState<"xlsx" | "pdf">("xlsx")
  const [coverage, setCoverage] = React.useState<"all" | "filtered">("filtered")

  const buildInitial = (list: ExportCheckboxOption[]): Record<string, boolean> => {
    const initial: Record<string, boolean> = {}
    list.forEach((cb) => {
      initial[cb.id] = cb.defaultChecked ?? false
    })
    return initial
  }

  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, boolean>>(() =>
    buildInitial(checkboxes)
  )
  const [prevIsOpen, setPrevIsOpen] = React.useState(isOpen)

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setSelectedOptions(buildInitial(checkboxes))
    }
  }

  const handleToggleOption = (id: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const [isLoading, setIsLoading] = React.useState(false)

  // Determine if PDF is supported (not supported for bulk exportUrl endpoints)
  const isPdfUnsupported = !!exportUrl

  const activeFormat: "xlsx" | "pdf" =
    isPdfUnsupported && format === "pdf" ? "xlsx" : format

  const handleDownload = async () => {
    setIsLoading(true)

    // Case 1: Real export to backend
    if (exportUrl && activeFormat === "xlsx") {
      try {
        const response = await api.get(exportUrl, {
          responseType: "blob",
        })

        // Create Blob and trigger browser download
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        
        // Extract filename from Content-Disposition if present
        const contentDisposition = response.headers["content-disposition"]
        let filename = `${title.toLowerCase().replace(/\s+/g, "-")}.xlsx`
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/)
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1]
          }
        }

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", filename)
        document.body.appendChild(link)
        link.click()

        // Clean up
        link.parentNode?.removeChild(link)
        window.URL.revokeObjectURL(url)

        if (onExport) {
          onExport("xlsx", coverage, selectedOptions)
        }
        onClose()
      } catch (error) {
        console.error("Export error:", error)
        const status = axios.isAxiosError(error) ? error.response?.status : undefined
        if (status === 403) {
          toast.error("Anda tidak memiliki izin (permission) untuk mengunduh dokumen Excel ini.")
        } else if (status === 401) {
          toast.error("Sesi Anda telah berakhir. Silakan login kembali.")
        } else {
          toast.error("Gagal mengunduh file. Silakan hubungi admin atau coba sesaat lagi.")
        }
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Case 2: Dummy export simulation
    setTimeout(() => {
      setIsLoading(false)
      if (onExport) {
        onExport(activeFormat, coverage, selectedOptions)
      } else {
        toast.success(`Unduh berhasil: Format ${activeFormat.toUpperCase()}, Cakupan: ${coverage === "all" ? "Semua Data" : "Data Terfilter"}`)
      }
      onClose()
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[520px] p-6 gap-0 select-none" showCloseButton={true}>
        {/* Custom Header Layout */}
        <div className="flex items-center gap-4 mb-6">
            <BiDownload className="size-7 text-foreground" />
          <div className="flex-1 min-w-0 pr-6">
            <DialogTitle className="text-base font-bold text-foreground leading-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {description}
            </DialogDescription>
          </div>
        </div>

        {/* 1. FORMAT FILE */}
        <div className="mb-5">
          <h3 className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase mb-2.5">
            1. Format File
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Excel Option */}
            <div
              onClick={() => setFormat("xlsx")}
              className={cn(
                "flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer transition-all duration-150 bg-card hover:bg-accent/10",
                format === "xlsx"
                  ? "border-foreground ring-[0.8px] ring-foreground border-[1.5px]"
                  : "border-border"
              )}
            >
              <div className="size-7 shrink-0 relative flex items-center justify-center">
                <Image
                  src="/xlsxIcon.svg"
                  alt="Excel format icon"
                  width={38}
                  height={38}
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">Excel Spreadsheet</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Format .xlsx untuk olah data</p>
              </div>
            </div>

            {/* PDF Option */}
            <div
              onClick={() => {
                if (isPdfUnsupported) {
                  toast.info(
                    "Format PDF untuk seluruh data belum didukung oleh backend. Saat ini PDF hanya tersedia untuk cetak Surat Jalan per transaksi."
                  )
                  return
                }
                setFormat("pdf")
              }}
              className={cn(
                "flex items-center gap-3.5 p-3 rounded-xl border transition-all duration-150 bg-card relative",
                isPdfUnsupported
                  ? "opacity-50 cursor-not-allowed border-dashed border-border"
                  : "cursor-pointer hover:bg-accent/10",
                format === "pdf" && !isPdfUnsupported
                  ? "border-foreground ring-[0.8px] ring-foreground border-[1.5px]"
                  : format !== "pdf" && !isPdfUnsupported
                    ? "border-border"
                    : ""
              )}
            >
              <div className="size-7 shrink-0 relative flex items-center justify-center">
                <Image
                  src="/pdfIcon.svg"
                  alt="PDF format icon"
                  width={38}
                  height={38}
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-foreground">Dokumen PDF</p>
                  {isPdfUnsupported && (
                    <span className="text-[9px] px-1 py-0.2 bg-rose-500/10 text-rose-600 rounded font-semibold whitespace-nowrap">
                      Excel Only
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {isPdfUnsupported ? "Format PDF belum didukung" : "Siap cetak / cetak laporan"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CAKUPAN DATA */}
        <div className="mb-5">
          <h3 className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase mb-2.5">
            2. Cakupan Data
          </h3>
          <div className="flex flex-col gap-2.5">
            {/* Option: Semua Data */}
            <div
              onClick={() => setCoverage("all")}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-150 bg-card hover:bg-accent/10",
                coverage === "all" ? "border-foreground/40" : "border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "size-4.5 rounded-full border flex items-center justify-center transition-all duration-150",
                    coverage === "all" ? "border-foreground" : "border-border"
                  )}
                >
                  {coverage === "all" && <div className="size-2 rounded-full bg-foreground animate-in zoom-in-50 duration-100" />}
                </div>
                <span className="text-xs font-medium text-foreground">
                  Semua Data {title.replace("Ekspor Data ", "").replace("Ekspor ", "")}
                </span>
              </div>
              {totalItemsCount !== undefined && (
                <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase">
                  {totalItemsCount} {totalItemsLabel.replace("Total ", "")}
                </span>
              )}
            </div>

            {/* Option: Hanya Data Hasil Filter */}
            <div
              onClick={() => setCoverage("filtered")}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-150 bg-card hover:bg-accent/10",
                coverage === "filtered" ? "border-foreground/40" : "border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "size-4.5 rounded-full border flex items-center justify-center transition-all duration-150",
                    coverage === "filtered" ? "border-foreground" : "border-border"
                  )}
                >
                  {coverage === "filtered" && <div className="size-2 rounded-full bg-foreground animate-in zoom-in-50 duration-100" />}
                </div>
                <span className="text-xs font-medium text-foreground">Hanya Data Hasil Filter</span>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground px-2 py-0.5 bg-accent/40 rounded-md border border-border/80">
                {filterLabel}
              </span>
            </div>
          </div>
        </div>

        {/* 3. SERTAKAN DALAM FILE */}
        {checkboxes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase mb-2.5">
              3. Sertakan Dalam File
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {checkboxes.map((cb) => {
                const isChecked = selectedOptions[cb.id] ?? false
                return (
                  <div
                    key={cb.id}
                    onClick={() => handleToggleOption(cb.id)}
                    className="flex items-center gap-3 cursor-pointer py-0.5 group"
                  >
                    <div
                      className={cn(
                        "size-4.5 rounded-md border flex items-center justify-center transition-all duration-100",
                        isChecked
                          ? "bg-foreground border-foreground text-background"
                          : "border-border hover:border-muted-foreground/60"
                      )}
                    >
                      {isChecked && <BiCheck className="size-4 stroke-[3]" />}
                    </div>
                    <span className="text-xs text-foreground group-hover:text-foreground/80 transition-colors">
                      {cb.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer actions with thin separator line */}
        <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-2.5">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground h-9 px-4 rounded-xl"
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-foreground text-background hover:bg-foreground/90 font-bold h-9 px-5 rounded-xl text-xs transition-all duration-150 min-w-[150px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5 justify-center">
                <span className="size-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Mengunduh...
              </span>
            ) : (
              `Unduh File (.${activeFormat})`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
