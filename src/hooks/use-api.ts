"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { ApiResponse, PaginatedResponse } from "@/types"

interface UseApiOptions {
  key: string
  url: string
  params?: Record<string, unknown>
  enabled?: boolean
}

export function useApiList<T>({ key, url, params, enabled = true }: UseApiOptions) {
  return useQuery({
    queryKey: [key, params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<T>>(url, { params })
      return response.data
    },
    enabled,
  })
}

export function useApiDetail<T>({ key, url, enabled = true }: UseApiOptions) {
  return useQuery({
    queryKey: [key],
    queryFn: async () => {
      const response = await api.get<ApiResponse<T>>(url)
      return response.data
    },
    enabled,
  })
}

export function useApiCreate<T, D>(key: string, url: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: D) => {
      const response = await api.post<ApiResponse<T>>(url, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] })
    },
  })
}

export function useApiUpdate<T, D>(key: string, url: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: D }) => {
      const response = await api.put<ApiResponse<T>>(`${url}/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] })
    },
  })
}

export function useApiDelete(key: string, url: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number | string) => {
      const response = await api.delete<ApiResponse<null>>(`${url}/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] })
    },
  })
}

export function useApiAction(key: string, url: string, action = "approve") {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number | string) => {
      const response = await api.post<ApiResponse<unknown>>(`${url}/${id}/${action}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [key] })
    },
  })
}