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

export function DashboardHeader({
  warehouses,
  totalExceptions,
}: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { selectedWarehouse, setSelectedWarehouse } = useDSBStore()
  const { setGudang } = useFilterStore()
  const { user } = useAuthStore()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d">("today")

  const currentGudangId =
    searchParams.get("gudang") || selectedWarehouse || "all"

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
    <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-xs backdrop-blur-xs md:p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        {/* Title & Editorial Subtitle */}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-secondary text-foreground">
            <BiBuilding className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-xl font-light tracking-tight text-foreground md:text-2xl">
                Operational Command
              </h1>
              <Badge
                variant="neutral"
                className="font-mono text-[10px] tracking-wider uppercase"
              >
                Multi-Gudang
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-pretty text-muted-foreground">
              Ringkasan eksekutif & exception control center seluruh lokasi
              operasional
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
              className="gap-2 rounded-full border-border/80 bg-card text-foreground hover:bg-muted/50 active:scale-[0.98]"
            >
              <BiBuilding className="size-4 shrink-0 text-muted-foreground" />
              <span className="max-w-[160px] truncate text-xs font-medium md:max-w-[220px] md:text-sm">
                {warehouseLabel}
              </span>
              <BiChevronDown
                className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </Button>

            {/* Dropdown Popup */}
            {isDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-72 animate-in rounded-2xl border border-border/80 bg-popover p-2 shadow-xl fade-in-50 zoom-in-95">
                <div className="border-b border-border/40 px-3 py-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  Pilih Scope Gudang
                </div>
                <div className="space-y-1 py-1">
                  <button
                    type="button"
                    onClick={() => handleWarehouseSelect("all")}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors active:scale-[0.98] md:text-sm ${
                      currentGudangId === "all"
                        ? "bg-secondary font-semibold text-secondary-foreground"
                        : "text-foreground hover:bg-muted/60"
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
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors active:scale-[0.98] md:text-sm ${
                        currentGudangId === wh.id
                          ? "bg-secondary font-semibold text-secondary-foreground"
                          : "text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-medium md:text-sm">
                          {wh.nama}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {wh.kota} • PIC: {wh.pic}
                        </div>
                      </div>
                      {wh.kritisCount > 0 && (
                        <Badge
                          variant="critical"
                          className="shrink-0 text-[10px]"
                        >
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
          <div className="inline-flex items-center rounded-full border border-border/50 bg-muted/60 p-1 text-xs">
            <button
              type="button"
              onClick={() => setDateRange("today")}
              className={`rounded-full px-3 py-1 font-medium transition-all active:scale-[0.98] ${
                dateRange === "today"
                  ? "border border-border/60 bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setDateRange("7d")}
              className={`rounded-full px-3 py-1 font-medium transition-all active:scale-[0.98] ${
                dateRange === "7d"
                  ? "border border-border/60 bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setDateRange("30d")}
              className={`rounded-full px-3 py-1 font-medium transition-all active:scale-[0.98] ${
                dateRange === "30d"
                  ? "border border-border/60 bg-card text-foreground shadow-xs"
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
              className="relative rounded-full border-border/80 bg-card text-foreground active:scale-[0.98]"
            >
              <BiBell className="size-4 text-foreground" />
              {totalExceptions > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 font-mono text-[10px] font-bold text-white shadow-xs">
                  {totalExceptions}
                </span>
              )}
            </Button>

            {/* Notification Drawer Popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 animate-in rounded-2xl border border-border/80 bg-popover p-4 shadow-xl fade-in-50 zoom-in-95 md:w-96">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <BiBell className="size-4 text-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Diagnostic Alerts
                    </span>
                  </div>
                  <Badge variant="critical" className="text-[10px]">
                    {totalExceptions} Actions Required
                  </Badge>
                </div>
                <div className="max-h-72 space-y-2 overflow-y-auto py-2 text-xs">
                  {totalExceptions > 0 ? (
                    <>
                      <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-700 dark:text-rose-300">
                        <BiErrorCircle className="mt-0.5 size-4 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            Stok Kritis Membutuhkan Restok
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Terdapat SKU barang dengan stok di bawah min_stok.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-300">
                        <BiFilterAlt className="mt-0.5 size-4 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            Approval Transaksi Menunggu
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Transaksi barang masuk/keluar/mutasi membutuhkan
                            persetujuan Owner.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                      <BiCheckCircle className="size-8 text-emerald-500" />
                      <p className="text-xs">
                        Tidak ada notifikasi kritis baru hari ini.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="hidden items-center gap-2.5 border-l border-border/60 pl-3 xl:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-secondary text-xs font-bold text-foreground">
              <BiUserCheck className="size-4" />
            </span>
            <div className="text-xs">
              <div className="font-medium text-foreground">
                {user?.name || "Pemilik Usaha"}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground">
                Owner / Super Admin
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
