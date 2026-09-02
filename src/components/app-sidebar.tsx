"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  BiDownArrowCircle,
  BiUpArrowCircle,
  BiTransfer,
  BiClipboard,
  BiTimeFive,
  BiPackage,
  BiTag,
  BiBuildings,
  BiUser,
  BiCalendar,
  BiUserCheck,
  BiEditAlt,
  BiBarChartAlt2,
  BiError,
  BiUserPlus,
  BiChevronDown,
  BiHomeAlt,
  BiGridAlt,
} from "react-icons/bi"
import type { IconType } from "react-icons"
import { useAuthStore } from "@/store/use-auth-store"

interface NavItem {
  icon: IconType
  label: string
  path: string
  permission?: string
}

interface NavGroup {
  label: string
  icon?: IconType
  permission?: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Data Master",
    icon: BiPackage,
    items: [
      { icon: BiPackage, label: "Daftar Barang & SKU", path: "/master/barang", permission: "barang-list" },
      {
        icon: BiTag,
        label: "Kategori & Satuan Unit",
        path: "/master/kategori",
        permission: "kategori-list",
      },
      {
        icon: BiBuildings,
        label: "Daftar Gudang & Rak",
        path: "/master/gudang",
        permission: "gudang-list",
      },
      { icon: BiUser, label: "Supplier & Customer", path: "/master/supplier", permission: "supplier-list" },
    ],
  },
  {
    label: "Aktivitas Gudang",
    icon: BiClipboard,
    items: [
      {
        icon: BiDownArrowCircle,
        label: "Terima Barang (In)",
        path: "/inventory/barang-masuk",
        permission: "barang-masuk-list",
      },
      {
        icon: BiUpArrowCircle,
        label: "Keluarkan Barang (Out)",
        path: "/inventory/barang-keluar",
        permission: "barang-keluar-list",
      },
      {
        icon: BiTransfer,
        label: "Mutasi Antar Gudang",
        path: "/inventory/mutasi",
        permission: "mutasi-stok-list",
      },
      { icon: BiClipboard, label: "Stok Opname", path: "/inventory/opname", permission: "stok-opname-list" },
      {
        icon: BiTimeFive,
        label: "Kartu Stok & Riwayat",
        path: "/inventory/stok",
        permission: "kartu-stok-list",
      },
    ],
  },
  {
    label: "SDM & Kehadiran",
    icon: BiUserCheck,
    permission: "absensi-list",
    items: [
      {
        icon: BiUser,
        label: "Daftar Petugas",
        path: "/absensi/petugas",
        permission: "petugas-list",
      },
      {
        icon: BiCalendar,
        label: "Jadwal Shift",
        path: "/absensi/jadwal-shift",
        permission: "jadwal-petugas-list",
      },
      {
        icon: BiUserCheck,
        label: "Presensi Harian",
        path: "/absensi/presensi",
        permission: "absensi-list",
      },
      { icon: BiEditAlt, label: "Cuti & Izin", path: "/absensi/cuti-izin", permission: "izin-list" },
    ],
  },
  {
    label: "Pusat Laporan",
    icon: BiBarChartAlt2,
    items: [
      {
        icon: BiBarChartAlt2,
        label: "Pergerakan Stok",
        path: "/pergerakan-stok",
        permission: "laporan-stok",
      },
      { icon: BiError, label: "Selisih Opname", path: "/selisih-opname", permission: "laporan-stok-opname" },
      { icon: BiUserPlus, label: "Rekap Kehadiran", path: "/absensi/rekap", permission: "laporan-absensi" },
    ],
  },
]

const dashboardItem: NavItem = {
  icon: BiHomeAlt,
  label: "Dashboard",
  path: "/dashboard",
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const sidebarRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = React.useState(false)
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    new Set(navGroups.map((g) => g.label))
  )
  const hasPermission = useAuthStore((state) => state.hasPermission)

  const toggleGroup = React.useCallback((label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }, [])

  React.useEffect(() => {
    const sidebarElement = sidebarRef.current
    const contentElement = contentRef.current

    if (!sidebarElement || !contentElement) return

    const handleWheel = (e: WheelEvent) => {
      // Prevent default page/website scrolling when mouse is over the sidebar
      e.preventDefault()
      e.stopPropagation()

      // Scroll only the sidebar content area
      contentElement.scrollTop += e.deltaY
    }

    // Attach non-passive wheel event listener so e.preventDefault() works to block page scrolling
    sidebarElement.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      sidebarElement.removeEventListener("wheel", handleWheel)
    }
  }, [])

  return (
    <Sidebar
      ref={sidebarRef}
      collapsible="none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "sticky top-0 flex h-svh w-[260px] flex-col overflow-hidden border-r border-border/40 bg-sidebar transition-shadow duration-200 select-none",
        isHovered && "z-20 shadow-md"
      )}
    >
      <SidebarHeader className="shrink-0 px-5 pt-5 pb-5">
        <div className="flex items-center gap-2">
          <div className="flex gap-[3px]">
            <div className="h-[10px] w-[3px] rounded-sm bg-foreground" />
            <div className="h-[18px] w-[3px] rounded-sm bg-foreground" />
            <div className="h-[18px] w-[3px] rounded-sm bg-foreground" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-foreground">
            Sabiru Warehouse
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent
        ref={contentRef}
        className="min-h-0 flex-1 [scrollbar-width:thin] gap-0 overflow-y-auto overscroll-contain px-3 [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
      >
        {/* Dashboard — Special Featured Nav Item */}
        <SidebarGroup className="pt-2 pb-3">
          <button
            type="button"
            onClick={() => router.push(dashboardItem.path)}
            className={cn(
              "group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 active:scale-[0.98]",
              pathname === dashboardItem.path
                ? "bg-foreground font-semibold text-background shadow-xs"
                : "border border-border/70 bg-muted/30 text-foreground hover:border-border hover:bg-muted/70"
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                  pathname === dashboardItem.path
                    ? "bg-background/20 text-background"
                    : "border border-border/40 bg-background text-foreground shadow-2xs"
                )}
              >
                <BiGridAlt className="size-4" />
              </span>
              <div className="flex flex-col items-start text-left">
                <span className="text-xs leading-none font-bold tracking-tight">
                  Dashboard
                </span>
                <span
                  className={cn(
                    "mt-1 text-[10px] leading-none font-medium",
                    pathname === dashboardItem.path
                      ? "text-background/70"
                      : "text-muted-foreground"
                  )}
                >
                  Overview
                </span>
              </div>
            </div>
          </button>
        </SidebarGroup>

        {navGroups
          .filter((group) => !group.permission || hasPermission(group.permission))
          .map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.permission || hasPermission(item.permission)
            )
            if (visibleItems.length === 0) return null
            const isExpanded = expandedGroups.has(group.label)

          return (
            <SidebarGroup key={group.label} className="pt-2 pb-0">
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center gap-2 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/50 uppercase transition-colors hover:text-muted-foreground/80"
              >
                {group.icon && <group.icon className="!size-[20px] shrink-0" />}
                <span className="flex-1 text-left">{group.label}</span>
                <BiChevronDown
                  className={cn(
                    "!size-[20px] shrink-0 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {visibleItems.map((item) => (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton
                            onClick={() => router.push(item.path)}
                            className={cn(
                              "h-8 gap-2.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors",
                              "hover:bg-muted/60 hover:text-foreground"
                            )}
                          >
                            <item.icon className="!size-[18px] shrink-0" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </div>
              </div>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}