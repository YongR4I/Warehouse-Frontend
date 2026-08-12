"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/use-auth-store"
import api from "@/lib/api"
import { User } from "@/types"

export function useAuth() {
  const router = useRouter()
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore()

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password })
    const responseData = response.data

    let userVal: User
    let tokenVal: string

    if (responseData && typeof responseData === "object") {
      if ("success" in responseData && responseData.success && responseData.data) {
        userVal = responseData.data.user
        tokenVal = responseData.data.token
      } else {
        userVal = responseData.user
        tokenVal = responseData.token
      }
    } else {
      throw new Error("Invalid response format")
    }

    if (!userVal || !tokenVal) {
      throw new Error("Login failed: User or token missing in response")
    }

    setAuth(userVal, tokenVal)
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
