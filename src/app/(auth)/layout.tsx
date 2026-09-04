"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/use-auth-store"
import { getLandingPage } from "@/lib/auth"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const hasToken = !!useAuthStore((s) => s.token)
  const [hydrated, setHydrated] = useState(() => {
    return useAuthStore.persist ? useAuthStore.persist.hasHydrated() : true
  })

  useEffect(() => {
    const persist = useAuthStore.persist
    if (!persist) return

    const unsub = persist.onFinishHydration(() => setHydrated(true))
    const t = setTimeout(() => setHydrated(true), 100)
    return () => {
      clearTimeout(t)
      unsub()
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (hasToken) {
      const user = useAuthStore.getState().user
      router.replace(getLandingPage(user))
    }
  }, [hydrated, hasToken, router])

  if (!hydrated) return null
  if (hasToken) return null
  return <>{children}</>
}