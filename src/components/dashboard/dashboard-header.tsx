"use client"

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDSBStore, useFilterStore, useAuthStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MasterGudang } from "@/hooks/use-dashboard-data"
import {
  BiBuilding,
  BiChevronDown,
  BiBell,
  BiUserCheck,
  BiCheckCircle,
  BiErrorCircle,
  BiFilterAlt,
} from "react-icons/bi"

interface DashboardHeaderProps {
  warehouses: MasterGudang[]
  totalExceptions: number
}

export function DashboardHeader({ warehouses, totalExceptions }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { selectedWarehouse, setSelectedWarehouse } = useDSBStore()
  const { setGudang } = useFilterStore()
  const { user } = useAuthStore()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d">("today")

  const currentGudangId = searchParams.get("gudang") || selectedWarehouse || "all"

  const selectedWarehouseObj = warehouses.find((w) => w.id === currentGudangId)
  const warehouseLabel =
    currentGudangId === "all" || !selectedWarehouseObj
      ? "Semua Gudang (Aggregate View)"
      : `${selectedWarehouseObj.nama}`

  const handleWarehouseSelect = (id: string) => {
    setSelectedWarehouse(id === "all" ? null : id)
    setGudang(id === "all" ? null : id)

    const params = new URLSearchParams(searchParams.toString())
    if (id === "all") {
      params.delete("gudang")
    } else {
      params.set("gudang", id)
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    setIsDropdownOpen(false)
  }

  return (
    <div className="flex flex-col gap-4 bg-card p-5 md:p-6 rounded-3xl border border-border/80 shadow-xs backdrop-blur-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Editorial Subtitle */}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary border border-border/60 text-foreground">
            <BiBuilding className="size-5" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-light font-heading tracking-tight text-foreground">
                Operational Command
              </h1>
              <Badge variant="neutral" className="text-[10px] tracking-wider uppercase font-mono">
                Multi-Gudang
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground text-pretty mt-0.5">
              Ringkasan eksekutif & exception control center seluruh lokasi operasional
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Warehouse Switcher Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="default"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="gap-2 bg-card border-border/80 text-foreground hover:bg-muted/50 active:scale-[0.98] rounded-full"
            >
              <BiBuilding className="size-4 text-muted-foreground shrink-0" />
              <span className="font-medium text-xs md:text-sm max-w-[160px] md:max-w-[220px] truncate">
                {warehouseLabel}
              </span>
              <BiChevronDown
                className={`size-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </Button>

            {/* Dropdown Popup */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 z-50 rounded-2xl border border-border/80 bg-popover p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border/40">
                  Pilih Scope Gudang
                </div>
                <div className="py-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => handleWarehouseSelect("all")}
                    className={`w-full text-left px-3 py-2 text-xs md:text-sm rounded-xl font-medium flex items-center justify-between transition-colors active:scale-[0.98] ${
                      currentGudangId === "all"
                        ? "bg-secondary text-secondary-foreground font-semibold"
                        : "hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <span>🏢 Semua Gudang (Agregat)</span>
                    <Badge variant="neutral" className="text-[10px]">
                      {warehouses.length} Gudang
                    </Badge>
                  </button>

                  <div className="my-1 border-t border-border/30" />

                  {warehouses.map((wh) => (
                    <button
                      key={wh.id}
                      type="button"
                      onClick={() => handleWarehouseSelect(wh.id)}
                      className={`w-full text-left px-3 py-2 text-xs md:text-sm rounded-xl flex items-center justify-between transition-colors active:scale-[0.98] ${
                        currentGudangId === wh.id
                          ? "bg-secondary text-secondary-foreground font-semibold"
                          : "hover:bg-muted/60 text-foreground"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium text-xs md:text-sm">{wh.nama}</div>
                        <div className="text-[10px] text-muted-foreground">{wh.kota} • PIC: {wh.pic}</div>
                      </div>
                      {wh.kritisCount > 0 && (
                        <Badge variant="critical" className="text-[10px] shrink-0">
                          {wh.kritisCount}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date Range Selector Pills */}
          <div className="inline-flex items-center rounded-full bg-muted/60 p-1 border border-border/50 text-xs">
            <button
              type="button"
              onClick={() => setDateRange("today")}
              className={`px-3 py-1 rounded-full font-medium transition-all active:scale-[0.98] ${
                dateRange === "today"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setDateRange("7d")}
              className={`px-3 py-1 rounded-full font-medium transition-all active:scale-[0.98] ${
                dateRange === "7d"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setDateRange("30d")}
              className={`px-3 py-1 rounded-full font-medium transition-all active:scale-[0.98] ${
                dateRange === "30d"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bulan Ini
            </button>
          </div>

          {/* Real-time Notification Trigger */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative bg-card border-border/80 text-foreground active:scale-[0.98] rounded-full"
            >
              <BiBell className="size-4 text-foreground" />
              {totalExceptions > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs font-mono">
                  {totalExceptions}
                </span>
              )}
            </Button>

            {/* Notification Drawer Popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 z-50 rounded-2xl border border-border/80 bg-popover p-4 shadow-xl animate-in fade-in-50 zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <BiBell className="size-4 text-foreground" />
                    <span className="font-medium text-sm text-foreground">Diagnostic Alerts</span>
                  </div>
                  <Badge variant="critical" className="text-[10px]">
                    {totalExceptions} Actions Required
                  </Badge>
                </div>
                <div className="py-2 max-h-72 overflow-y-auto space-y-2 text-xs">
                  {totalExceptions > 0 ? (
                    <>
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                        <BiErrorCircle className="size-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-xs text-foreground">Stok Kritis Membutuhkan Restok</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Terdapat SKU barang dengan stok di bawah min_stok.</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
                        <BiFilterAlt className="size-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-xs text-foreground">Approval Transaksi Menunggu</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Transaksi barang masuk/keluar/mutasi membutuhkan persetujuan Owner.</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                      <BiCheckCircle className="size-8 text-emerald-500" />
                      <p className="text-xs">Tidak ada notifikasi kritis baru hari ini.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="hidden xl:flex items-center gap-2.5 pl-3 border-l border-border/60">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary border border-border/60 text-foreground font-bold text-xs">
              <BiUserCheck className="size-4" />
            </span>
            <div className="text-xs">
              <div className="font-medium text-foreground">{user?.name || "Pemilik Usaha"}</div>
              <div className="text-[10px] text-muted-foreground font-mono">Owner / Super Admin</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
