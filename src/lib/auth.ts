import type { User } from "@/types"

// Landing page per role: halaman pertama setelah login, sesuai kerja harian.
// Portal-izin TIDAK jadi landing — ia halaman publik (akses via QR)
//yang dibuka manual, bukan tempat mendarat otomatis.
const LANDING_BY_ROLE: Array<{ roles: string[]; path: string }> = [
  {
    roles: ["super-admin", "admin", "admin-gudang", "kepala-gudang"],
    path: "/dashboard",
  },
  { roles: ["petugas-gudang"], path: "/inventory/barang-masuk" },
  { roles: ["checker"], path: "/inventory/opname" },
  { roles: ["kurir-driver"], path: "/inventory/barang-keluar" },
]

export function getLandingPage(user: User | null | undefined): string {
  const roleNames = (user?.roles ?? []).map((r) => r.name)
  for (const entry of LANDING_BY_ROLE) {
    if (roleNames.some((name) => entry.roles.includes(name))) {
      return entry.path
    }
  }
  return "/dashboard"
}
