"use client"

import { BiCalendarAlt, BiPaperclip } from "react-icons/bi"
import { FormDrawer } from "@/components/forms"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { formatDate } from "@/lib/status"
import type { IzinRequest } from "@/types"

interface CutiDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: IzinRequest | null
}

const JENIS_LABEL: Record<string, string> = {
  izin: "Izin",
  sakit: "Sakit",
  cuti: "Cuti",
}

const STATUS_STYLE: Record<
  string,
  { color: "green" | "red" | "yellow" | "gray"; label: string }
> = {
  menunggu: { color: "yellow", label: "Menunggu" },
  disetujui: { color: "green", label: "Disetujui" },
  ditolak: { color: "red", label: "Ditolak" },
  dibatalkan: { color: "gray", label: "Dibatalkan" },
}

function DetailItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </div>
      <div className="text-sm font-medium text-foreground">{children}</div>
    </div>
  )
}

export function CutiDetailDrawer({
  open,
  onOpenChange,
  data,
}: CutiDetailDrawerProps) {
  if (!data) return null

  const nama = data.nama ?? data.petugas?.nama ?? data.user?.name ?? "-"
  const kode = data.petugas?.kode ?? data.user?.no_pegawai ?? "-"
  const status = STATUS_STYLE[data.status] ?? STATUS_STYLE.menunggu
  const jenisColor =
    data.jenis === "sakit" ? "red" : data.jenis === "cuti" ? "blue" : "gray"

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Pengajuan"
      description={`${JENIS_LABEL[data.jenis] ?? data.jenis} • ${formatDate(data.tanggal_mulai)} — ${formatDate(data.tanggal_selesai)}`}
      icon={BiCalendarAlt}
    >
      <FormDrawer.Body className="space-y-6">
        {/* Identity */}
        <div className="rounded-xl border border-border/60 bg-card px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">{nama}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{kode}</div>
            </div>
            <ColoredBadge color={status.color}>{status.label}</ColoredBadge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <DetailItem label="Jenis">
            <ColoredBadge color={jenisColor as "red" | "blue" | "gray"}>
              {JENIS_LABEL[data.jenis] ?? data.jenis}
            </ColoredBadge>
          </DetailItem>
          <DetailItem label="Periode">
            <span className="inline-flex items-center gap-1.5">
              <BiCalendarAlt className="size-3.5 text-muted-foreground" />
              {formatDate(data.tanggal_mulai)}
              {data.tanggal_selesai !== data.tanggal_mulai &&
                ` — ${formatDate(data.tanggal_selesai)}`}
              {data.jumlah_hari ? ` (${data.jumlah_hari} hari)` : ""}
            </span>
          </DetailItem>
          <DetailItem label="Tanggal Mulai">
            {formatDate(data.tanggal_mulai)}
          </DetailItem>
          <DetailItem label="Tanggal Selesai">
            {formatDate(data.tanggal_selesai)}
          </DetailItem>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
          <div className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
            Alasan
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {data.alasan ?? "-"}
          </p>
        </div>

        <DetailItem label="Bukti">
          {data.bukti ? (
            <a
              href={data.bukti}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <BiPaperclip className="size-4" />
              Lihat Bukti
            </a>
          ) : (
            "-"
          )}
        </DetailItem>

        {data.status === "ditolak" && data.catatan_penolakan && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
            <div className="text-[11px] font-semibold tracking-widest text-red-600 dark:text-red-400 uppercase">
              Catatan Penolakan
            </div>
            <p className="mt-1 text-sm leading-relaxed text-red-700 dark:text-red-300">
              {data.catatan_penolakan}
            </p>
          </div>
        )}

        {(data.approved_by || data.approved_at) && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border/60 pt-5">
            <DetailItem label="Disetujui Oleh">
              {data.approved_by ? `User #${data.approved_by}` : "-"}
            </DetailItem>
            <DetailItem label="Waktu Persetujuan">
              {data.approved_at ? formatDate(data.approved_at) : "-"}
            </DetailItem>
          </div>
        )}

        <DetailItem label="Dibuat">
          {data.created_at ? formatDate(data.created_at) : "-"}
        </DetailItem>
      </FormDrawer.Body>

      <FormDrawer.Footer>
        <div />
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-xl border border-border bg-card px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Tutup
        </button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
