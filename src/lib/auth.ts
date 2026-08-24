import type { User } from "@/types"

// Pemisahan akses (kontrak portal-izin, lihat Obsidian TODO-PORTAL-IZIN):
// hanya super-admin/admin yang boleh masuk dashboard WMS. Role lain
// (mis. operator/petugas biasa) = pengguna portal izin saja.

const WMS_ROLES = ["super-admin", "admin"]

export function isPortalOnlyUser(user: User | null | undefined): boolean {
  const roleNames = (user?.roles ?? []).map((r) => r.name)
  // Tanpa info role -> anggap pengguna WMS (aman untuk data lama)
  if (roleNames.length === 0) return false
  return !roleNames.some((name) => WMS_ROLES.includes(name))
}
