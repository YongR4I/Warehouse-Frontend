"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/use-auth-store"
import api from "@/lib/api"
import { isPortalOnlyUser } from "@/lib/auth"
import type { User } from "@/types"

export function useAuth() {
  const router = useRouter()
  const {
    user,
    token,
    isAuthenticated,
    permissions,
    setAuth,
    setUser,
    logout,
    hasPermission,
  } = useAuthStore()

  const login = async (email: string, password: string, remember = false) => {
    const response = await api.post("/login", { email, password })
    const data = response.data?.data
    if (!data?.token || !data?.user) {
      throw new Error(
        "Login gagal: token atau user tidak ditemukan pada respons"
      )
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("remember-me", String(!!remember))
      // bersihkan storage lawan biar tidak duplikat & next getItem konsisten
      if (remember) sessionStorage.removeItem("auth-storage")
      else localStorage.removeItem("auth-storage")
    }
    setAuth(data.user as User, data.token as string)
    // Pemisahan akses (portal-izin): non-admin mendarat di portal, bukan WMS
    router.push(
      isPortalOnlyUser(data.user as User) ? "/portal-izin" : "/dashboard"
    )
  }

  const fetchMe = async (): Promise<User | null> => {
    const response = await api.get("/me")
    const data = response.data?.data
    if (data) {
      setUser(data as User)
      return data as User
    }
    return null
  }

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("remember-me")
      localStorage.removeItem("auth-storage")
      sessionStorage.removeItem("auth-storage")
    }
    logout()
    try {
      await api.post("/logout")
    } catch {
      // token sudah dihapus secara lokal; abaikan error dari backend
    }
    router.push("/login")
  }

  return {
    user,
    token,
    isAuthenticated,
    permissions,
    login,
    fetchMe,
    logout: handleLogout,
    hasPermission,
  }
}
