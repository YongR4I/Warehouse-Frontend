"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  BiCalendarAlt,
  BiCamera,
  BiCheckCircle,
  BiPaperclip,
  BiQr,
  BiRefresh,
  BiSend,
} from "react-icons/bi"
import { Button } from "@/components/ui/button"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { FormSelect, FormDate, FormTextarea } from "@/components/forms"
import api, { getErrorMessage, uploadFile } from "@/lib/api"
import { useCameraScanner, useWedgeScanner } from "@/hooks/use-scan-input"
import { useGyroCamera } from "@/hooks/use-gyro-camera"
import { formatDate } from "@/lib/status"
import type { IzinJenis, IzinRequest } from "@/types"

// Portal Izin Petugas v2 — PUBLIK, TANPA LOGIN (kontrak portal-izin,
// lihat Obsidian TODO-PORTAL-IZIN). Identitas via SCAN kartu QR petugas;
// qr_payload dikirim ulang pada tiap call (stateless verify di BE).

const JENIS_OPTIONS: { value: IzinJenis; label: string }[] = [
  { value: "cuti", label: "Cuti" },
  { value: "izin", label: "Izin" },
  { value: "sakit", label: "Sakit" },
]

const STATUS_BADGE: Record<
  string,
  { color: "yellow" | "green" | "red" | "gray"; label: string }
> = {
  menunggu: { color: "yellow", label: "Menunggu" },
  disetujui: { color: "green", label: "Disetujui" },
  ditolak: { color: "red", label: "Ditolak" },
  dibatalkan: { color: "gray", label: "Dibatalkan" },
}

interface PortalSesi {
  qr: string
  petugas: {
    id: number
    nama: string
    kode?: string | null
    jabatan?: string | null
  }
}

function toDateParam(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/* ── QR Status Badge for portal ── */
function PortalQrBadge({ status }: { status: "scanning" | "detected" }) {
  const isScanning = status === "scanning"
  return (
    <div
      className={`absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide shadow-md backdrop-blur-md ${
        isScanning
          ? "border-amber-300/40 bg-amber-500/95 text-white"
          : "border-emerald-300/40 bg-emerald-500 text-white"
      }`}
    >
      {isScanning ? (
        <span className="size-1.5 animate-pulse rounded-full bg-white" />
      ) : (
        <BiCheckCircle className="size-3" />
      )}
      {isScanning ? "QR Scanning..." : "QR Detected"}
    </div>
  )
}

export default function PortalIzinPage() {
  const queryClient = useQueryClient()

  const [sesi, setSesi] = useState<PortalSesi | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [justDetected, setJustDetected] = useState(false)

  const [jenis, setJenis] = useState<IzinJenis>("cuti")
  const [tanggalMulai, setTanggalMulai] = useState(toDateParam(new Date()))
  const [tanggalSelesai, setTanggalSelesai] = useState(toDateParam(new Date()))
  const [alasan, setAlasan] = useState("")
  const [bukti, setBukti] = useState<File | null>(null)

  const handlePayload = async (rawPayload: string) => {
    const qrPayload = rawPayload.trim()
    if (!qrPayload) return
    setJustDetected(true)
    setTimeout(() => setJustDetected(false), 1800)
    try {
      const res = await api.post<{
        data: { petugas: PortalSesi["petugas"] }
      }>("/portal/auth", { qr_payload: qrPayload })
      const petugas = res.data.data?.petugas
      if (!petugas) throw new Error("Kartu tidak dikenali")
      setSesi({ qr: qrPayload, petugas })
      toast.success(`Selamat datang, ${petugas.nama}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  useWedgeScanner((p) => void handlePayload(p), true)

  const {
    videoRef,
    cameraOn: camActive,
    startCamera,
    stopCamera,
  } = useCameraScanner((p) => void handlePayload(p))

  // Enable gyro tracking when camera is active
  useGyroCamera({ videoRef, enabled: camActive })

  const toggleCamera = async () => {
    try {
      if (camActive) stopCamera()
      else await startCamera()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  // Kamera otomatis berhenti saat sesi terbentuk
  useEffect(() => {
    if (sesi && camActive) stopCamera()
  }, [sesi, camActive, stopCamera])

  const qrBadgeStatus: "scanning" | "detected" | null = justDetected
    ? "detected"
    : camActive && !sesi
      ? "scanning"
      : null

  const invalidateRiwayat = () =>
    void queryClient.invalidateQueries({ queryKey: ["portal-izin"] })

  const riwayatQuery = useQuery({
    queryKey: ["portal-izin", sesi?.qr],
    queryFn: async () => {
      const res = await api.post("/portal/izin/riwayat", {
        qr_payload: sesi!.qr,
      })
      return (res.data?.data ?? []) as IzinRequest[]
    },
    enabled: !!sesi,
    retry: false,
  })

  const rows = useMemo(() => riwayatQuery.data ?? [], [riwayatQuery.data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sesi) return
    if (tanggalSelesai < tanggalMulai) {
      toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai")
      return
    }
    if (tanggalMulai < toDateParam(new Date())) {
      toast.error("Pengajuan tidak boleh mundur")
      return
    }
    if (!alasan.trim()) {
      toast.error("Alasan wajib diisi")
      return
    }
    setSubmitting(true)
    try {
      let buktiUrl: string | undefined
      if (bukti) {
        const uploaded = await uploadFile(bukti)
        buktiUrl = uploaded.url
      }
      await api.post("/portal/izin", {
        qr_payload: sesi.qr,
        jenis,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        alasan: alasan.trim(),
        ...(buktiUrl && { bukti: buktiUrl }),
      })
      toast.success("Pengajuan terkirim — menunggu persetujuan admin")
      setAlasan("")
      setBukti(null)
      invalidateRiwayat()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (row: IzinRequest) => {
    if (!sesi) return
    try {
      await api.post(`/portal/izin/${row.id}/cancel`, {
        qr_payload: sesi.qr,
      })
      toast.success("Pengajuan dibatalkan")
      invalidateRiwayat()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <main className="min-h-screen bg-muted px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-6 py-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-foreground">
              <BiCalendarAlt className="size-5 text-background" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-foreground">
                Portal Izin Petugas
              </p>
              <p className="text-xs text-muted-foreground">
                Ajukan cuti, izin, atau sakit — cukup tempelkan kartu QR Anda
              </p>
            </div>
          </div>
          {!sesi && (
            <Button
              variant="outline"
              onClick={() => void toggleCamera()}
              className="rounded-xl"
            >
              <BiCamera className="mr-2 size-4" />
              {camActive ? "Stop Kamera" : "Gunakan Kamera"}
            </Button>
          )}
          {sesi && (
            <button
              onClick={() => setSesi(null)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <BiRefresh className="size-4" />
              Ganti Kartu
            </button>
          )}
        </div>

        {/* Layar scan */}
        {!sesi && (
          <div className="mt-5 flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-12 shadow-xs">
            <div className="rounded-[1.75rem] border border-border/40 bg-muted/30 p-8">
              <BiQr className="size-16 text-foreground/70" />
            </div>
            <p className="mt-6 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Tempelkan Kartu QR Anda
            </p>
            <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
              Scan kartu pada pemindai yang tersedia, atau aktifkan kamera di
              pojok kanan atas.
            </p>
            {camActive && (
              <div className="relative mt-6">
                <video
                  ref={videoRef}
                  className="h-48 w-72 rounded-2xl border border-border/40 object-cover shadow-sm"
                  muted
                  playsInline
                  style={{ transform: "scaleX(1)" }}
                />
                {qrBadgeStatus && <PortalQrBadge status={qrBadgeStatus} />}
                {/* subtle corner accents when scanning */}
                {qrBadgeStatus === "scanning" && (
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-amber-400/20" />
                )}
                {qrBadgeStatus === "detected" && (
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-emerald-400/40" />
                )}
              </div>
            )}
            {camActive && qrBadgeStatus === "scanning" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Arahkan QR ke tengah frame • kamera mengikuti gerakan HP
              </p>
            )}
          </div>
        )}

        {/* Sesi aktif */}
        {sesi && (
          <>
            {/* Identitas */}
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <BiCheckCircle className="size-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-emerald-900">
                  {sesi.petugas.nama}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 dark:text-emerald-400/80">
                  {[sesi.petugas.kode, sesi.petugas.jabatan]
                    .filter(Boolean)
                    .join(" · ") || "Terverifikasi via kartu QR"}
                </p>
              </div>
            </div>

            {/* Form pengajuan */}
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="mt-5 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xs"
            >
              <p className="text-sm font-semibold text-foreground">
                Ajukan Baru
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormSelect
                  label="Jenis *"
                  placeholder="Pilih jenis..."
                  value={jenis}
                  onValueChange={(val) =>
                    setJenis((val ?? "cuti") as IzinJenis)
                  }
                  options={JENIS_OPTIONS}
                />
                <FormDate
                  label="Tanggal Mulai *"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                />
                <FormDate
                  label="Tanggal Selesai *"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                />
              </div>
              <FormTextarea
                label="Alasan *"
                placeholder="Tuliskan alasan pengajuan..."
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                rows={2}
              />
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
                <div className="w-full sm:max-w-xs">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Bukti (opsional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setBukti(e.target.files?.[0] ?? null)}
                    className="w-full cursor-pointer rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-foreground file:px-3 file:py-1 file:text-xs file:font-medium file:text-background"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-foreground px-6 py-2.5 text-background hover:bg-foreground/90"
                >
                  <BiSend className="mr-2 size-4" />
                  {submitting ? "Mengirim..." : "Kirim Pengajuan"}
                </Button>
              </div>
            </form>

            {/* Riwayat */}
            <div className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-xs">
              <p className="mb-4 text-sm font-semibold text-foreground">
                Riwayat Pengajuan Anda
              </p>
              {riwayatQuery.isPending && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Memuat...
                </p>
              )}
              {!riwayatQuery.isPending && rows.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Belum ada pengajuan.
                </p>
              )}
              <div className="space-y-3">
                {rows.map((row) => {
                  const badge =
                    STATUS_BADGE[row.status] ?? STATUS_BADGE["menunggu"]
                  return (
                    <div
                      key={row.id}
                      className="flex items-start justify-between gap-4 rounded-xl border border-border/50 bg-muted/20 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <ColoredBadge color={badge.color}>
                            {badge.label}
                          </ColoredBadge>
                          <span className="text-sm font-semibold text-foreground">
                            {row.jenis === "sakit"
                              ? "Sakit"
                              : row.jenis === "cuti"
                                ? "Cuti"
                                : "Izin"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(row.tanggal_mulai)}
                            {row.tanggal_selesai !== row.tanggal_mulai &&
                              ` — ${formatDate(row.tanggal_selesai)}`}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {row.status === "ditolak" && row.catatan_penolakan
                            ? `Ditolak: ${row.catatan_penolakan}`
                            : row.alasan}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {row.bukti && (
                          <a
                            href={row.bukti}
                            target="_blank"
                            rel="noreferrer"
                            title="Lihat bukti"
                            className="text-blue-600 transition-colors hover:text-blue-700"
                          >
                            <BiPaperclip className="size-4" />
                          </a>
                        )}
                        {row.status === "menunggu" && (
                          <button
                            onClick={() => void handleCancel(row)}
                            className="cursor-pointer rounded-lg border border-border/60 px-2.5 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            Batalkan
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
