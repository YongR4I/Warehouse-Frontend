import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = "disetujui" | "menunggu_approval" | "ditolak" | "draft"

export interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { label: string; variant: "success" | "warning" | "destructive" | "neutral" }> = {
  disetujui: { label: "Disetujui", variant: "success" },
  menunggu_approval: { label: "Menunggu Approval", variant: "warning" },
  ditolak: { label: "Ditolak", variant: "destructive" },
  draft: { label: "Draft", variant: "neutral" },
}

const statusColors: Record<Status, string> = {
  disetujui: "",
  menunggu_approval: "!border-[#FFA309]/25 !bg-[#FFA309]/10 !text-[#FFA309]",
  ditolak: "",
  draft: "",
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "whitespace-nowrap font-sans",
        status === "menunggu_approval" && statusColors.menunggu_approval,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}

export { StatusBadge }
