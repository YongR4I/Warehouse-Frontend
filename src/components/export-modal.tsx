"use client"

import * as React from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BiDownload, BiCheck } from "react-icons/bi"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import api from "@/lib/api"
import axios from "axios"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export interface ExportCheckboxOption {
  id: string
  label: string
  defaultChecked?: boolean
}

export interface ExportColumn {
  header: string
  accessor: string
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
  exportUrl?: string
  onExport?: (
    format: "xlsx" | "pdf",
    coverage: "all" | "filtered",
    options: Record<string, boolean>
  ) => void
  fetchExportData?: (
    coverage: "all" | "filtered"
  ) => Promise<Record<string, unknown>[]>
  exportColumns?: ExportColumn[]
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (
      acc !== null &&
      acc !== undefined &&
      typeof acc === "object" &&
      key in (acc as Record<string, unknown>)
    ) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

function generateExcel(
  title: string,
  headers: string[],
  rows: (string | number | boolean)[][]
) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Data")
  const filename = `${title.toLowerCase().replace(/\s+/g, "-")}.xlsx`
  XLSX.writeFile(wb, filename)
}

function generatePdf(
  title: string,
  headers: string[],
  rows: (string | number | boolean)[][]
) {
  const doc = new jsPDF({
    orientation: headers.length > 5 ? "landscape" : "portrait",
  })
  doc.setFontSize(14)
  doc.text(title, 14, 20)
  autoTable(doc, {
    startY: 28,
    head: [headers],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  })
  const filename = `${title.toLowerCase().replace(/\s+/g, "-")}.pdf`
  doc.save(filename)
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
  fetchExportData,
  exportColumns,
}: ExportModalProps) {
  const [format, setFormat] = React.useState<"xlsx" | "pdf">("xlsx")
  const [coverage, setCoverage] = React.useState<"all" | "filtered">("filtered")

  const buildInitial = (
    list: ExportCheckboxOption[]
  ): Record<string, boolean> => {
    const initial: Record<string, boolean> = {}
    list.forEach((cb) => {
      initial[cb.id] = cb.defaultChecked ?? false
    })
    return initial
  }

  const [selectedOptions, setSelectedOptions] = React.useState<
    Record<string, boolean>
  >(() => buildInitial(checkboxes))
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

  const hasClientExport = !!fetchExportData && !!exportColumns
  const isPdfUnsupported = !!exportUrl && !hasClientExport

  const activeFormat: "xlsx" | "pdf" =
    isPdfUnsupported && format === "pdf" ? "xlsx" : format

  const handleDownload = async () => {
    setIsLoading(true)

    // Case 1: Real export to backend (Excel via exportUrl)
    if (exportUrl && activeFormat === "xlsx") {
      try {
        const response = await api.get(exportUrl, {
          responseType: "blob",
        })

        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })

        const contentDisposition = response.headers["content-disposition"]
        let filename = `${title.toLowerCase().replace(/\s+/g, "-")}.xlsx`
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(
            /filename="?([^";]+)"?/
          )
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

        link.parentNode?.removeChild(link)
        window.URL.revokeObjectURL(url)

        if (onExport) {
          onExport("xlsx", coverage, selectedOptions)
        }
        onClose()
      } catch (error) {
        console.error("Export error:", error)
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined
        if (status === 403) {
          toast.error(
            "Anda tidak memiliki izin (permission) untuk mengunduh dokumen Excel ini."
          )
        } else if (status === 401) {
          toast.error("Sesi Anda telah berakhir. Silakan login kembali.")
        } else {
          toast.error(
            "Gagal mengunduh file. Silakan hubungi admin atau coba sesaat lagi."
          )
        }
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Case 2: Client-side export
    if (hasClientExport) {
      try {
        const data = await fetchExportData(coverage)
        if (!data || data.length === 0) {
          toast.warning("Tidak ada data untuk diekspor.")
          setIsLoading(false)
          return
        }

        const headers = exportColumns.map((c) => c.header)
        const rows = data.map((row) =>
          exportColumns.map((c) => {
            const val = getByPath(row, c.accessor)
            if (val === null || val === undefined) return ""
            if (typeof val === "boolean") return val ? "Ya" : "Tidak"
            return String(val)
          })
        )

        if (activeFormat === "pdf") {
          generatePdf(title, headers, rows)
        } else {
          generateExcel(title, headers, rows)
        }

        toast.success(`Berhasil mengunduh file ${activeFormat.toUpperCase()}`)
        if (onExport) {
          onExport(activeFormat, coverage, selectedOptions)
        }
        onClose()
      } catch (error) {
        console.error("Export error:", error)
        toast.error("Gagal membuat file. Silakan coba lagi.")
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Case 3: Fallback (no exportUrl, no clientExport)
    setTimeout(() => {
      setIsLoading(false)
      if (onExport) {
        onExport(activeFormat, coverage, selectedOptions)
      } else {
        toast.success(
          `Unduh berhasil: Format ${activeFormat.toUpperCase()}, Cakupan: ${coverage === "all" ? "Semua Data" : "Data Terfilter"}`
        )
      }
      onClose()
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[520px] gap-0 p-6 select-none"
        showCloseButton={true}
      >
        {/* Custom Header Layout */}
        <div className="mb-6 flex items-center gap-4">
          <BiDownload className="size-7 text-foreground" />
          <div className="min-w-0 flex-1 pr-6">
            <DialogTitle className="text-base leading-tight font-bold text-foreground">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-muted-foreground">
              {description}
            </DialogDescription>
          </div>
        </div>

        {/* 1. FORMAT FILE */}
        <div className="mb-5">
          <h3 className="mb-2.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            1. Format File
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Excel Option */}
            <div
              onClick={() => setFormat("xlsx")}
              className={cn(
                "flex cursor-pointer items-center gap-3.5 rounded-xl border bg-card p-3 transition-all duration-150 hover:bg-accent/10",
                format === "xlsx"
                  ? "border-[1.5px] border-foreground ring-[0.8px] ring-foreground"
                  : "border-border"
              )}
            >
              <div className="relative flex size-7 shrink-0 items-center justify-center">
                <Image
                  src="/xlsxIcon.svg"
                  alt="Excel format icon"
                  width={38}
                  height={38}
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">
                  Excel Spreadsheet
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Format .xlsx untuk olah data
                </p>
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
                "relative flex items-center gap-3.5 rounded-xl border bg-card p-3 transition-all duration-150",
                isPdfUnsupported
                  ? "cursor-not-allowed border-dashed border-border opacity-50"
                  : "cursor-pointer hover:bg-accent/10",
                format === "pdf" && !isPdfUnsupported
                  ? "border-[1.5px] border-foreground ring-[0.8px] ring-foreground"
                  : format !== "pdf" && !isPdfUnsupported
                    ? "border-border"
                    : ""
              )}
            >
              <div className="relative flex size-7 shrink-0 items-center justify-center">
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
                  <p className="text-xs font-bold text-foreground">
                    Dokumen PDF
                  </p>
                  {isPdfUnsupported && (
                    <span className="py-0.2 rounded bg-rose-500/10 px-1 text-[9px] font-semibold whitespace-nowrap text-rose-600 dark:text-rose-400">
                      Excel Only
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {isPdfUnsupported
                    ? "Format PDF belum didukung"
                    : "Siap cetak / cetak laporan"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CAKUPAN DATA */}
        <div className="mb-5">
          <h3 className="mb-2.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            2. Cakupan Data
          </h3>
          <div className="flex flex-col gap-2.5">
            {/* Option: Semua Data */}
            <div
              onClick={() => setCoverage("all")}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-xl border bg-card p-3.5 transition-all duration-150 hover:bg-accent/10",
                coverage === "all" ? "border-foreground/40" : "border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-4.5 items-center justify-center rounded-full border transition-all duration-150",
                    coverage === "all" ? "border-foreground" : "border-border"
                  )}
                >
                  {coverage === "all" && (
                    <div className="size-2 animate-in rounded-full bg-foreground duration-100 zoom-in-50" />
                  )}
                </div>
                <span className="text-xs font-medium text-foreground">
                  Semua Data{" "}
                  {title.replace("Ekspor Data ", "").replace("Ekspor ", "")}
                </span>
              </div>
              {totalItemsCount !== undefined && (
                <span className="font-mono text-[10px] font-medium text-muted-foreground uppercase">
                  {totalItemsCount} {totalItemsLabel.replace("Total ", "")}
                </span>
              )}
            </div>

            {/* Option: Hanya Data Hasil Filter */}
            <div
              onClick={() => setCoverage("filtered")}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-xl border bg-card p-3.5 transition-all duration-150 hover:bg-accent/10",
                coverage === "filtered"
                  ? "border-foreground/40"
                  : "border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-4.5 items-center justify-center rounded-full border transition-all duration-150",
                    coverage === "filtered"
                      ? "border-foreground"
                      : "border-border"
                  )}
                >
                  {coverage === "filtered" && (
                    <div className="size-2 animate-in rounded-full bg-foreground duration-100 zoom-in-50" />
                  )}
                </div>
                <span className="text-xs font-medium text-foreground">
                  Hanya Data Hasil Filter
                </span>
              </div>
              <span className="rounded-md border border-border/80 bg-accent/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {filterLabel}
              </span>
            </div>
          </div>
        </div>

        {/* 3. SERTAKAN DALAM FILE */}
        {checkboxes.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              3. Sertakan Dalam File
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {checkboxes.map((cb) => {
                const isChecked = selectedOptions[cb.id] ?? false
                return (
                  <div
                    key={cb.id}
                    onClick={() => handleToggleOption(cb.id)}
                    className="group flex cursor-pointer items-center gap-3 py-0.5"
                  >
                    <div
                      className={cn(
                        "flex size-4.5 items-center justify-center rounded-md border transition-all duration-100",
                        isChecked
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-muted-foreground/60"
                      )}
                    >
                      {isChecked && <BiCheck className="size-4 stroke-[3]" />}
                    </div>
                    <span className="text-xs text-foreground transition-colors group-hover:text-foreground/80">
                      {cb.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer actions with thin separator line */}
        <div className="flex items-center justify-end gap-2.5 border-t border-border/60 pt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-9 rounded-xl px-4 text-xs text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            onClick={handleDownload}
            className="h-9 min-w-[150px] rounded-xl bg-foreground px-5 text-xs font-bold text-background transition-all duration-150 hover:bg-foreground/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-1.5">
                <span className="size-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
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