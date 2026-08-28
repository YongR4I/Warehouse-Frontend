"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/use-auth-store"
import { isPortalOnlyUser } from "@/lib/auth"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const hasToken = !!useAuthStore((s) => s.token)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const persist = useAuthStore.persist
    if (!persist) {
      setHydrated(true)
      return
    }
    if (persist.hasHydrated()) setHydrated(true)
    const unsub = persist.onFinishHydration(() => setHydrated(true))
    const t1 = setTimeout(() => {
      if (persist.hasHydrated()) setHydrated(true)
    }, 0)
    const t2 = setTimeout(() => setHydrated(true), 150)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      unsub()
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (hasToken) {
      const user = useAuthStore.getState().user
      router.replace(isPortalOnlyUser(user) ? "/portal-izin" : "/dashboard")
    }
  }, [hydrated, hasToken, router])

  if (!hydrated) return null
  if (hasToken) return null
  return <>{children}</>
}