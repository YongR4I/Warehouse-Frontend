"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string
  value?: string
  onValueChange?: (val: string) => void
  children: React.ReactNode
  className?: string
}) {
  const [selectedTab, setSelectedTab] = React.useState(value || defaultValue || "")

  const activeTab = value !== undefined ? value : selectedTab

  const setActiveTab = React.useCallback(
    (val: string) => {
      setSelectedTab(val)
      onValueChange?.(val)
    },
    [onValueChange]
  )

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-full bg-muted/60 border border-border/50 p-1 text-muted-foreground shadow-xs",
        className
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")

  const isActive = context.activeTab === value

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3.5 py-1 text-xs md:text-sm font-medium transition-all duration-150 outline-none active:scale-[0.98]",
        isActive
          ? "bg-card text-foreground shadow-xs border border-border/60"
          : "hover:text-foreground hover:bg-background/50",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")

  if (context.activeTab !== value) return null

  return (
    <div
      className={cn(
        "mt-3 transition-opacity duration-200 animate-in fade-in-50",
        className
      )}
    >
      {children}
    </div>
  )
}
