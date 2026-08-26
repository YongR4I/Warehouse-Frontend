"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { NotFoundException } from "@zxing/library"
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

export function QrScannerPanel({ onSuccess }: QrScannerPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [scanning, setScanning] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [resultOpen, setResultOpen] = useState(false)
  const [result, setResult] = useState<AbsensiScanResult | null>(null)

  const stopScanner = useCallback(() => {
    // Stop all MediaStream tracks to release camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    // Pause and clear the video element
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
    readerRef.current = null
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
        // Server memverifikasi signature dan langsung mencatat masuk/pulang
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
    setScanning(true)
    try {
      // Acquire camera stream first so we can stop it cleanly later
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader

      // Decode continuously from the already-playing video element
      void (async () => {
        while (readerRef.current && videoRef.current) {
          try {
            const result = await reader.decodeOnceFromVideoElement(
              videoRef.current
            )
            if (result) {
              void handleScanResult(result.getText())
              break
            }
          } catch (err) {
            if (err instanceof NotFoundException) continue
            break
          }
        }
      })()
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
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/60 bg-black">
        <video
          ref={videoRef}
          className="h-72 w-full object-cover"
          muted
          playsInline
        />
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
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
                      : (result.user?.kode_petugas ??
                        `#${result.identitas.id}`)}
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
