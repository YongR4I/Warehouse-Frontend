"use client"

import { BiCalendar, BiTimeFive, BiUserCheck } from "react-icons/bi"
import { FormDrawer } from "@/components/forms"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { formatDate, statusColor, statusLabel } from "@/lib/status"
import type { Absensi } from "@/types"

interface PresensiDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: Absensi | null
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

export function PresensiDetailDrawer({
  open,
  onOpenChange,
  data,
}: PresensiDetailDrawerProps) {
  if (!data) return null

  const nama = data.nama ?? data.user?.name ?? "-"
  const kode = data.petugas?.kode ?? data.user?.no_pegawai ?? "-"
  const jabatan =
    data.petugas?.jabatan ??
    (data.user?.roles?.map((r) => r.name).join(", ") || "-")
  const gudang = data.gudang?.nama ?? "-"
  const shiftLabel = data.shift?.nama
    ? `${data.shift.nama} (${data.shift.jam_masuk} – ${data.shift.jam_pulang})`
    : "-"
  const isManual = data.sumber === "manual"
  const isDiLuarJadwal =
    !!data.di_luar_jadwal && String(data.di_luar_jadwal) !== "0"

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Presensi"
      description={`Presensi ${nama} • ${formatDate(data.tanggal)}`}
      icon={BiUserCheck}
    >
      <FormDrawer.Body className="space-y-6">
        {/* Header identity card */}
        <div className="rounded-xl border border-border/60 bg-card px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">{nama}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {kode} · {jabatan} · {gudang}
              </div>
            </div>
            <ColoredBadge color={statusColor(data.status)}>
              {statusLabel(data.status)}
            </ColoredBadge>
          </div>
        </div>

        {/* Grid metadata */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <DetailItem label="Tanggal">
            <span className="inline-flex items-center gap-1.5">
              <BiCalendar className="size-3.5 text-muted-foreground" />
              {formatDate(data.tanggal)}
            </span>
          </DetailItem>
          <DetailItem label="Shift">
            <ColoredBadge color="gray">{shiftLabel}</ColoredBadge>
          </DetailItem>
          <DetailItem label="Jam Masuk">
            <span className="inline-flex items-center gap-1.5">
              <BiTimeFive className="size-3.5 text-muted-foreground" />
              {data.jam_masuk ?? "-"}
            </span>
          </DetailItem>
          <DetailItem label="Jam Pulang">
            <span className="inline-flex items-center gap-1.5">
              <BiTimeFive className="size-3.5 text-muted-foreground" />
              {data.jam_pulang ?? "-"}
            </span>
          </DetailItem>
          <DetailItem label="Sumber">
            <span className="inline-flex items-center gap-2">
              <ColoredBadge color={isManual ? "gray" : "blue"}>
                {isManual ? "Manual" : "Scan QR"}
              </ColoredBadge>
              {isDiLuarJadwal && (
                <ColoredBadge color="yellow">Di Luar Jadwal</ColoredBadge>
              )}
            </span>
          </DetailItem>
          <DetailItem label="Gudang">{gudang}</DetailItem>
        </div>

        {data.keterangan && (
          <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
            <div className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              Keterangan
            </div>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {data.keterangan}
            </p>
          </div>
        )}

        {/* Optional audit fields */}
        {(data.lokasi_checkin || data.lokasi_checkout) && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border/60 pt-5">
            <DetailItem label="Lokasi Check-in">
              {data.lokasi_checkin ?? "-"}
            </DetailItem>
            <DetailItem label="Lokasi Check-out">
              {data.lokasi_checkout ?? "-"}
            </DetailItem>
          </div>
        )}
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
