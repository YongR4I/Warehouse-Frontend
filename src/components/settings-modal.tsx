"use client"

import * as React from "react"
import { DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  BiShieldQuarter,
  BiCog,
  BiBuildings,
  BiPlusCircle,
  BiTrash,
} from "react-icons/bi"

interface UserItem {
  id: string
  nama: string
  email: string
  role: string
  status: "aktif" | "nonaktif"
}

interface WarehousePICItem {
  kode: string
  nama: string
  alamat: string
  pic: string
}

export function SettingsModal() {
  const [activeTab, setActiveTab] = React.useState<"users" | "roles">("users")

  // State for user management (Pengguna & Hak Akses)
  const [users, setUsers] = React.useState<UserItem[]>([
    {
      id: "1",
      nama: "Budi Santoso",
      email: "budi@sabiru.com",
      role: "Owner",
      status: "aktif",
    },
    {
      id: "2",
      nama: "Siti Rahmawati",
      email: "siti@sabiru.com",
      role: "Supervisor",
      status: "aktif",
    },
    {
      id: "3",
      nama: "Andi Wijaya",
      email: "andi.wijaya@sabiru.com",
      role: "Warehouse Manager",
      status: "aktif",
    },
    {
      id: "4",
      nama: "Rina Sari",
      email: "rina.sari@sabiru.com",
      role: "Admin Inbound",
      status: "aktif",
    },
  ])

  // State for warehouse PIC mapping (Konfigurasi Gudang & PIC)
  const [warehouses, setWarehouses] = React.useState<WarehousePICItem[]>([
    {
      kode: "GDG-001",
      nama: "Gudang Utama (Pusat)",
      alamat: "Jl. Industri No. 45, Jakarta Barat",
      pic: "Andi Wijaya",
    },
    {
      kode: "GDG-002",
      nama: "Gudang Transit",
      alamat: "Kawasan Logistik Blok B3, Cikarang",
      pic: "Budi Santoso",
    },
    {
      kode: "GDG-003",
      nama: "Gudang Area Timur",
      alamat: "Jl. Rungkut Industri III No. 12, Surabaya",
      pic: "Siti Rahmawati",
    },
  ])

  // Invite user form states
  const [showInviteForm, setShowInviteForm] = React.useState(false)
  const [newUserName, setNewUserName] = React.useState("")
  const [newUserEmail, setNewUserEmail] = React.useState("")
  const [newUserRole, setNewUserRole] = React.useState("Warehouse Staff")

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName.trim() || !newUserEmail.trim()) return

    const newUser: UserItem = {
      id: Date.now().toString(),
      nama: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: "aktif",
    }

    setUsers((prev) => [...prev, newUser])
    setNewUserName("")
    setNewUserEmail("")
    setNewUserRole("Warehouse Staff")
    setShowInviteForm(false)
  }

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  const handlePICChange = (kodeGudang: string, newPIC: string) => {
    setWarehouses((prev) =>
      prev.map((wh) => (wh.kode === kodeGudang ? { ...wh, pic: newPIC } : wh))
    )
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

  const getRoleColor = (role: string): "green" | "gray" | "blue" | "purple" | "yellow" => {
    switch (role.toLowerCase()) {
      case "owner":
        return "green"
      case "supervisor":
        return "gray"
      case "warehouse manager":
        return "blue"
      case "admin inbound":
      case "admin outbound":
        return "purple"
      default:
        return "yellow"
    }
  }

  return (
    <DialogContent
      className="fixed top-1/2 left-1/2 z-50 flex flex-row h-[580px] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border/80 bg-background p-0 shadow-2xl outline-none"
    >
      {/* PANEL KIRI: Navigasi Kategori Pengaturan */}
      <div className="flex w-[260px] shrink-0 flex-col bg-slate-50/50 p-4 border-r border-border/40">
        <span className="mb-3 px-2 text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase">
          Pengaturan Sistem
        </span>
        <nav className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs transition-all duration-150 outline-none select-none cursor-pointer",
              activeTab === "users"
                ? "bg-[#F3F4F6] text-foreground font-bold shadow-2xs"
                : "text-muted-foreground hover:bg-slate-100/60 hover:text-foreground"
            )}
          >
            <BiShieldQuarter className="size-5 shrink-0" />
            <span className="text-left font-semibold text-[13px] leading-snug">
              Pengguna & Hak Akses
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs transition-all duration-150 outline-none select-none cursor-pointer",
              activeTab === "roles"
                ? "bg-[#F3F4F6] text-foreground font-bold shadow-2xs"
                : "text-muted-foreground hover:bg-slate-100/60 hover:text-foreground"
            )}
          >
            <BiCog className="size-5 shrink-0" />
            <span className="text-left font-semibold text-[13px] leading-snug">
              Konfigurasi Gudang & PIC
            </span>
          </button>
        </nav>
      </div>

      {/* PANEL KANAN: Area Konten Pengaturan */}
      <div className="relative flex flex-1 flex-col p-8 overflow-hidden bg-white">

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
            <p className="mt-1.5 text-xs text-muted-foreground max-w-[550px]">
              Kelola akun pengguna dan hak aksesnya untuk memastikan keamanan operasional gudang.
            </p>

            <div className="my-5 h-px w-full bg-border/50" />

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto pr-1 -mr-3 gap-6 flex flex-col scrollbar-thin">
              {/* Form Undang Pengguna / Card Tambah Akun */}
              {!showInviteForm ? (
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-slate-50/20 p-4 transition-all duration-200">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-foreground">
                      Tambah Akun Baru
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      Undang staf baru ke dalam sistem WMS.
                    </span>
                  </div>
                  <Button
                    onClick={() => setShowInviteForm(true)}
                    className="h-8 rounded-lg bg-foreground text-[11px] font-bold text-background hover:bg-foreground/90 px-4 active:scale-[0.98] transition-all"
                  >
                    Undang Pengguna
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleInviteUser}
                  className="rounded-xl border border-border/60 bg-slate-50/20 p-4 space-y-3.5 animate-in fade-in duration-200"
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
                      <Label htmlFor="name" className="text-[10px] font-bold text-foreground/80 uppercase">
                        Nama Lengkap
                      </Label>
                      <Input
                        id="name"
                        placeholder="Contoh: Budi Santoso"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="h-8 text-xs px-2.5 rounded-lg border-border/70"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-[10px] font-bold text-foreground/80 uppercase">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Contoh: budi@sabiru.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="h-8 text-xs px-2.5 rounded-lg border-border/70"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-3 pt-1">
                    <div className="space-y-1 w-1/2">
                      <Label htmlFor="role" className="text-[10px] font-bold text-foreground/80 uppercase">
                        Role Akses
                      </Label>
                      <select
                        id="role"
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="flex h-8 w-full rounded-lg border border-border/70 bg-background px-2.5 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="Warehouse Staff">Warehouse Staff</option>
                        <option value="Admin Inbound">Admin Inbound</option>
                        <option value="Admin Outbound">Admin Outbound</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Warehouse Manager">Warehouse Manager</option>
                      </select>
                    </div>
                    <Button
                      type="submit"
                      className="h-8 rounded-lg bg-foreground text-[11px] font-bold text-background hover:bg-foreground/90 px-4 flex items-center gap-1 active:scale-[0.98]"
                    >
                      <BiPlusCircle className="size-3.5" />
                      Kirim Undangan
                    </Button>
                  </div>
                </form>
              )}

              {/* Daftar Staf Aktif */}
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-bold text-muted-foreground/80 tracking-wider uppercase mb-1">
                  Daftar Staf Aktif
                </span>
                <div className="divide-y divide-border/30">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-3 group hover:bg-slate-50/20 px-1 -mx-1 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200/50">
                          {getInitials(user.nama)}
                        </div>
                        {/* Detail Info */}
                        <div className="flex flex-col leading-tight">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-foreground">
                              {user.nama}
                            </span>
                            <ColoredBadge color={getRoleColor(user.role)}>
                              {user.role}
                            </ColoredBadge>
                          </div>
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      {/* Hapus User (Hanya tampil ketika di-hover atau untuk user non-owner demi keamanan) */}
                      {user.role !== "Owner" && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all outline-none"
                          title="Hapus Pengguna"
                        >
                          <BiTrash className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KONTEN TAB: Konfigurasi Gudang & PIC */}
        {activeTab === "roles" && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
                <BiBuildings className="size-4.5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Konfigurasi Gudang & PIC
              </h2>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-[550px]">
              Atur dan tugaskan penanggung jawab (PIC) untuk setiap lokasi gudang yang aktif secara dinamis.
            </p>

            <div className="my-5 h-px w-full bg-border/50" />

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto pr-1 -mr-3 flex flex-col gap-4 scrollbar-thin">
              <div className="flex flex-col gap-3">
                {warehouses.map((wh) => (
                  <div
                    key={wh.kode}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 hover:border-slate-300/80 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/50 text-slate-600">
                        <BiBuildings className="size-5" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-foreground">
                            {wh.nama}
                          </span>
                          <span className="text-[10px] font-medium font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                            {wh.kode}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground mt-1 max-w-[340px]">
                          {wh.alamat}
                        </span>
                      </div>
                    </div>

                    {/* PIC Dropdown Selector */}
                    <div className="flex flex-col items-start gap-1 shrink-0">
                      <Label htmlFor={`pic-${wh.kode}`} className="text-[9px] font-bold text-muted-foreground/80 uppercase">
                        Penanggung Jawab (PIC)
                      </Label>
                      <select
                        id={`pic-${wh.kode}`}
                        value={wh.pic}
                        onChange={(e) => handlePICChange(wh.kode, e.target.value)}
                        className="flex h-9 w-64 rounded-xl border border-slate-200 bg-background px-3 py-1 text-xs font-semibold outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer hover:bg-slate-50/50 transition-colors"
                      >
                        {users.map((user) => (
                          <option key={user.id} value={user.nama}>
                            {user.nama} ({user.role})
                          </option>
                        ))}
                      </select>
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
