import type { ColoredBadgeProps } from "@/components/ui/colored-badge"

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  draft: "Draft",
  in_progress: "Berjalan",
  approved: "Disetujui",
  rejected: "Ditolak",
  delivered: "Terkirim",
  partial: "Sebagian",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  aktif: "Aktif",
  nonaktif: "Nonaktif",
  active: "Aktif",
  inactive: "Nonaktif",
  full: "Penuh",
  maintenance: "Maintenance",
  hadir: "Hadir",
  terlambat: "Terlambat",
  izin: "Izin",
  cuti: "Cuti",
  sakit: "Sakit",
  alpha: "Alpha",
}

export function statusLabel(status: string | null | undefined): string {
  if (!status) return "-"
  return STATUS_LABELS[status.toLowerCase()] ?? status
}

const STATUS_COLORS: Record<string, NonNullable<ColoredBadgeProps["color"]>> = {
  pending: "yellow",
  draft: "gray",
  in_progress: "blue",
  approved: "green",
  rejected: "red",
  delivered: "green",
  partial: "sky",
  completed: "green",
  cancelled: "red",
  aktif: "green",
  nonaktif: "gray",
  active: "green",
  inactive: "gray",
  full: "purple",
  maintenance: "yellow",
  hadir: "green",
  terlambat: "yellow",
  izin: "blue",
  cuti: "purple",
  sakit: "red",
  alpha: "gray",
}

export function statusColor(
  status: string | null | undefined
): ColoredBadgeProps["color"] {
  if (!status) return "gray"
  return STATUS_COLORS[status.toLowerCase()] ?? "blue"
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "-"
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return "-"
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatCurrency(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined) return "-"
  const parsed =
    typeof value === "number"
      ? value
      : parseFloat(String(value).replace(/,/g, "."))
  if (!Number.isFinite(parsed)) return "-"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(parsed)
}

export function formatNumber(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined) return "-"
  const parsed =
    typeof value === "number"
      ? value
      : parseFloat(String(value).replace(/,/g, "."))
  if (!Number.isFinite(parsed)) return "-"
  return new Intl.NumberFormat("id-ID").format(parsed)
}
