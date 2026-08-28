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
  const hasToken = !!useAuthStore((state) => state.token)
  const { fetchMe } = useAuth()

  // Gate rehidrasi: tunggu persist selesai (support sessionStorage/localStorage switch)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const persist = useAuthStore.persist
    if (!persist) return

    const unsub = persist.onFinishHydration(() => setHydrated(true))
    const t = setTimeout(() => {
      if (persist.hasHydrated()) setHydrated(true)
    }, 0)
    return () => {
      clearTimeout(t)
      unsub()
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const { token, user } = useAuthStore.getState()
    const hasTokenNow = !!token
    if (!hasTokenNow) {
      router.replace("/login")
      return
    }
    if (isPortalOnlyUser(user)) {
      router.replace("/portal-izin")
      return
    }
    fetchMe().catch((err) => {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      if (status === 401 || status === 403) {
        router.replace("/login")
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, hasToken])

  if (!hydrated) return null
  // token adalah source of truth (isAuthenticated bisa stale jika storage migrasi)
  if (!hasToken) return null

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