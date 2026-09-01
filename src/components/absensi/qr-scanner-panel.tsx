"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { BrowserQRCodeReader } from "@zxing/browser"
import { BarcodeFormat, DecodeHintType } from "@zxing/library"
import type { IScannerControls } from "@zxing/browser"
import { toast } from "sonner"
import { BiCamera, BiRefresh, BiUserCheck, BiX } from "react-icons/bi"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ColoredBadge } from "@/components/ui/colored-badge"
import api, { getErrorMessage } from "@/lib/api"
import type { AbsensiScanResult } from "@/types"

// Catatan integrasi (lihat Obsidian API-CONTRACT):
// POST /absensi/scan { qr_payload } LANGSUNG MENCATAT presensi
// (masuk -> pulang), dengan guard duplikat di server. Tidak ada fase preview.

declare global {
  interface Window {
    BarcodeDetector?: {
      new (opts: { formats: string[] }): {
        detect(source: ImageBitmapSource): Promise<{ rawValue: string }[]>
      }
      getSupportedFormats?: () => Promise<string[]>
    }
  }
}

export function QrScannerPanel({ onSuccess }: QrScannerPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const readerRef = useRef<BrowserQRCodeReader | null>(null)
  const rafRef = useRef<number | null>(null)
  const stoppedRef = useRef(true)
  const [scanning, setScanning] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [resultOpen, setResultOpen] = useState(false)
  const [result, setResult] = useState<AbsensiScanResult | null>(null)

  const stopScanner = useCallback(() => {
    stoppedRef.current = true
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (controlsRef.current) {
      try {
        controlsRef.current.stop()
      } catch {}
      controlsRef.current = null
    }
    readerRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause()
      } catch {}
      videoRef.current.srcObject = null
      videoRef.current.removeAttribute("src")
    }
    setScanning(false)
  }, [])

  const handleScanResult = useCallback(
    async (rawText: string) => {
      if (processing) return
      const qrPayload = rawText.trim()
      if (!qrPayload) {
        toast.error("QR Code kosong atau tidak terbaca")
        return
      }

      stopScanner()
      setProcessing(true)

      try {
        const res = await api.post<{ data: AbsensiScanResult }>(
          "/absensi/scan",
          { qr_payload: qrPayload }
        )
        setResult(res.data.data)
        setResultOpen(true)
        onSuccess?.()
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        setProcessing(false)
      }
    },
    [processing, stopScanner, onSuccess]
  )

  const startScanner = useCallback(async () => {
    stoppedRef.current = false
    setScanning(true)

    const startZxing = async () => {
      if (stoppedRef.current || !videoRef.current) return
      try {
        const hints = new Map()
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE])
        hints.set(DecodeHintType.TRY_HARDER, false)
        const reader = new BrowserQRCodeReader(hints, {
          delayBetweenScanAttempts: 30,
          delayBetweenScanSuccess: 200,
          tryPlayVideoTimeout: 3000,
        })
        readerRef.current = reader
        const controls = await reader.decodeFromVideoElement(
          videoRef.current!,
          (result, _err, controls) => {
            if (stoppedRef.current) {
              try {
                controls.stop()
              } catch {}
              return
            }
            if (result) {
              const text = result.getText()
              if (text) {
                try {
                  controls.stop()
                } catch {}
                controlsRef.current = null
                void handleScanResult(text)
              }
            }
          }
        )
        controlsRef.current = controls
      } catch (e) {
        console.warn("[qr-panel] ZXing failed", e)
        toast.error("Tidak dapat mengakses kamera: " + String(e))
        setScanning(false)
      }
    }

    const tryNative = async (): Promise<boolean> => {
      const ctor = window.BarcodeDetector
      if (!ctor) return false
      try {
        if (typeof ctor.getSupportedFormats === "function") {
          const supported = await ctor.getSupportedFormats()
          if (!supported.includes("qr_code")) return false
        }
        const detector = new ctor({ formats: ["qr_code"] })
        let nativeActive = true
        const loop = async () => {
          if (stoppedRef.current || !nativeActive) return
          const video = videoRef.current
          if (!video || video.readyState < 2 || video.videoWidth === 0) {
            rafRef.current = requestAnimationFrame(loop)
            return
          }
          try {
            const codes = await detector.detect(video as unknown as ImageBitmapSource)
            if (codes && codes.length > 0) {
              const raw = (codes[0] as { rawValue: string }).rawValue
              if (raw) {
                nativeActive = false
                if (rafRef.current !== null) {
                  cancelAnimationFrame(rafRef.current)
                  rafRef.current = null
                }
                void handleScanResult(raw)
                return
              }
            }
          } catch (err) {
            console.warn("[qr-panel] BarcodeDetector failed, fallback ZXing", err)
            nativeActive = false
            if (rafRef.current !== null) {
              cancelAnimationFrame(rafRef.current)
              rafRef.current = null
            }
            void startZxing()
            return
          }
          rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)
        return true
      } catch (e) {
        console.warn("[qr-panel] BarcodeDetector init failed", e)
        return false
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          focusMode: { ideal: "continuous" },
          frameRate: { ideal: 30 },
        } as unknown as MediaTrackConstraints,
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute("playsinline", "true")
        videoRef.current.muted = true
        try {
          await videoRef.current.play()
        } catch {
          await new Promise<void>((resolve) => {
            const v = videoRef.current!
            const onCanPlay = () => {
              v.removeEventListener("canplay", onCanPlay)
              v.play()
                .then(() => resolve())
                .catch(() => resolve())
            }
            v.addEventListener("canplay", onCanPlay, { once: true })
            setTimeout(() => resolve(), 800)
          })
        }
      }

      const nativeOk = await tryNative()
      if (!nativeOk) await startZxing()
    } catch (err) {
      toast.error("Tidak dapat mengakses kamera: " + String(err))
      setScanning(false)
    }
  }, [handleScanResult])

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [stopScanner])

  const absensi = result?.absensi ?? null
  const terlambat = absensi?.status === "terlambat"
  const waktuTercatat =
    result?.tipe === "pulang"
      ? (absensi?.jam_pulang ?? "-")
      : (absensi?.jam_masuk ?? "-")

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Scanner Viewport */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/60 bg-foreground">
        <video
          ref={videoRef}
          className="h-72 w-full object-cover"
          muted
          playsInline
          style={{ transform: "scaleX(1)" }} // Natural mode - kanan tetap kanan, kiri tetap kiri
        />
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-foreground/80">
            <BiCamera className="size-12 text-white/50" />
            <p className="text-sm font-medium text-white/70">
              Kamera belum aktif
            </p>
          </div>
        )}
        {scanning && (
          <>
            {/* Corner frame */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative size-48">
                <span className="absolute top-0 left-0 h-8 w-8 rounded-tl-sm border-t-2 border-l-2 border-white" />
                <span className="absolute top-0 right-0 h-8 w-8 rounded-tr-sm border-t-2 border-r-2 border-white" />
                <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-sm border-b-2 border-l-2 border-white" />
                <span className="absolute right-0 bottom-0 h-8 w-8 rounded-br-sm border-r-2 border-b-2 border-white" />
                {/* Scan line animation */}
                <div className="absolute inset-x-0 top-0 h-0.5 animate-bounce bg-green-400/80" />
              </div>
            </div>
            <p className="absolute right-0 bottom-3 left-0 text-center text-xs font-medium text-white/70">
              Arahkan kamera ke QR Card petugas
            </p>
          </>
        )}
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
            <p className="text-sm font-semibold text-white">Memproses...</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!scanning ? (
          <Button
            onClick={() => void startScanner()}
            className="rounded-xl bg-foreground px-8 text-background hover:bg-foreground/90"
            disabled={processing}
          >
            <BiCamera className="mr-2 size-4" />
            Aktifkan Kamera
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={stopScanner}
            className="rounded-xl"
          >
            <BiX className="mr-2 size-4" />
            Stop Kamera
          </Button>
        )}
        {!scanning && (
          <Button
            variant="outline"
            onClick={() => void startScanner()}
            className="rounded-xl"
            disabled={processing}
          >
            <BiRefresh className="mr-2 size-4" />
            Scan Ulang
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Scan QR Card milik petugas untuk mencatat presensi masuk atau pulang
        secara otomatis.
      </p>

      {/* Result Dialog */}
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BiUserCheck className="size-5" />
              Hasil Presensi
            </DialogTitle>
            <DialogDescription>
              Presensi dicatat otomatis oleh server saat scan.
            </DialogDescription>
          </DialogHeader>

          {result && (
            <div className="space-y-4 py-1">
              {/* Identitas (kontrak v3: blok identitas = sumber utama) */}
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <BiUserCheck className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {result.identitas.nama ?? result.user?.name ?? "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {result.identitas.jenis === "petugas"
                      ? [result.identitas.kode, result.identitas.jabatan]
                          .filter(Boolean)
                          .join(" · ") || `PID-${result.identitas.id}`
                      : (result.user?.no_pegawai ?? `#${result.identitas.id}`)}
                    {result.gudang ? ` · ${result.gudang.nama}` : ""}
                  </p>
                </div>
              </div>

              {/* Tipe badge */}
              <div className="flex items-center justify-between rounded-xl border border-border/40 px-4 py-3">
                <span className="text-sm text-muted-foreground">Status</span>
                {result.tipe === "masuk" && !terlambat && (
                  <ColoredBadge color="green">🟢 Masuk tercatat</ColoredBadge>
                )}
                {result.tipe === "masuk" && terlambat && (
                  <ColoredBadge color="red">🔴 Masuk (terlambat)</ColoredBadge>
                )}
                {result.tipe === "pulang" && (
                  <ColoredBadge color="blue">🔵 Pulang tercatat</ColoredBadge>
                )}
                {result.tipe === "duplicate" && (
                  <ColoredBadge color="gray">✅ Sudah lengkap</ColoredBadge>
                )}
              </div>

              {/* Shift info */}
              {result.shift && (
                <div className="flex items-center justify-between rounded-xl border border-border/40 px-4 py-3">
                  <span className="text-sm text-muted-foreground">Shift</span>
                  <span className="text-sm font-medium text-foreground">
                    {result.shift.nama} ({result.shift.jam_masuk} -{" "}
                    {result.shift.jam_pulang})
                  </span>
                </div>
              )}

              {/* Waktu */}
              {result.tipe !== "duplicate" && (
                <p className="text-center text-sm text-muted-foreground">
                  Waktu tercatat:{" "}
                  <span className="font-semibold text-foreground">
                    {waktuTercatat} WIB
                  </span>
                </p>
              )}

              {result.tipe === "duplicate" && (
                <p className="text-center text-sm text-muted-foreground">
                  Absensi hari ini sudah lengkap. Scan diabaikan.
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => {
                setResultOpen(false)
                void startScanner()
              }}
            >
              <BiRefresh className="mr-2 size-4" />
              Scan Lagi
            </Button>
            <Button
              className="flex-1 rounded-xl bg-foreground text-background hover:bg-foreground/90"
              onClick={() => setResultOpen(false)}
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface QrScannerPanelProps {
  onSuccess?: () => void
}
