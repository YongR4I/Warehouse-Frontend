"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useAuthStore } from "@/store/use-auth-store"
import { useAuth } from "@/hooks/use-auth"

export function BasicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hasToken = !!useAuthStore((state) => state.token)
  const { fetchMe } = useAuth()

  useEffect(() => {
    if (!hasToken) {
      router.replace("/login")
      return
    }
    fetchMe().catch(() => {
      router.replace("/login")
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken])

  if (!isAuthenticated) {
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