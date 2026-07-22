import { create } from "zustand"
import { persist } from "zustand/middleware"

interface BarcodeScan {
  code: string
  timestamp: number
}

interface ScanBufferState {
  buffer: BarcodeScan[]
  isScanning: boolean
  addToBuffer: (code: string) => void
  clearBuffer: () => void
  setScanning: (isScanning: boolean) => void
}

export const useScanBufferStore = create<ScanBufferState>()(
  persist(
    (set, get) => ({
      buffer: [],
      isScanning: false,
      addToBuffer: (code) =>
        set({ buffer: [...get().buffer, { code, timestamp: Date.now() }] }),
      clearBuffer: () => set({ buffer: [] }),
      setScanning: (isScanning) => set({ isScanning }),
    }),
    {
      name: "scan-buffer-storage",
    }
  )
)
