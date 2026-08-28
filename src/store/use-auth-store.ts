import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "@/types"

// WMS best-practice: session by default (hilang saat tutup browser) → aman device shared
// Remember me = true → pakai localStorage, false → sessionStorage (tetap survive refresh)
const rememberAwareStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null
    // migrasi: cek keduanya biar data lama di localStorage tetap ketemu walau sekarang session
    const fromSession = sessionStorage.getItem(name)
    if (fromSession) return fromSession
    return localStorage.getItem(name)
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return
    const remember = localStorage.getItem("remember-me") === "true"
    if (remember) {
      localStorage.setItem(name, value)
      sessionStorage.removeItem(name)
    } else {
      sessionStorage.setItem(name, value)
      // jangan hapus localStorage jika ini adalah setItem untuk remember-me sendiri? aman hapus duplikat
      // tapi jangan hapus flag remember-me
      if (name !== "remember-me") localStorage.removeItem(name)
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem(name)
    sessionStorage.removeItem(name)
  },
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  permissions: string[]
  setAuth: (user: User, token: string) => void
  setToken: (token: string) => void
  setUser: (user: User) => void
  hasPermission: (permission: string) => boolean
  logout: () => void
}

function flattenPermissions(user: User): string[] {
  const perms = new Set<string>()
  for (const role of user.roles ?? []) {
    if (role.name === "super-admin" || role.name === "admin") {
      perms.add("*")
    }
    for (const permission of role.permissions ?? []) {
      perms.add(permission.name)
    }
  }
  const directPermissions =
    (user as User & { permissions?: string[] }).permissions ?? []
  for (const permission of directPermissions) {
    perms.add(permission)
  }
  return [...perms]
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: [],
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          permissions: flattenPermissions(user),
        }),
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user, permissions: flattenPermissions(user) }),
      hasPermission: (permission) => {
        const permissions = get().permissions
        return permissions.includes("*") || permissions.includes(permission)
      },
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: [],
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => rememberAwareStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),
    }
  )
)
