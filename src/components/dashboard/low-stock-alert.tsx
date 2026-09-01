"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import type { Barang } from "@/types"
import { BiPackage, BiTrendingDown } from "react-icons/bi"
import Link from "next/link"

interface LowStockAlertProps {
  limit?: number // Default: show items below 10% of max_stok or min_stok threshold
}

export function LowStockAlert({ limit = 10 }: LowStockAlertProps) {
  const [lowStockItems, setLowStockItems] = useState<Barang[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchLowStockItems()
  }, [])

  const fetchLowStockItems = async () => {
    setIsLoading(true)
    try {
      // Fetch all barang items that have min_stok > 0
      const res = await fetch("/api/barang?filter_low_stock=true")
      const data = await res.json()
      
      if (data.success && data.data) {
        const items = Array.isArray(data.data) ? data.data : []
        
        // Filter items that are at or below minimum stock
        const lowStock = items.filter((item: Barang) => {
          const currentStok = item.stok_saat_ini || 0
          const minStok = item.min_stok || 0
          
          return minStok > 0 && currentStok <= minStok
        })
        
        setLowStockItems(lowStock)
      }
    } catch (error) {
      console.error("Error fetching low stock items:", error)
      setLowStockItems([])
    } finally {
      setIsLoading(false)
    }
  }

  if (!lowStockItems.length && !isLoading) {
    return null
  }

  const criticalCount = lowStockItems.filter(
    (item) => (item.stok_saat_ini || 0) === 0
  ).length

  return (
    <Card className="w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex flex-col px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-md p-2 dark:bg-red-900 ${
              criticalCount > 0 
                ? "bg-red-100" 
                : "bg-yellow-100"
            }`}>
              <BiTrendingDown className={`size-5 ${
                criticalCount > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-yellow-600 dark:text-yellow-400"
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                Stok Rendah
              </h3>
              <p className="text-xs text-muted-foreground">
                {criticalCount > 0 ? "Perlu Perhatian" : "Monitor"}
              </p>
            </div>
          </div>
          
          {criticalCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {criticalCount} Urgent
            </Badge>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-full animate-pulse rounded bg-card/50"></div>
                </div>
              ))}
            </div>
          ) : lowStockItems.length > 0 ? (
            <>
              {/* Show summary when many items */}
              {lowStockItems.length <= 2 ? (
                // Show items directly
                lowStockItems.map((item, index) => {
                  const stokSaatIni = item.stok_saat_ini || 0
                  const minStok = item.min_stok || 0
                  const percentage = minStok > 0 
                    ? Math.round((stokSaatIni / minStok) * 100) 
                    : 100

                  return (
                    <div
                      key={item.id ?? index}
                      className="group flex items-center justify-between rounded-lg border border-border/50 bg-card p-2 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`rounded-md p-1 ${
                          (item.stok_saat_ini || 0) === 0 
                            ? "bg-red-100 dark:bg-red-900" 
                            : percentage <= 50 
                              ? "bg-yellow-100 dark:bg-yellow-900"
                              : "bg-green-100 dark:bg-green-900"
                        }`}>
                          <BiPackage className={`size-3 ${
                            (item.stok_saat_ini || 0) === 0
                              ? "text-red-600 dark:text-red-400"
                              : percentage <= 50
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-green-600 dark:text-green-400"
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-sm text-foreground">
                            {item.nama}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Stok: {item.stok_saat_ini || 0} / Min: {minStok}
                            {percentage < 100 && ` (${percentage}%)`}
                          </p>
                        </div>
                      </div>
                      
                      <Link href={`/master/barang/${item.id}`}>
                        <Button size="sm" variant="ghost">
                          Lihat
                        </Button>
                      </Link>
                    </div>
                  )
                })
              ) : (
                // Show summary view
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {lowStockItems.length} item stok rendah
                    </span>
                    {criticalCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {criticalCount} Urgent
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded bg-red-50 p-2 dark:bg-red-950">
                      <p className="font-bold text-red-600 dark:text-red-400">
                        {criticalCount}
                      </p>
                      <p className="text-muted-foreground">Habis</p>
                    </div>
                    
                    <div className="rounded bg-yellow-50 p-2 dark:bg-yellow-950">
                      <p className="font-bold text-yellow-600 dark:text-yellow-400">
                        {lowStockItems.filter(i => 
                          (i.stok_saat_ini || 0) > 0 && 
                          (i.stok_saat_ini || 0) <= (i.min_stok || 0)
                        ).length
                      }
                      </p>
                      <p className="text-muted-foreground">Rendah</p>
                    </div>
                    
                    <div className="rounded bg-green-50 p-2 dark:bg-green-950">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {lowStockItems.filter(i => 
                          (i.stok_saat_ini || 0) > (i.min_stok || 0) &&
                          ((i.max_stok || 0) > 0) &&
                          ((i.stok_saat_ini || 0) >= (i.max_stok || 0) * 0.5)
                        ).length
                      }
                      </p>
                      <p className="text-muted-foreground">Aman</p>
                    </div>
                  </div>
                </div>
              )}
              
              {lowStockItems.length > 2 && (
                <Link href="/master/barang">
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Lihat Semua ({lowStockItems.length})
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tidak ada stok rendah yang terdeteksi.
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
