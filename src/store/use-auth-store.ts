import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"

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
  const directPermissions = (user as User & { permissions?: string[] }).permissions ?? []
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
        set({ user, token, isAuthenticated: true, permissions: flattenPermissions(user) }),
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user, permissions: flattenPermissions(user) }),
      hasPermission: (permission) => {
        const permissions = get().permissions
        return permissions.includes("*") || permissions.includes(permission)
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false, permissions: [] }),
    }),
    {
      name: "auth-storage",
    }
  )
)