"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BrowserQRCodeReader } from "@zxing/browser"
import { BarcodeFormat, DecodeHintType } from "@zxing/library"
import type { IScannerControls } from "@zxing/browser"

// Input scanner utk perangkat tetap pintu gudang (kontrak v4,
// lihat Obsidian TODO-ABSENSI-SCAN):
// - useWedgeScanner  : USB scanner mode keyboard-wedge (ketik cepat + Enter)
// - useCameraScanner : fallback kamera — FAST PATH:
//   1) Native BarcodeDetector (Chrome/Edge Android) ~60fps, tanpa delay
//   2) Fallback ZXing BrowserQRCodeReader khusus QR_CODE, delay 30ms (was 500ms)

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

export function useCameraScanner(onDetect: (payload: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const readerRef = useRef<BrowserQRCodeReader | null>(null)
  const rafRef = useRef<number | null>(null)
  const stoppedRef = useRef(true)
  const [cameraOn, setCameraOn] = useState(false)
  const onDetectRef = useRef(onDetect)

  useEffect(() => {
    onDetectRef.current = onDetect
  }, [onDetect])

  const stopCamera = useCallback(() => {
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
      // Important: clear srcObject after pause to fully release camera on iOS
      videoRef.current.srcObject = null
      videoRef.current.removeAttribute("src")
    }
    setCameraOn(false)
  }, [])

  const startCamera = useCallback(async () => {
    if (!stoppedRef.current && cameraOn) return
    stoppedRef.current = false
    setCameraOn(true)

    // ——— Fast zxing fallback helper ———
    const startZxing = async () => {
      if (stoppedRef.current) return
      if (!videoRef.current) return
      try {
        const hints = new Map()
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE])
        // TRY_HARDER false = faster (true would be 2-3x slower). Keep false for instant scan.
        // ALSO: disable inverted etc. QR only is enough for WMS cards.
        hints.set(DecodeHintType.TRY_HARDER, false)

        const reader = new BrowserQRCodeReader(hints, {
          // was 500ms → super lemot (2 fps). 30ms → ~33fps, 60ms masih terasa delay.
          delayBetweenScanAttempts: 30,
          delayBetweenScanSuccess: 200,
          tryPlayVideoTimeout: 3000,
        })
        readerRef.current = reader

        // decodeFromVideoElement will reuse already-playing video and run internal
        // scan loop with the delay above. Callback invoked every frame attempt.
        const controls = await reader.decodeFromVideoElement(
          videoRef.current!,
          (result, _error, controls) => {
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
                stopCamera()
                onDetectRef.current(text)
              }
            }
            // NotFound / checksum errors are ignored → loop continues at 30ms
          }
        )
        controlsRef.current = controls
      } catch (e) {
        console.warn("[scanner] ZXing fast start failed", e)
        if (!stoppedRef.current) {
          setCameraOn(false)
          throw new Error("Kamera tidak dapat diakses")
        }
      }
    }

    // ——— Native BarcodeDetector path ———
    const tryNative = async (): Promise<boolean> => {
      if (stoppedRef.current) return false
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
                stopCamera()
                onDetectRef.current(raw)
                return
              }
            }
          } catch (err) {
            // Native failed mid-scan → fallback to ZXing immediately
            console.warn("[scanner] BarcodeDetector detect failed, fallback ZXing", err)
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
        console.warn("[scanner] BarcodeDetector init failed, fallback ZXing", e)
        return false
      }
    }

    try {
      // High-res + continuous focus → QR lebih tajam, decode lebih cepat
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          focusMode: { ideal: "continuous" },
          frameRate: { ideal: 30 },
        } as unknown as MediaTrackConstraints,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Give React time to mount <video>
      await new Promise((r) => setTimeout(r, 50))
      if (stoppedRef.current) {
        // cancelled while waiting
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      if (!videoRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        setCameraOn(false)
        throw new Error("Video element not ready")
      }

      videoRef.current.srcObject = stream
      // playsInline + muted required for autoplay on iOS
      videoRef.current.setAttribute("playsinline", "true")
      videoRef.current.muted = true
      try {
        await videoRef.current.play()
      } catch (playErr) {
        console.warn("[scanner] video.play() failed, try again", playErr)
        // iOS sometimes needs second play after canplay
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

      // Prefer native → instant. If not available, fallback to ZXing QR-only 30ms.
      const nativeOk = await tryNative()
      if (!nativeOk) {
        await startZxing()
      }
    } catch (err) {
      stoppedRef.current = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      setCameraOn(false)
      // Re-throw for caller toast
      if (err instanceof Error && err.message === "Kamera tidak dapat diakses") throw err
      throw new Error("Kamera tidak dapat diakses")
    }
  }, [cameraOn, stopCamera])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  return { videoRef, cameraOn, startCamera, stopCamera }
}
