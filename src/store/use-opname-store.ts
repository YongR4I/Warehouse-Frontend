import { create } from "zustand"

export interface OpnameSession {
  id: string
  noDokumen: string
  tanggal: string
  tanggalLabel: string
  lokasi: string
  scope: string
  totalSku: string
  varianceVal: string
  varianceType: "red" | "green" | "orange" | "none"
  petugas: string
  status: "Dalam Proses" | "Selesai" | "Draft"
  aksiType: "lanjutkan" | "detail" | "mulai"
}

export interface OpnameDetailItem {
  id: string
  name: string
  sku: string
  category: string
  rak: string
  satuan: string
  stokSistem: number
  stokFisik: number
  selisih: number
  reasonCode: string
  catatan: string
  cost: number // used to calculate financial valuation
}

interface OpnameStore {
  sessions: OpnameSession[]
  details: Record<string, OpnameDetailItem[]>
  addSession: (session: OpnameSession, items?: OpnameDetailItem[]) => void
  updateDetailItem: (
    noDokumen: string,
    itemId: string,
    updates: Partial<OpnameDetailItem>
  ) => void
  startAudit: (noDokumen: string) => void
  finalizeSession: (noDokumen: string) => void
}

const initialSessions: OpnameSession[] = [
  {
    id: "1",
    noDokumen: "SO-202608-001",
    tanggal: "05 Agu 2026",
    tanggalLabel: "05 Agu 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Semua Item",
    totalSku: "6 SKU",
    varianceVal: "4 SKU (-2.4M)",
    varianceType: "red",
    petugas: "Budi Santoso",
    status: "Dalam Proses",
    aksiType: "lanjutkan",
  },
  {
    id: "2",
    noDokumen: "SO-202608-002",
    tanggal: "04 Agu 2026",
    tanggalLabel: "04 Agu 2026",
    lokasi: "Gudang Bahan Baku (GDG-02)",
    scope: "Rak C1 - C4",
    totalSku: "3 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Ahmad Dahlan",
    status: "Dalam Proses",
    aksiType: "lanjutkan",
  },
  {
    id: "3",
    noDokumen: "SO-202607-010",
    tanggal: "31 Jul 2026",
    tanggalLabel: "31 Jul 2026",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Kategori Semen",
    totalSku: "3 SKU",
    varianceVal: "1 SKU (+150k)",
    varianceType: "orange",
    petugas: "Rina Wijaya",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "4",
    noDokumen: "SO-202607-009",
    tanggal: "25 Jul 2026",
    tanggalLabel: "25 Jul 2026",
    lokasi: "Gudang Transit (GDG-03)",
    scope: "Semua Item",
    totalSku: "3 SKU",
    varianceVal: "0 SKU (Match)",
    varianceType: "green",
    petugas: "Budi Santoso",
    status: "Selesai",
    aksiType: "detail",
  },
  {
    id: "5",
    noDokumen: "SO-202608-003",
    tanggal: "08 Agu 2026",
    tanggalLabel: "08 Agu 2026 (Plan)",
    lokasi: "Gudang Utama (GDG-01)",
    scope: "Perkakas & Tools",
    totalSku: "3 SKU",
    varianceVal: "Belum Audit",
    varianceType: "none",
    petugas: "Siti Rahma",
    status: "Draft",
    aksiType: "mulai",
  },
]

const defaultDetailItems: OpnameDetailItem[] = [
  {
    id: "1",
    name: "Semen Gresik 50kg",
    sku: "SKU-BGN-001",
    category: "Material Bangunan",
    rak: "RAK-A1-02",
    satuan: "Zak",
    stokSistem: 150,
    stokFisik: 150,
    selisih: 0,
    reasonCode: "Tidak ada selisih",
    catatan: "",
    cost: 75000,
  },
  {
    id: "2",
    name: "Cat Tembok Dulux White 5L",
    sku: "SKU-BGN-002",
    category: "Cat & Finishing",
    rak: "RAK-B2-05",
    satuan: "Pail",
    stokSistem: 45,
    stokFisik: 45,
    selisih: 0,
    reasonCode: "Tidak ada selisih",
    catatan: "",
    cost: 200000,
  },
  {
    id: "3",
    name: "Besi Beton 10mm x 12m",
    sku: "SKU-BGN-003",
    category: "Logam & Besi",
    rak: "RAK-R-OUT-01",
    satuan: "Batang",
    stokSistem: 300,
    stokFisik: 300,
    selisih: 0,
    reasonCode: "Tidak ada selisih",
    catatan: "",
    cost: 120000,
  },
]

// Specialized 6 items for SO-202608-001 to match image/stats
const so001DetailItems: OpnameDetailItem[] = [
  {
    id: "1",
    name: "Semen Gresik 50kg",
    sku: "SKU-BGN-001",
    category: "Material Bangunan",
    rak: "RAK-A1-02",
    satuan: "Zak",
    stokSistem: 150,
    stokFisik: 148,
    selisih: -2,
    reasonCode: "Barang Rusak",
    catatan: "Kemasan bocor 2 zak",
    cost: 75000,
  },
  {
    id: "2",
    name: "Cat Tembok Dulux White 5L",
    sku: "SKU-BGN-002",
    category: "Cat & Finishing",
    rak: "RAK-B2-05",
    satuan: "Pail",
    stokSistem: 45,
    stokFisik: 45,
    selisih: 0,
    reasonCode: "Tidak ada selisih",
    catatan: "",
    cost: 200000,
  },
  {
    id: "3",
    name: "Besi Beton 10mm x 12m",
    sku: "SKU-BGN-003",
    category: "Logam & Besi",
    rak: "RAK-R-OUT-01",
    satuan: "Batang",
    stokSistem: 300,
    stokFisik: 305,
    selisih: 5,
    reasonCode: "Salah Catat",
    catatan: "Sisa pengerjaan proyek kemarin",
    cost: 120000,
  },
  {
    id: "4",
    name: "Paku Kayu 5cm",
    sku: "SKU-BGN-004",
    category: "Material Bangunan",
    rak: "RAK-A2-01",
    satuan: "Dus",
    stokSistem: 100,
    stokFisik: 95,
    selisih: -5,
    reasonCode: "Salah Catat",
    catatan: "Salah hitung waktu inbound",
    cost: 580000, // selected to sum up to -2.45M valuation variance
  },
  {
    id: "5",
    name: "Kawat Beton 1mm",
    sku: "SKU-BGN-005",
    category: "Logam & Besi",
    rak: "RAK-R-OUT-02",
    satuan: "Roll",
    stokSistem: 50,
    stokFisik: 50,
    selisih: 0,
    reasonCode: "Tidak ada selisih",
    catatan: "",
    cost: 100000,
  },
  {
    id: "6",
    name: "Pipa PVC Rucika 3 Inch",
    sku: "SKU-BGN-006",
    category: "Sanitary",
    rak: "RAK-C3-01",
    satuan: "Batang",
    stokSistem: 20,
    stokFisik: 20,
    selisih: 0,
    reasonCode: "Tidak ada selisih",
    catatan: "",
    cost: 90000,
  },
]

export const useOpnameStore = create<OpnameStore>()((set) => ({
  sessions: initialSessions,
  details: {
    "SO-202608-001": so001DetailItems,
    "SO-202608-002": [
      { ...defaultDetailItems[0], stokFisik: 150, selisih: 0 },
      { ...defaultDetailItems[1], stokFisik: 45, selisih: 0 },
      { ...defaultDetailItems[2], stokFisik: 300, selisih: 0 },
    ],
    "SO-202607-010": [
      {
        ...defaultDetailItems[0],
        stokFisik: 152,
        selisih: 2,
        reasonCode: "Salah Catat",
      },
      { ...defaultDetailItems[1], stokFisik: 45, selisih: 0 },
      { ...defaultDetailItems[2], stokFisik: 300, selisih: 0 },
    ],
    "SO-202607-009": [
      { ...defaultDetailItems[0], stokFisik: 150, selisih: 0 },
      { ...defaultDetailItems[1], stokFisik: 45, selisih: 0 },
      { ...defaultDetailItems[2], stokFisik: 300, selisih: 0 },
    ],
    "SO-202608-003": [
      { ...defaultDetailItems[0], stokFisik: 150, selisih: 0 },
      { ...defaultDetailItems[1], stokFisik: 45, selisih: 0 },
      { ...defaultDetailItems[2], stokFisik: 300, selisih: 0 },
    ],
  },
  addSession: (session, items) => {
    set((state) => {
      const itemsList = items || defaultDetailItems.map((it) => ({ ...it }))
      return {
        sessions: [session, ...state.sessions],
        details: {
          ...state.details,
          [session.noDokumen]: itemsList,
        },
      }
    })
  },
  updateDetailItem: (noDokumen, itemId, updates) => {
    set((state) => {
      const sessionItems = state.details[noDokumen] || []
      const updatedItems = sessionItems.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, ...updates }
          // Recalculate selisih if stokFisik is updated
          if (updates.stokFisik !== undefined) {
            updated.selisih = updated.stokFisik - updated.stokSistem
          }
          return updated
        }
        return item
      })
      return {
        details: {
          ...state.details,
          [noDokumen]: updatedItems,
        },
      }
    })
  },
  startAudit: (noDokumen) => {
    set((state) => {
      const updatedSessions = state.sessions.map((sess) => {
        if (sess.noDokumen === noDokumen) {
          return {
            ...sess,
            status: "Dalam Proses" as const,
            aksiType: "lanjutkan" as const,
          }
        }
        return sess
      })
      return { sessions: updatedSessions }
    })
  },
  finalizeSession: (noDokumen) => {
    set((state) => {
      const sessionItems = state.details[noDokumen] || []
      const totalItems = sessionItems.length
      const diffItems = sessionItems.filter((i) => i.selisih !== 0).length

      // Calculate financial valuation variance
      const valuationVariance = sessionItems.reduce(
        (sum, item) => sum + item.selisih * item.cost,
        0
      )

      let varianceVal = "0 SKU (Match)"
      let varianceType: "red" | "green" | "orange" | "none" = "green"

      if (diffItems > 0) {
        const valText =
          valuationVariance < 0
            ? `-${Math.abs(valuationVariance / 1000000).toFixed(1)}M`
            : `+${(valuationVariance / 1000).toFixed(0)}k`
        varianceVal = `${diffItems} SKU (${valText})`
        varianceType = valuationVariance < 0 ? "red" : "orange"
      }

      const updatedSessions = state.sessions.map((sess) => {
        if (sess.noDokumen === noDokumen) {
          return {
            ...sess,
            status: "Selesai" as const,
            aksiType: "detail" as const,
            totalSku: `${totalItems} SKU`,
            varianceVal,
            varianceType,
          }
        }
        return sess
      })

      return { sessions: updatedSessions }
    })
  },
}))
