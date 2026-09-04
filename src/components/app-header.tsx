"use client"

import * as React from "react"
import { BiCog, BiLogOut } from "react-icons/bi"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { SettingsModal } from "@/components/settings-modal"
import { NotificationBell } from "@/components/layout/notification-bell"
import { useAuth } from "@/hooks/use-auth"

export function AppHeader() {
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const { user, logout, hasPermission } = useAuth()

  // Gear pengaturan hanya untuk yang boleh mengelola user/role/gudang.
  const canOpenSettings =
    hasPermission("user-list") ||
    hasPermission("role-list") ||
    hasPermission("gudang-list")

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "AU"

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-end border-b border-border/40 bg-card px-6">
      <div className="flex w-fit items-center gap-3 rounded-xl px-4 py-1.5">
        <NotificationBell />
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tl from-[#93cce8] from-[#ffffff] via-[#0063b5] to-[#cbf9ff] text-[12px] font-semibold tracking-tight text-white shadow-xs">
          {initials}
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[13px] font-semibold text-foreground">
            {user?.name ?? "Admin User"}
          </span>
          <span className="truncate text-[11px] text-muted-foreground">
            {user?.email ?? "Warehouse Manager"}
          </span>
        </div>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          {canOpenSettings && (
            <DialogTrigger
              render={
                <button
                  className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted/60 hover:text-foreground active:scale-[0.96]"
                  aria-label="Settings"
                >
                  <BiCog className="!size-[16px]" />
                </button>
              }
            />
          )}
          <SettingsModal />
        </Dialog>
        <button
          onClick={logout}
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted/60 hover:text-red-600 active:scale-[0.96]"
          aria-label="Logout"
          title="Keluar"
        >
          <BiLogOut className="!size-[16px]" />
        </button>
      </div>
    </header>
  )
}