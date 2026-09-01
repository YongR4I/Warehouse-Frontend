"use client"

import { useEffect, useRef } from "react"

interface GyroCameraProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  enabled: boolean
}

export function useGyroCamera({ videoRef, enabled }: GyroCameraProps) {
  const requestPendingRef = useRef(false)
  const lastOrientationRef = useRef({ beta: 0, gamma: 0 })

  useEffect(() => {
    if (!enabled) {
      // Reset transform when disabled - natural mode (no mirror)
      if (videoRef.current) {
        videoRef.current.style.transform = "scaleX(1)"
        videoRef.current.style.transformOrigin = "center center"
      }
      return
    }
    if (!videoRef.current) return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma ?? 0 // left-right tilt
      const beta = event.beta ?? 0

      if (Math.abs(gamma - lastOrientationRef.current.gamma) < 1) return
      lastOrientationRef.current = { beta, gamma }

      if (videoRef.current) {
        const clamp = (v: number, min: number, max: number) =>
          Math.max(min, Math.min(max, v))
        const gammaClamped = clamp(gamma, -45, 45)

        videoRef.current.style.transformOrigin = "center center"
        videoRef.current.style.transition = "transform 0.08s ease-out"
        // natural mode (scaleX 1) + gyro pan
        // when tilt right (gamma >0) -> pan right
        const translatePercent = (gammaClamped / 45) * 18 // max 18% pan
        videoRef.current.style.transform = `scaleX(1) translateX(${translatePercent}%)`
      }
    }

    const requestPermissions = async () => {
      if (requestPendingRef.current) return
      requestPendingRef.current = true
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        if (permission === "granted") {
          window.addEventListener("deviceorientation", handleOrientation)
        } else {
          console.warn("Device orientation permission denied")
        }
      } catch (error) {
        console.warn("Unable to request device orientation permission:", error)
      } finally {
        requestPendingRef.current = false
      }
    }

    if (!(typeof (DeviceOrientationEvent as any).requestPermission === "function")) {
      window.addEventListener("deviceorientation", handleOrientation)
    } else {
      void requestPermissions()
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation)
      // reset on cleanup, keep natural
      if (videoRef.current) {
        videoRef.current.style.transform = "scaleX(1)"
      }
    }
  }, [enabled, videoRef])

  return {}
}
