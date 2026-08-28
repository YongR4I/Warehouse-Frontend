"use client"

import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import type { ApiResponse, DashboardData } from "@/types"

interface UseDashboardDataOptions {
  gudangId?: string
  chartRange?: "24h" | "7d" | "30d"
}

export function useDashboardData({
  gudangId,
  chartRange = "24h",
}: UseDashboardDataOptions = {}) {
  return useQuery({
    queryKey: ["dashboard", gudangId ?? "all", chartRange],
    queryFn: async () => {
      const params: Record<string, string> = { chart_range: chartRange }
      if (gudangId) {
        params.gudang_id = gudangId
      }
      const response = await api.get<ApiResponse<DashboardData>>("/dashboard", {
        params,
      })
      return response.data.data
    },
    refetchInterval: 30000,
    staleTime: 15000,
  })
}
