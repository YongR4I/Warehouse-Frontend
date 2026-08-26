"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useAuthStore } from "@/store/use-auth-store"
import { useAuth } from "@/hooks/use-auth"
import { isPortalOnlyUser } from "@/lib/auth"

export function BasicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hasToken = !!useAuthStore((state) => state.token)
  const { fetchMe } = useAuth()

  // Gate rehidrasi zustand-persist: JANGAN memutuskan redirect sebelum
  // localStorage selesai dibaca — ini akar bug "refresh -> disuruh login".
  const [hydrated, setHydrated] = useState(() => {
    try {
      return useAuthStore.persist?.hasHydrated() ?? false
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!useAuthStore.persist) return
    // Fallback utk storage asinkron: cek ulang setelah tick
    const t = setTimeout(() => {
      if (useAuthStore.persist?.hasHydrated()) setHydrated(true)
    }, 0)
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true)
    )
    return () => {
      clearTimeout(t)
      unsub()
    }
  }, [])

  useEffect(() => {
    // Tunggu persist selesai supaya token lama benar-benar terbaca
    if (!hydrated) return

    if (!hasToken) {
      router.replace("/login")
      return
    }

    // Pemisahan akses (portal-izin): non-admin tidak boleh tinggal di WMS
    if (isPortalOnlyUser(useAuthStore.getState().user)) {
      router.replace("/portal-izin")
      return
    }

    fetchMe().catch((err) => {
      // Hanya keluar bila server MENOLAK sesi (401/403).
      // Error jaringan/server down jangan mengusir user dari halaman.
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      if (status === 401 || status === 403) {
        router.replace("/login")
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, hasToken])

  // Belum tahu status auth -> layar kosong sesaat, bukan redirect
  if (!hydrated || !isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="min-w-0 flex-1 px-14 py-10">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
