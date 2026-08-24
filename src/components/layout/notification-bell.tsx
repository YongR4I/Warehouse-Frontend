"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { BiBell, BiCheckDouble } from "react-icons/bi"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import api from "@/lib/api"
import { formatDateTime } from "@/lib/status"
import type { Notifikasi } from "@/types"

// Lonceng notifikasi minimal (kontrak izin-v2, lihat Obsidian TODO-IZIN-V2):
// polling /notifikasi, badge unread, tandai dibaca per-item / semua.

const TIPE_DOT: Record<string, string> = {
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
}

export function NotificationBell() {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ["notifikasi-bell"],
    queryFn: async () => {
      const res = await api.get("/notifikasi", {
        params: { per_page: 10 },
      })
      return res.data as { data: Notifikasi[]; meta?: { total?: number } }
    },
    refetchInterval: 60_000,
  })

  const items = data?.data ?? []
  const unread = items.filter((n) => !n.is_read).length

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["notifikasi-bell"] })

  const markRead = async (id: number) => {
    await api.post(`/notifikasi/${id}/read`)
    invalidate()
  }

  const markAllRead = async () => {
    await api.post("/notifikasi/read-all")
    invalidate()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="relative flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted/60 hover:text-foreground active:scale-[0.96]"
            aria-label="Notifikasi"
            title="Notifikasi"
          >
            <BiBell className="!size-[16px]" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">
            Notifikasi
            {unread > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                {unread} baru
              </span>
            )}
          </p>
          <button
            onClick={() => void markAllRead()}
            disabled={unread === 0}
            className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <BiCheckDouble className="size-3.5" />
            Tandai semua
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-xs text-muted-foreground">
              Belum ada notifikasi.
            </p>
          )}
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (!n.is_read) void markRead(n.id)
              }}
              className={`flex w-full cursor-pointer flex-col gap-0.5 border-b border-border/40 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/60 ${
                n.is_read ? "opacity-70" : "bg-muted/30"
              }`}
            >
              <span className="flex items-start gap-2">
                <span
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                    TIPE_DOT[n.type ?? "info"] ?? "bg-blue-500"
                  } ${n.is_read ? "opacity-30" : ""}`}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {n.judul ?? n.title ?? "Notifikasi"}
                  </span>
                  <span className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                    {n.pesan ?? n.message ?? ""}
                  </span>
                  <span className="mt-0.5 text-[10px] text-muted-foreground/70">
                    {formatDateTime(n.created_at)}
                  </span>
                </span>
                {!n.is_read && (
                  <span className="ml-auto mt-1 size-2 shrink-0 rounded-full bg-blue-500" />
                )}
              </span>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
