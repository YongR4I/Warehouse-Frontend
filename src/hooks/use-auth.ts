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

  const login = async (email: string, password: string) => {
    const response = await api.post("/login", { email, password })
    const data = response.data?.data
    if (!data?.token || !data?.user) {
      throw new Error(
        "Login gagal: token atau user tidak ditemukan pada respons"
      )
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
