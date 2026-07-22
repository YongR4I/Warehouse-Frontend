import { create } from "zustand"

interface DSBState {
  selectedWarehouse: string | null
  setSelectedWarehouse: (id: string | null) => void
}

export const useDSBStore = create<DSBState>()((set) => ({
  selectedWarehouse: null,
  setSelectedWarehouse: (id) => set({ selectedWarehouse: id }),
}))
