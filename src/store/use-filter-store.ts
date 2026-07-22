import { create } from "zustand"

interface FilterState {
  search: string
  gudang: string | null
  kategori: string | null
  dateFrom: string | null
  dateTo: string | null
  setSearch: (search: string) => void
  setGudang: (gudang: string | null) => void
  setKategori: (kategori: string | null) => void
  setDateRange: (from: string | null, to: string | null) => void
  resetFilters: () => void
}

const initialState = {
  search: "",
  gudang: null,
  kategori: null,
  dateFrom: null,
  dateTo: null,
}

export const useFilterStore = create<FilterState>()((set) => ({
  ...initialState,
  setSearch: (search) => set({ search }),
  setGudang: (gudang) => set({ gudang }),
  setKategori: (kategori) => set({ kategori }),
  setDateRange: (dateFrom, dateTo) => set({ dateFrom, dateTo }),
  resetFilters: () => set(initialState),
}))
