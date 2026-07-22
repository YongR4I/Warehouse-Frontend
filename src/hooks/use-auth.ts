"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/use-auth-store"

export function useAuth() {
  const router = useRouter()
  const { user, token, isAuthenticated, logout } = useAuthStore()

  const login = async () => {
    // TODO: Implement actual login API call
    // const response = await api.post("/auth/login", { email, password })
    // setAuth(response.data.user, response.data.token)
    router.push("/dashboard")
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout: handleLogout,
  }
}
