"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { NotFoundException } from "@zxing/library"

// Input scanner utk perangkat tetap pintu gudang (kontrak v4,
// lihat Obsidian TODO-ABSENSI-SCAN):
// - useWedgeScanner  : USB scanner mode keyboard-wedge (ketik cepat + Enter)
// - useCameraScanner : fallback kamera (pola zxing dari qr-scanner-panel)

const WEDGE_GAP_MS = 120

export function useWedgeScanner(
  onDetect: (payload: string) => void,
  enabled: boolean
) {
  const bufferRef = useRef("")
  const lastKeyAtRef = useRef(0)
  const onDetectRef = useRef(onDetect)

  useEffect(() => {
    onDetectRef.current = onDetect
  }, [onDetect])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return

      const now = Date.now()
      if (now - lastKeyAtRef.current > WEDGE_GAP_MS) bufferRef.current = ""
      lastKeyAtRef.current = now

      if (e.key === "Enter") {
        const payload = bufferRef.current.trim()
        bufferRef.current = ""
        if (payload) onDetectRef.current(payload)
        return
      }
      if (e.key === "Backspace") {
        bufferRef.current = bufferRef.current.slice(0, -1)
        return
      }
      if (e.key.length === 1) {
        bufferRef.current += e.key
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      bufferRef.current = ""
    }
  }, [enabled])
}

export function useCameraScanner(onDetect: (payload: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraOn, setCameraOn] = useState(false)
  const onDetectRef = useRef(onDetect)

  useEffect(() => {
    onDetectRef.current = onDetect
  }, [onDetect])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }
    readerRef.current = null
    setCameraOn(false)
  }, [])

  const startCamera = useCallback(async () => {
    setCameraOn(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream

      // Beri React waktu mount <video> sebelum stream dipasang
      await new Promise((r) => setTimeout(r, 50))
      if (!videoRef.current) return

      videoRef.current.srcObject = stream
      await videoRef.current.play()

      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader

      void (async () => {
        while (readerRef.current && videoRef.current) {
          try {
            const result = await reader.decodeOnceFromVideoElement(
              videoRef.current
            )
            if (result) {
              // Lepaskan kamera sebelum hasil ditangani pemanggil
              stopCamera()
              onDetectRef.current(result.getText())
              break
            }
          } catch (err) {
            if (err instanceof NotFoundException) continue
            break
          }
        }
      })()
    } catch {
      setCameraOn(false)
      throw new Error("Kamera tidak dapat diakses")
    }
  }, [stopCamera])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  return { videoRef, cameraOn, startCamera, stopCamera }
}
