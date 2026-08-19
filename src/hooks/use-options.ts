"use client"

import { useApiList } from "@/hooks/use-api"
import type { ApiResponse } from "@/types"

export interface OptionItem {
  id: number
  nama: string
  kode?: string
}

export function useOptions<T extends { id: number }>(
  key: string,
  url: string,
  enabled = true
) {
  const { data, isLoading, isError } = useApiList<T>({ key, url, enabled })
  const items = data?.data ?? []
  return { items, isLoading, isError, data }
}

export function toOptions<T extends { id: number; nama: string }>(
  items: T[]
): Array<{ value: string; label: string }> {
  return items.map((item) => ({ value: String(item.id), label: item.nama }))
}

export function toBarangOptions(
  items: Array<{ id: number; nama: string; sku?: string }>
) {
  return items.map((item) => ({
    value: String(item.id),
    label: `${item.sku ?? ""} - ${item.nama}`.trim(),
  }))
}

export function unwrap<T>(data: ApiResponse<T> | undefined): T | undefined {
  return data?.data
}

export function unwrapList<T>(data: ApiResponse<T[]> | undefined): T[] {
  return data?.data ?? []
}
