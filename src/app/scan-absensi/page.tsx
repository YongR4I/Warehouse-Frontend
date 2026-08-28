"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import {
  BiCamera,
  BiCameraOff,
  BiCheckCircle,
  BiErrorCircle,
  BiMap,
  BiQr,
  BiRefresh,
  BiWifiOff,
} from "react-icons/bi"
import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/forms"
import api, { getErrorMessage } from "@/lib/api"
import { useOptions } from "@/hooks/use-options"
import { useCameraScanner, useWedgeScanner } from "@/hooks/use-scan-input"
import {
  enqueueScan,
  flushScanQueue,
  loadQueue,
  nowForQueue,
} from "@/lib/scan-queue"
import type { AbsensiScanResult, Gudang } from "@/types"

interface ScanConfig {
  gudangId: number
  gudangNama: string
}

const CONFIG_KEY = "scan-absensi-config"
const RESET_MS = 5000

type Display =
  | { kind: "idle" }
  | { kind: "processing" }
  | {
      kind: "result"
      tipe: "masuk" | "pulang" | "duplicate"
      nama: string
      sub: string
      waktu: string
      terlambat?: boolean
    }
  | { kind: "queued"; nama?: string }
  | { kind: "error"; message: string }

function loadConfig(): ScanConfig | null {
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY)
    return raw ? (JSON.parse(raw) as ScanConfig) : null
  } catch {
    return null
  }
}

/* ── Corner bracket ── */
function Corner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const cls = {
    tl: "top-0 left-0 border-t-2 border-l-2",
    tr: "top-0 right-0 border-t-2 border-r-2",
    bl: "bottom-0 left-0 border-b-2 border-l-2",
    br: "bottom-0 right-0 border-b-2 border-r-2",
  }
  return (
    <div
      className={`absolute h-6 w-6 border-white sm:h-7 sm:w-7 ${cls[position]}`}
    />
  )
}

/* ── Scanning line ── */
const scanLineStyle: React.CSSProperties = {
  position: "absolute",
  left: "12px",
  right: "12px",
  height: "2px",
  background:
    "linear-gradient(90deg, transparent 0%, rgba(74,222,128,0.08) 15%, rgba(74,222,128,0.85) 50%, rgba(74,222,128,0.08) 85%, transparent 100%)",
  boxShadow: "0 0 14px 2px rgba(74,222,128,0.35)",
  animation: "scanMove 2.2s ease-in-out infinite",
}

const scanKeyframes = `
@keyframes scanMove {
  0%, 100% { top: 10px; }
  50% { top: calc(100% - 10px); }
}
`

/* ── Result card ── */
function ResultCard({
  display,
}: {
  display: Extract<Display, { kind: "result" }>
}) {
  const iconColor =
    display.tipe === "duplicate"
      ? "text-zinc-300"
      : display.tipe === "pulang"
        ? "text-blue-300"
        : "text-emerald-300"

  const bgColor =
    display.tipe === "duplicate"
      ? "bg-zinc-500/15"
      : display.tipe === "pulang"
        ? "bg-blue-500/15"
        : "bg-emerald-500/15"

  const statusText =
    display.tipe === "duplicate"
      ? "Sudah Absen Hari Ini"
      : display.tipe === "pulang"
        ? "Absen Pulang Tercatat"
        : display.terlambat
          ? "Masuk Tercatat (Terlambat)"
          : "Absen Masuk Tercatat"

  const statusColor =
    display.tipe === "duplicate"
      ? "text-zinc-200"
      : display.tipe === "pulang"
        ? "text-blue-200"
        : "text-emerald-200"

  return (
    <div className="flex animate-in flex-col items-center gap-4 duration-300 fade-in zoom-in">
      <div className={`rounded-full ${bgColor} p-4`}>
        <BiCheckCircle className={`size-14 ${iconColor}`} />
      </div>
      <div className="space-y-1.5 text-center">
        <p
          className={`text-2xl font-bold tracking-tight sm:text-3xl ${statusColor}`}
        >
          {statusText}
        </p>
        <p className="text-xl font-semibold text-white">{display.nama}</p>
        {display.sub && <p className="text-sm text-white/50">{display.sub}</p>}
      </div>
      <p className="font-mono text-4xl font-bold tracking-tight text-white tabular-nums sm:text-5xl">
        {display.waktu}
      </p>
      {display.tipe === "duplicate" && (
        <p className="text-sm text-white/40">Presensi hari ini sudah lengkap</p>
      )}
    </div>
  )
}

/* ── Status card ── */
function StatusCard({
  kind,
  message,
}: {
  kind: "processing" | "queued" | "error"
  message?: string
}) {
  if (kind === "processing") {
    return (
      <div className="flex animate-in flex-col items-center gap-4 duration-200 fade-in">
        <div className="size-12 animate-spin rounded-full border-4 border-white/15 border-t-white" />
        <p className="text-xl font-semibold text-white/80">Memproses...</p>
      </div>
    )
  }

  if (kind === "queued") {
    return (
      <div className="flex animate-in flex-col items-center gap-3 duration-300 fade-in zoom-in">
        <div className="rounded-full bg-amber-500/15 p-4">
          <BiWifiOff className="size-10 text-amber-300" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-2xl font-bold tracking-tight text-amber-200">
            Tersimpan Offline
          </p>
          <p className="max-w-xs text-sm text-white/60">
            Scan diantrikan & akan dikirim otomatis saat koneksi kembali.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-in flex-col items-center gap-3 duration-300 fade-in zoom-in">
      <div className="rounded-full bg-red-500/15 p-4">
        <BiErrorCircle className="size-10 text-red-300" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-2xl font-bold tracking-tight text-red-200">
          Gagal Diproses
        </p>
        <p className="max-w-xs text-sm text-white/60">{message}</p>
        <p className="text-xs text-white/30">
          Hubungi admin bila kartu rusak atau hilang.
        </p>
      </div>
    </div>
  )
}

export default function ScanAbsensiPage() {
  const [config, setConfig] = useState<ScanConfig | null>(null)
  const [setupReady, setSetupReady] = useState(false)
  const [selectedGudang, setSelectedGudang] = useState("")
  const [display, setDisplay] = useState<Display>({ kind: "idle" })
  const [clock, setClock] = useState("")
  const [pending, setPending] = useState(0)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [online, setOnline] = useState(true)

  const gudangOptions = useOptions<Gudang>("gudang", "/gudang", setupReady)

  useEffect(() => {
    const t = setTimeout(() => {
      setConfig(loadConfig())
      setPending(loadQueue().length)
      setOnline(navigator.onLine)
      setSetupReady(true)
    }, 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      )
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (display.kind === "idle" || display.kind === "processing") return
    const t = setTimeout(() => setDisplay({ kind: "idle" }), RESET_MS)
    return () => clearTimeout(t)
  }, [display])

  const refreshPending = useCallback(() => {
    setPending(loadQueue().length)
  }, [])

  const handleDetect = useCallback(
    async (rawPayload: string) => {
      setDisplay((d) => (d.kind === "processing" ? d : { kind: "processing" }))

      const qrPayload = rawPayload.trim()
      if (!qrPayload) {
        setDisplay({ kind: "error", message: "QR kosong atau tidak terbaca" })
        return
      }

      const activeConfig = loadConfig()
      if (!activeConfig) {
        setDisplay({ kind: "error", message: "Perangkat belum diatur." })
        return
      }

      const waktuScan = nowForQueue()
      const queueIt = () => {
        enqueueScan(qrPayload, waktuScan)
        refreshPending()
        setDisplay({ kind: "queued" })
      }

      if (navigator.onLine === false) {
        queueIt()
        return
      }

      try {
        const res = await api.post<{ data: AbsensiScanResult }>(
          "/absensi/scan",
          {
            qr_payload: qrPayload,
            sumber: "qr",
            gudang_id: activeConfig.gudangId,
          }
        )
        const r = res.data.data
        const waktu =
          r.tipe === "pulang"
            ? (r.absensi?.jam_pulang ?? "-")
            : (r.absensi?.jam_masuk ?? "-")
        const sub =
          [r.identitas.kode, r.identitas.jabatan ?? r.user?.no_pegawai]
            .filter(Boolean)
            .join(" · ") || ""
        setDisplay({
          kind: "result",
          tipe: r.tipe,
          nama: r.identitas.nama ?? "-",
          sub,
          waktu,
          terlambat: r.absensi?.status === "terlambat",
        })
      } catch (err) {
        if (axios.isAxiosError(err) && !err.response) {
          queueIt()
          return
        }
        setDisplay({ kind: "error", message: getErrorMessage(err) })
      }
    },
    [refreshPending]
  )

  const scannerActive = !!config && display.kind !== "processing" && setupReady
  useWedgeScanner(handleDetect, scannerActive)

  const { videoRef, cameraOn, startCamera, stopCamera } = useCameraScanner(
    (payload) => void handleDetect(payload)
  )

  useEffect(() => {
    if (config && setupReady && !cameraOn) void startCamera()
  }, [config, setupReady, cameraOn, startCamera])

  useEffect(() => {
    if (config && setupReady && display.kind === "idle" && !cameraOn) {
      void startCamera()
    }
  }, [config, setupReady, display.kind, cameraOn, startCamera])

  const handleCameraToggle = useCallback(async () => {
    try {
      if (cameraOn) stopCamera()
      else await startCamera()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }, [cameraOn, startCamera, stopCamera])

  const flushAndCount = useCallback(async () => {
    const summary = await flushScanQueue()
    refreshPending()
    if (summary && summary.sent > 0) {
      setLastSync(
        `${summary.sent} scan tertunda terkirim · sisa ${summary.remaining}`
      )
    }
  }, [refreshPending])

  useEffect(() => {
    const goOnline = () => {
      setOnline(true)
      void flushAndCount()
    }
    const goOffline = () => setOnline(false)
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    const t = setInterval(() => void flushAndCount(), 30_000)
    const first = setTimeout(() => void flushAndCount(), 0)
    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
      clearInterval(t)
      clearTimeout(first)
    }
  }, [flushAndCount])

  const pinGudang = useCallback(() => {
    const gudang = gudangOptions.items.find(
      (g) => String(g.id) === selectedGudang
    )
    if (!gudang) {
      toast.error("Pilih gudang terlebih dahulu")
      return
    }
    const next = { gudangId: gudang.id, gudangNama: gudang.nama }
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify(next))
    setConfig(next)
    setDisplay({ kind: "idle" })
    toast.success(`Perangkat dipasang untuk ${gudang.nama}`)
  }, [gudangOptions.items, selectedGudang])

  const unpinGudang = useCallback(() => {
    stopCamera()
    window.localStorage.removeItem(CONFIG_KEY)
    setConfig(null)
  }, [stopCamera])

  const gudangOptionsList = useMemo(
    () =>
      gudangOptions.items.map((g) => ({
        value: String(g.id),
        label: g.nama,
      })),
    [gudangOptions.items]
  )

  const showScanGuide = display.kind === "idle" && scannerActive

  // ── Responsive frame positioning ──
  const [frame, setFrame] = useState({ size: 280, left: 0, top: 0 })

  useEffect(() => {
    const recalc = () => {
      const size = window.innerWidth >= 640 ? 320 : 280
      const left = Math.round((window.innerWidth - size) / 2)
      const top = Math.round((window.innerHeight - size) / 2 - 60)
      setFrame({ size, left, top })
    }
    recalc()
    window.addEventListener("resize", recalc)
    return () => window.removeEventListener("resize", recalc)
  }, [])

  // ---------- Setup ----------
  if (setupReady && !config) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted p-6">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-lg">
          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-foreground">
            <BiMap className="size-6 text-background" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Pasang Perangkat Scan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih gudang yang dilayani perangkat ini. Pengaturan cukup sekali.
          </p>
          <div className="mt-6 space-y-3">
            <FormSelect
              label="Gudang *"
              placeholder={
                gudangOptions.isLoading ? "Memuat gudang..." : "Pilih gudang..."
              }
              value={selectedGudang}
              onValueChange={(val) => setSelectedGudang(val ?? "")}
              options={gudangOptionsList}
            />
          </div>
          <Button
            className="mt-6 w-full rounded-xl bg-foreground py-6 text-background hover:bg-foreground/90"
            onClick={pinGudang}
            disabled={gudangOptions.isLoading || !selectedGudang}
          >
            Gunakan di Pintu Ini
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Pastikan perangkat sudah login sebagai admin WMS di browser ini.
          </p>
        </div>
      </main>
    )
  }

  // ---------- Scan screen ----------
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-foreground">
      <style dangerouslySetInnerHTML={{ __html: scanKeyframes }} />

      {/* ── Camera: full-screen background ── */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        playsInline
      />

      {/* ── Scan frame + dark overlay via box-shadow cutout ── */}
      {showScanGuide && (
        <div
          className="absolute z-10 rounded-2xl"
          style={{
            width: frame.size,
            height: frame.size,
            left: frame.left,
            top: frame.top,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.7)",
          }}
        >
          <Corner position="tl" />
          <Corner position="tr" />
          <Corner position="bl" />
          <Corner position="br" />
          <div style={scanLineStyle} />
        </div>
      )}

      {/* Dim overlay saat processing/result/error/queued */}
      {!showScanGuide && (
        <div className="absolute inset-0 z-10 bg-foreground/60 transition-opacity duration-300" />
      )}

      {/* ── Top bar ── */}
      <div className="absolute top-0 right-0 left-0 z-30 flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2 rounded-full bg-foreground/40 px-4 py-1.5 text-sm font-medium backdrop-blur-md">
          <BiMap className="size-4" />
          {config?.gudangNama ?? "—"}
        </div>
        <div className="flex items-center gap-2">
          {!online && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-500/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              <BiWifiOff className="size-3.5" />
              Offline
            </span>
          )}
          {pending > 0 && (
            <button
              onClick={() => void flushAndCount()}
              className="cursor-pointer rounded-full bg-amber-500/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-amber-500"
            >
              {pending} tertunda
            </button>
          )}
          <button
            onClick={unpinGudang}
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-foreground/40 px-3 py-1.5 text-xs font-medium text-background/70 backdrop-blur-md transition-colors hover:bg-foreground/60"
          >
            <BiRefresh className="size-3.5" />
            Ganti
          </button>
        </div>
      </div>

      {/* ── Clock + hint below scan frame ── */}
      {showScanGuide && (
        <div
          className="absolute right-0 left-0 z-30 flex flex-col items-center gap-3"
          style={{ top: frame.top + frame.size + 16 }}
        >
          <div className="flex items-center gap-2 rounded-full bg-foreground/50 px-4 py-2 backdrop-blur-md">
            <BiQr className="size-4 text-white/60" />
            <span className="text-sm font-medium text-white/60">
              Arahkan QR Code ke dalam frame
            </span>
          </div>
          <p className="font-mono text-5xl font-bold tracking-tight text-white tabular-nums drop-shadow-lg sm:text-6xl">
            {clock}
          </p>
        </div>
      )}

      {/* ── Bottom bar ── */}
      <div className="absolute right-0 bottom-0 left-0 z-30 flex items-center justify-between px-5 pt-10 pb-5">
        <div className="min-h-[1.25rem]">
          {lastSync && (
            <p className="text-xs text-emerald-300/80">{lastSync}</p>
          )}
        </div>
        <button
          onClick={() => void handleCameraToggle()}
          className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-md transition-colors ${
            cameraOn
              ? "bg-foreground/40 text-background hover:bg-foreground/60"
              : "bg-foreground/30 text-background/60 hover:bg-foreground/50"
          }`}
        >
          {cameraOn ? (
            <BiCameraOff className="size-4" />
          ) : (
            <BiCamera className="size-4" />
          )}
          {cameraOn ? "Matikan" : "Kamera"}
        </button>
      </div>

      {/* ── Result / status centered overlay ── */}
      {(display.kind === "result" ||
        display.kind === "processing" ||
        display.kind === "queued" ||
        display.kind === "error") && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 px-6">
            {display.kind === "result" && <ResultCard display={display} />}
            {display.kind === "processing" && <StatusCard kind="processing" />}
            {display.kind === "queued" && <StatusCard kind="queued" />}
            {display.kind === "error" && (
              <StatusCard kind="error" message={display.message} />
            )}
          </div>
        </div>
      )}
    </main>
  )
}