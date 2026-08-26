"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import {
  BiCamera,
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

// Halaman perangkat scan tetap pintu gudang (kontrak v4,
// lihat Obsidian TODO-ABSENSI-SCAN).
// Fullscreen TANPA shell dashboard: route ini berada di luar grup (dashboard).

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

  // Hydrate dari localStorage setelah mount (aman SSR, deferred agar
  // tidak memicu cascading render sinkron dalam effect)
  useEffect(() => {
    const t = setTimeout(() => {
      setConfig(loadConfig())
      setPending(loadQueue().length)
      setOnline(navigator.onLine)
      setSetupReady(true)
    }, 0)
    return () => clearTimeout(t)
  }, [])

  // Jam besar utk layar idle
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

  // Auto-reset layar hasil/error kembali ke READY
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
      setDisplay((d) => {
        if (d.kind === "processing") return d
        return { kind: "processing" }
      })

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
        enqueueScan(qrPayload, waktuScan, activeConfig.gudangId)
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
          [r.identitas.kode, r.identitas.jabatan ?? r.user?.kode_petugas]
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
        setDisplay({
          kind: "error",
          message: getErrorMessage(err),
        })
      }
    },
    [refreshPending]
  )

  // USB scanner keyboard-wedge aktif saat layar siap memindai
  const scannerActive = !!config && display.kind !== "processing" && setupReady
  useWedgeScanner(handleDetect, scannerActive)

  const { videoRef, cameraOn, startCamera, stopCamera } = useCameraScanner(
    (payload) => void handleDetect(payload)
  )

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

  // Flush antrian offline saat online kembali / periodik / saat mount
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
    window.localStorage.removeItem(CONFIG_KEY)
    setConfig(null)
  }, [])

  const gudangOptionsList = useMemo(
    () =>
      gudangOptions.items.map((g) => ({
        value: String(g.id),
        label: g.nama,
      })),
    [gudangOptions.items]
  )

  // ---------- Layar setup (admin memasang perangkat) ----------
  if (setupReady && !config) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-lg">
          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-foreground">
            <BiMap className="size-6 text-background" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Pasang Perangkat Scan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih gudang yang dilayani perangkat ini. Pengaturan cukup sekali —
            setelah itu petugas cukup menempelkan kartu QR.
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
            className="mt-6 w-full rounded-xl bg-black py-6 text-white hover:bg-black/90"
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

  // ---------- Layar scan utama ----------
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-6 py-10 text-white">
      {/* Bar atas */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium">
          <BiMap className="size-4" />
          {config?.gudangNama ?? "—"}
        </div>
        <div className="flex items-center gap-3">
          {!online && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300">
              <BiWifiOff className="size-4" />
              Offline — scan diantrikan
            </span>
          )}
          {pending > 0 && (
            <button
              onClick={() => void flushAndCount()}
              className="cursor-pointer rounded-full bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/30"
              title="Klik untuk sinkron sekarang"
            >
              {pending} scan tertunda
            </button>
          )}
          <button
            onClick={unpinGudang}
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/20"
          >
            <BiRefresh className="size-3.5" />
            Ganti Gudang
          </button>
        </div>
      </div>

      {/* Konten tengah */}
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        {display.kind === "idle" && (
          <>
            <div className="rounded-[2rem] border border-white/15 bg-white/5 p-10">
              <BiQr className="size-28" />
            </div>
            <p className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl">
              Tap Kartu Anda
            </p>
            <p className="mt-3 text-lg text-white/60">
              Tempelkan kartu QR pada pemindai
            </p>
            <p className="mt-10 font-mono text-7xl font-bold tracking-tight tabular-nums sm:text-8xl">
              {clock}
            </p>
          </>
        )}

        {display.kind === "processing" && (
          <>
            <div className="size-24 animate-spin rounded-full border-8 border-white/15 border-t-white" />
            <p className="mt-10 text-4xl font-bold tracking-tight">
              Memproses...
            </p>
          </>
        )}

        {display.kind === "result" && (
          <>
            <BiCheckCircle
              className={`size-32 ${
                display.tipe === "duplicate"
                  ? "text-zinc-400"
                  : display.tipe === "pulang"
                    ? "text-blue-400"
                    : "text-emerald-400"
              }`}
            />
            {display.tipe === "duplicate" ? (
              <p className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                Sudah Absen Hari Ini
              </p>
            ) : display.tipe === "pulang" ? (
              <p className="mt-6 text-4xl font-bold tracking-tight text-blue-300 sm:text-5xl">
                Absen Pulang Tercatat
              </p>
            ) : (
              <p className="mt-6 text-4xl font-bold tracking-tight text-emerald-300 sm:text-5xl">
                {display.terlambat
                  ? "Masuk Tercatat (Terlambat)"
                  : "Absen Masuk Tercatat"}
              </p>
            )}
            <p className="mt-8 text-3xl font-semibold">{display.nama}</p>
            {display.sub && (
              <p className="mt-1 text-base text-white/50">{display.sub}</p>
            )}
            <p className="mt-4 font-mono text-6xl font-bold tracking-tight tabular-nums">
              {display.waktu}
            </p>
            {display.tipe === "duplicate" && (
              <p className="mt-4 text-lg text-white/60">
                Presensi hari ini sudah lengkap. Scan diabaikan.
              </p>
            )}
          </>
        )}

        {display.kind === "queued" && (
          <>
            <div className="rounded-full bg-amber-400/15 p-8">
              <BiWifiOff className="size-24 text-amber-300" />
            </div>
            <p className="mt-8 text-4xl font-bold tracking-tight text-amber-300 sm:text-5xl">
              Tersimpan Offline
            </p>
            <p className="mt-4 max-w-md text-lg text-white/70">
              Koneksi terputus. Scan Anda diantrikan dan akan dikirim otomatis
              saat koneksi kembali.
            </p>
          </>
        )}

        {display.kind === "error" && (
          <>
            <BiErrorCircle className="size-32 text-red-400" />
            <p className="mt-8 text-4xl font-bold tracking-tight text-red-300">
              Gagal Diproses
            </p>
            <p className="mt-4 max-w-md text-lg text-white/70">
              {display.message}
            </p>
            <p className="mt-6 text-sm text-white/40">
              Hubungi admin bila kartu rusak atau hilang.
            </p>
          </>
        )}
      </div>

      {/* Bar bawah */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-6 pb-6">
        {lastSync && <p className="text-xs text-emerald-300/80">{lastSync}</p>}
        <Button
          variant="outline"
          onClick={() => void handleCameraToggle()}
          className="rounded-xl border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10"
        >
          <BiCamera className="mr-2 size-4" />
          {cameraOn ? "Stop Kamera" : "Gunakan Kamera"}
        </Button>
        {cameraOn && (
          <video
            ref={videoRef}
            className="h-48 w-72 rounded-2xl border border-white/20 object-cover"
            muted
            playsInline
          />
        )}
      </div>
    </main>
  )
}
