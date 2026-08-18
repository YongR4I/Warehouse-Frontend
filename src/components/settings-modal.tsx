"use client"

import * as React from "react"
import { DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  useApiList,
  useApiCreate,
  useApiUpdate,
  useApiDelete,
} from "@/hooks/use-api"
import { getErrorMessage } from "@/lib/api"
import { useAuthStore } from "@/store/use-auth-store"
import {
  BiShieldQuarter,
  BiCog,
  BiBuildings,
  BiPlusCircle,
  BiTrash,
  BiEditAlt,
  BiLockAlt,
  BiCheckCircle,
} from "react-icons/bi"
import type {
  Gudang,
  Permission,
  Role,
  RolePayload,
  User,
  UserPayload,
} from "@/types"

function unwrapRows<T>(data: unknown): T[] {
  const body = data as { data?: unknown } | T[] | null | undefined
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === "object" && Array.isArray(body.data)) {
    return body.data as T[]
  }
  return []
}

function permName(permission: Permission | string): string {
  return typeof permission === "string" ? permission : permission.name
}

type TabKey = "users" | "roles" | "warehouses"

export function SettingsModal() {
  const [activeTab, setActiveTab] = React.useState<TabKey>("users")
  const currentUser = useAuthStore((state) => state.user)

  const usersQuery = useApiList<User>({
    key: "users",
    url: "/user",
    params: { per_page: 100 },
  })
  const rolesQuery = useApiList<Role>({
    key: "roles",
    url: "/role",
    params: { per_page: 100 },
  })
  const gudangQuery = useApiList<Gudang>({
    key: "gudang",
    url: "/gudang",
    params: { per_page: 100 },
  })

  const users = unwrapRows<User>(usersQuery.data)
  const roles = unwrapRows<Role>(rolesQuery.data)
  const warehouses = unwrapRows<Gudang>(gudangQuery.data)

  const permissionOptions = React.useMemo(() => {
    const set = new Set<string>()
    for (const role of roles) {
      for (const permission of role.permissions ?? []) {
        set.add(permName(permission))
      }
    }
    return [...set].sort()
  }, [roles])

  const createUserMutation = useApiCreate<User, UserPayload>("users", "/user")
  const updateUserMutation = useApiUpdate<User, UserPayload>("users", "/user")
  const deleteUserMutation = useApiDelete("users", "/user")
  const createRoleMutation = useApiCreate<Role, RolePayload>("roles", "/role")
  const updateRoleMutation = useApiUpdate<Role, RolePayload>("roles", "/role")

  // ── Invite user form states ──
  const [showInviteForm, setShowInviteForm] = React.useState(false)
  const [newUserName, setNewUserName] = React.useState("")
  const [newUserEmail, setNewUserEmail] = React.useState("")
  const [newUserPassword, setNewUserPassword] = React.useState("")
  const [newUserRoles, setNewUserRoles] = React.useState<string[]>([])
  const [inviting, setInviting] = React.useState(false)

  // ── Role form states ──
  const [editingRole, setEditingRole] = React.useState<Role | null>(null)
  const [roleName, setRoleName] = React.useState("")
  const [rolePermissions, setRolePermissions] = React.useState<string[]>([])
  const [savingRole, setSavingRole] = React.useState(false)

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName.trim() || !newUserEmail.trim()) return
    if (!newUserPassword.trim()) {
      toast.error("Password wajib diisi saat membuat akun baru")
      return
    }
    setInviting(true)
    try {
      await createUserMutation.mutateAsync({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        roles: newUserRoles.length > 0 ? newUserRoles : undefined,
      })
      toast.success("Pengguna berhasil ditambahkan")
      setNewUserName("")
      setNewUserEmail("")
      setNewUserPassword("")
      setNewUserRoles([])
      setShowInviteForm(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setInviting(false)
    }
  }

  const handleToggleActive = async (user: User) => {
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: {
          name: user.name,
          email: user.email,
          is_active: !user.is_active,
        },
      })
      toast.success(
        user.is_active ? "Pengguna dinonaktifkan" : "Pengguna diaktifkan"
      )
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (currentUser?.id === user.id) {
      toast.error("Tidak dapat menghapus akun yang sedang digunakan")
      return
    }
    if (!window.confirm(`Hapus pengguna "${user.name}"?`)) return
    try {
      await deleteUserMutation.mutateAsync(user.id)
      toast.success("Pengguna berhasil dihapus")
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const toggleRolePermission = (permission: string) => {
    setRolePermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  const openCreateRole = () => {
    setEditingRole(null)
    setRoleName("")
    setRolePermissions([])
  }

  const openEditRole = (role: Role) => {
    setEditingRole(role)
    setRoleName(role.name)
    setRolePermissions((role.permissions ?? []).map(permName))
  }

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleName.trim()) {
      toast.error("Nama peran wajib diisi")
      return
    }
    setSavingRole(true)
    try {
      const payload: RolePayload = {
        name: roleName.trim(),
        permissions: rolePermissions,
      }
      if (editingRole) {
        await updateRoleMutation.mutateAsync({
          id: editingRole.id,
          data: payload,
        })
        toast.success("Peran berhasil diperbarui")
      } else {
        await createRoleMutation.mutateAsync(payload)
        toast.success("Peran berhasil ditambahkan")
      }
      openCreateRole()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSavingRole(false)
    }
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <DialogContent className="fixed top-1/2 left-1/2 z-50 flex h-[580px] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-row overflow-hidden rounded-2xl border border-border/80 bg-background p-0 shadow-2xl outline-none">
      {/* PANEL KIRI: Navigasi Kategori Pengaturan */}
      <div className="flex w-[260px] shrink-0 flex-col border-r border-border/40 bg-slate-50/50 p-4">
        <span className="mb-3 px-2 text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase">
          Pengaturan Sistem
        </span>
        <nav className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-xs transition-all duration-150 outline-none select-none",
              activeTab === "users"
                ? "bg-[#F3F4F6] font-bold text-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-slate-100/60 hover:text-foreground"
            )}
          >
            <BiShieldQuarter className="size-5 shrink-0" />
            <span className="text-left text-[13px] leading-snug font-semibold">
              Pengguna & Hak Akses
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-xs transition-all duration-150 outline-none select-none",
              activeTab === "roles"
                ? "bg-[#F3F4F6] font-bold text-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-slate-100/60 hover:text-foreground"
            )}
          >
            <BiCog className="size-5 shrink-0" />
            <span className="text-left text-[13px] leading-snug font-semibold">
              Peran & Izin
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("warehouses")}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-xs transition-all duration-150 outline-none select-none",
              activeTab === "warehouses"
                ? "bg-[#F3F4F6] font-bold text-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-slate-100/60 hover:text-foreground"
            )}
          >
            <BiBuildings className="size-5 shrink-0" />
            <span className="text-left text-[13px] leading-snug font-semibold">
              Konfigurasi Gudang & PIC
            </span>
          </button>
        </nav>
      </div>

      {/* PANEL KANAN: Area Konten Pengaturan */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-white p-8">
        {/* KONTEN TAB: Pengguna & Hak Akses */}
        {activeTab === "users" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
                <BiShieldQuarter className="size-4.5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Pengguna Dan Hak Akses
              </h2>
            </div>
            <p className="mt-1.5 max-w-[550px] text-xs text-muted-foreground">
              Kelola akun pengguna dan hak aksesnya untuk memastikan keamanan
              operasional gudang.
            </p>

            <div className="my-5 h-px w-full bg-border/50" />

            {/* Scrollable Content Container */}
            <div className="-mr-3 flex flex-1 scrollbar-thin flex-col gap-6 overflow-y-auto pr-1">
              {/* Form Undang Pengguna / Card Tambah Akun */}
              {!showInviteForm ? (
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-slate-50/20 p-4 transition-all duration-200">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-foreground">
                      Tambah Akun Baru
                    </span>
                    <span className="mt-0.5 text-[11px] text-muted-foreground">
                      Undang staf baru ke dalam sistem WMS.
                    </span>
                  </div>
                  <Button
                    onClick={() => setShowInviteForm(true)}
                    className="h-8 rounded-lg bg-foreground px-4 text-[11px] font-bold text-background transition-all hover:bg-foreground/90 active:scale-[0.98]"
                  >
                    Undang Pengguna
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleInviteUser}
                  className="animate-in space-y-3.5 rounded-xl border border-border/60 bg-slate-50/20 p-4 duration-200 fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-foreground">
                      Undang Staf Baru
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowInviteForm(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Batal
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="name"
                        className="text-[10px] font-bold text-foreground/80 uppercase"
                      >
                        Nama Lengkap
                      </Label>
                      <Input
                        id="name"
                        placeholder="Contoh: Budi Santoso"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="h-8 rounded-lg border-border/70 px-2.5 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="email"
                        className="text-[10px] font-bold text-foreground/80 uppercase"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Contoh: budi@sabiru.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="h-8 rounded-lg border-border/70 px-2.5 text-xs"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="password"
                      className="text-[10px] font-bold text-foreground/80 uppercase"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimal 8 karakter"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="h-8 rounded-lg border-border/70 px-2.5 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-foreground/80 uppercase">
                      Role Akses
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {roles.length === 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          Belum ada peran tersedia.
                        </span>
                      )}
                      {roles.map((role) => {
                        const checked = newUserRoles.includes(role.name)
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() =>
                              setNewUserRoles((prev) =>
                                checked
                                  ? prev.filter((r) => r !== role.name)
                                  : [...prev, role.name]
                              )
                            }
                            className={cn(
                              "flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all",
                              checked
                                ? "border-foreground bg-foreground text-background"
                                : "border-border/70 bg-background text-muted-foreground hover:border-foreground/40"
                            )}
                          >
                            {checked && <BiCheckCircle className="size-3" />}
                            {role.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="flex h-8 items-center gap-1 rounded-lg bg-foreground px-4 text-[11px] font-bold text-background hover:bg-foreground/90 active:scale-[0.98]"
                    disabled={inviting}
                  >
                    <BiPlusCircle className="size-3.5" />
                    {inviting ? "Menyimpan..." : "Kirim Undangan"}
                  </Button>
                </form>
              )}

              {/* Daftar Staf Aktif */}
              <div className="flex flex-1 flex-col">
                <span className="mb-1 text-[10px] font-bold tracking-wider text-muted-foreground/80 uppercase">
                  Daftar Staf Aktif
                </span>
                {usersQuery.isLoading && (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    Memuat data...
                  </div>
                )}
                {!usersQuery.isLoading && users.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    Tidak ada pengguna ditemukan.
                  </div>
                )}
                <div className="divide-y divide-border/30">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="group -mx-1 flex items-center justify-between rounded-lg px-1 py-3 transition-colors hover:bg-slate-50/20"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200/50 bg-slate-100 text-xs font-bold text-slate-700">
                          {getInitials(user.name)}
                        </div>
                        {/* Detail Info */}
                        <div className="flex flex-col leading-tight">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-semibold text-foreground">
                              {user.name}
                            </span>
                            {user.roles?.map((role) => (
                              <ColoredBadge key={role.id} color="gray">
                                {role.name}
                              </ColoredBadge>
                            ))}
                            {(!user.roles || user.roles.length === 0) && (
                              <ColoredBadge color="gray">
                                Tanpa Role
                              </ColoredBadge>
                            )}
                            <ColoredBadge
                              color={user.is_active ? "green" : "red"}
                            >
                              {user.is_active ? "Aktif" : "Non-Aktif"}
                            </ColoredBadge>
                          </div>
                          <span className="mt-0.5 text-[11px] text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={cn(
                            "rounded-lg p-1.5 text-[10px] font-bold transition-all outline-none",
                            user.is_active
                              ? "text-muted-foreground hover:bg-amber-50 hover:text-amber-600"
                              : "text-emerald-600 hover:bg-emerald-50"
                          )}
                          title={user.is_active ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                        {currentUser?.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all outline-none group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                            title="Hapus Pengguna"
                          >
                            <BiTrash className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KONTEN TAB: Peran & Izin */}
        {activeTab === "roles" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
                <BiLockAlt className="size-4.5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Peran & Izin
              </h2>
            </div>
            <p className="mt-1.5 max-w-[550px] text-xs text-muted-foreground">
              Kelola peran (role) dan daftar izin (permission) yang dimiliki
              setiap peran.
            </p>

            <div className="my-5 h-px w-full bg-border/50" />

            <div className="-mr-3 flex flex-1 scrollbar-thin flex-col gap-5 overflow-y-auto pr-1">
              {/* Form Tambah / Ubah Peran */}
              <form
                onSubmit={handleSaveRole}
                className="space-y-3.5 rounded-xl border border-border/60 bg-slate-50/20 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-foreground">
                    {editingRole
                      ? `Ubah Peran: ${editingRole.name}`
                      : "Tambah Peran Baru"}
                  </span>
                  {editingRole && (
                    <button
                      type="button"
                      onClick={openCreateRole}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Batal Ubah
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="role-name"
                    className="text-[10px] font-bold text-foreground/80 uppercase"
                  >
                    Nama Peran
                  </Label>
                  <Input
                    id="role-name"
                    placeholder="Contoh: Supervisor Gudang"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="h-8 rounded-lg border-border/70 px-2.5 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-foreground/80 uppercase">
                    Izin (Permissions)
                  </Label>
                  <div className="flex max-h-[110px] flex-wrap gap-1.5 overflow-y-auto">
                    {permissionOptions.length === 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        Belum ada izin terdaftar pada peran yang ada.
                      </span>
                    )}
                    {permissionOptions.map((permission) => {
                      const checked = rolePermissions.includes(permission)
                      return (
                        <button
                          key={permission}
                          type="button"
                          onClick={() => toggleRolePermission(permission)}
                          className={cn(
                            "flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all",
                            checked
                              ? "border-foreground bg-foreground text-background"
                              : "border-border/70 bg-background text-muted-foreground hover:border-foreground/40"
                          )}
                        >
                          {checked && <BiCheckCircle className="size-3" />}
                          {permission}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="flex h-8 items-center gap-1 rounded-lg bg-foreground px-4 text-[11px] font-bold text-background hover:bg-foreground/90 active:scale-[0.98]"
                  disabled={savingRole}
                >
                  <BiPlusCircle className="size-3.5" />
                  {savingRole
                    ? "Menyimpan..."
                    : editingRole
                      ? "Simpan Perubahan"
                      : "Tambah Peran"}
                </Button>
              </form>

              {/* Daftar Peran */}
              <div className="flex flex-col gap-3">
                {rolesQuery.isLoading && (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    Memuat data...
                  </div>
                )}
                {!rolesQuery.isLoading && roles.length === 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    Tidak ada peran ditemukan.
                  </div>
                )}
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-start justify-between rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:border-slate-300/80"
                  >
                    <div className="flex min-w-0 flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-foreground">
                          {role.name}
                        </span>
                        <ColoredBadge color="gray">
                          {(role.permissions ?? []).length} Izin
                        </ColoredBadge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(role.permissions ?? []).length === 0 && (
                          <span className="text-[11px] text-muted-foreground">
                            Tidak ada izin.
                          </span>
                        )}
                        {(role.permissions ?? []).map((permission) => (
                          <span
                            key={permName(permission)}
                            className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            {permName(permission)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => openEditRole(role)}
                      className="flex h-8 shrink-0 items-center gap-1 rounded-lg bg-foreground px-3 text-[11px] font-bold text-background hover:bg-foreground/90 active:scale-[0.98]"
                    >
                      <BiEditAlt className="size-3.5" />
                      Ubah
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* KONTEN TAB: Konfigurasi Gudang & PIC */}
        {activeTab === "warehouses" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
                <BiBuildings className="size-4.5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Konfigurasi Gudang & PIC
              </h2>
            </div>
            <p className="mt-1.5 max-w-[550px] text-xs text-muted-foreground">
              Daftar lokasi gudang aktif beserta penanggung jawab (PIC)
              masing-masing.
            </p>

            <div className="my-5 h-px w-full bg-border/50" />

            {/* Scrollable Content Container */}
            <div className="-mr-3 flex flex-1 scrollbar-thin flex-col gap-4 overflow-y-auto pr-1">
              {gudangQuery.isLoading && (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Memuat data...
                </div>
              )}
              {!gudangQuery.isLoading && warehouses.length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Tidak ada gudang ditemukan.
                </div>
              )}
              <div className="flex flex-col gap-3">
                {warehouses.map((wh) => (
                  <div
                    key={wh.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 transition-all hover:border-slate-300/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/50 bg-slate-100 text-slate-600">
                        <BiBuildings className="size-5" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-foreground">
                            {wh.nama}
                          </span>
                          {wh.kode && (
                            <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                              {wh.kode}
                            </span>
                          )}
                          <ColoredBadge
                            color={wh.status === "nonaktif" ? "gray" : "green"}
                          >
                            {wh.status === "nonaktif" ? "Non-Aktif" : "Aktif"}
                          </ColoredBadge>
                        </div>
                        <span className="mt-1 max-w-[340px] text-[11px] text-muted-foreground">
                          {wh.alamat ?? "-"}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[9px] font-bold text-muted-foreground/80 uppercase">
                        Penanggung Jawab (PIC)
                      </span>
                      <span className="text-[13px] font-semibold text-foreground">
                        {wh.pic ?? "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  )
}
