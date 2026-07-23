"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  BiStar,
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
  BiShieldQuarter,
  BiCog,
  BiPulse,
  BiHelpCircle,
} from "react-icons/bi"
import { Button } from "@/components/ui/button"
import type { IconType } from "react-icons"

interface NavItem {
  icon: IconType
  label: string
}

interface NavGroup {
  label: string
  icon?: IconType
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Aktivitas Gudang",
    items: [
      { icon: BiDownArrowCircle, label: "Terima Barang (In)" },
      { icon: BiUpArrowCircle, label: "Keluarkan Barang (Out)" },
      { icon: BiTransfer, label: "Mutasi Antar Gudang" },
      { icon: BiClipboard, label: "Stok Opname" },
      { icon: BiTimeFive, label: "Kartu Stok & Riwayat" },
    ],
  },
  {
    label: "Data Master",
    items: [
      { icon: BiPackage, label: "Daftar Barang & SKU" },
      { icon: BiTag, label: "Kategori & Satuan Unit" },
      { icon: BiBuildings, label: "Daftar Gudang & Rak" },
      { icon: BiUser, label: "Supplier & Customer" },
    ],
  },
  {
    label: "SDM & Kehadiran",
    items: [
      { icon: BiCalendar, label: "Jadwal Shift" },
      { icon: BiUserCheck, label: "Presensi Harian" },
      { icon: BiEditAlt, label: "Cuti & Izin" },
    ],
  },
  {
    label: "Pusat Laporan",
    items: [
      { icon: BiBarChartAlt2, label: "Pergerakan Stok" },
      { icon: BiError, label: "Selisih Opname" },
      { icon: BiUserPlus, label: "Rekap Kehadiran" },
    ],
  },
  {
    label: "Pengaturan Sistem",
    items: [
      { icon: BiShieldQuarter, label: "Pengguna & Hak Akses" },
      { icon: BiCog, label: "Konfigurasi Gudang & PIC" },
      { icon: BiPulse, label: "Log Aktivitas" },
    ],
  },
]

export function AppSidebar() {
  const sidebarRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = React.useState(false)

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
        "sticky top-0 h-svh w-[260px] flex flex-col border-r border-border/40 bg-white transition-shadow duration-200 overflow-hidden select-none",
        isHovered && "z-20 shadow-md"
      )}
    >
      <SidebarHeader className="px-5 pt-5 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-[3px]">
            <div className="h-[18px] w-[3px] rounded-sm bg-foreground" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-foreground">
            Warehouse
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent
        ref={contentRef}
        className="gap-0 px-3 min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
      >
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="pt-2 pb-0">
            <SidebarGroupLabel className="flex items-center gap-2 px-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground/50 uppercase">
              {group.icon && <group.icon className="!size-[14px]" />}
              <span>{group.label}</span>
            </SidebarGroupLabel>
            {group.items.length > 0 && (
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
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
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4 shrink-0">
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <BiHelpCircle className="!size-[18px] text-blue-600" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-foreground">
                Butuh Bantuan?
              </span>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Hubungi tim support atau baca dokumentasi penggunaan.
              </p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-[12px] font-medium text-blue-600"
              >
                Buka Pusat Bantuan
              </Button>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

