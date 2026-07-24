"use client"

import { useState, useMemo, useCallback } from "react"

export interface MasterGudang {
  id: string
  nama: string
  kota: string
  pic: string
  alamat: string
  totalItem: number
  nilaiStok: number
  kapasitasPersen: number
  kritisCount: number
}

export interface StokKritisItem {
  id: string
  sku: string
  nama: string
  gudangId: string
  gudangNama: string
  stokSaatIni: number
  minStok: number
  satuan: string
  supplierTerakhir: string
  hargaBeli: number
}

export interface PendingApprovalItem {
  id: string
  kodeTransaksi: string
  tipe: "Barang Masuk" | "Barang Keluar" | "Mutasi Stok"
  gudangId: string
  gudangNama: string
  requester: string
  tanggal: string
  nilaiTotal: number
  totalItems: number
  catatan?: string
}

export interface SelisihOpnameItem {
  id: string
  kodeOpname: string
  gudangId: string
  gudangNama: string
  tanggal: string
  namaBarang: string
  sku: string
  stokSistem: number
  stokFisik: number
  selisih: number
  satuan: string
  nilaiSelisih: number
  petugas: string
}

export interface IzinPendingItem {
  id: string
  namaPetugas: string
  nip: string
  gudangId: string
  gudangNama: string
  tipe: "Izin" | "Cuti" | "Sakit"
  tanggalMulai: string
  tanggalSelesai: string
  alasan: string
}

export interface ActivityLogItem {
  id: string
  timestamp: string
  user: string
  role: string
  gudangNama: string
  aksi: string
  kategori: "masuk" | "keluar" | "mutasi" | "opname" | "absensi"
}

export interface RakStorageDetail {
  kodeRak: string
  kategori: string
  kapasitasMax: number
  terisi: number
  persen: number
  status: "Normal" | "Hampir Penuh" | "Overcapacity"
}

const MASTER_GUDANG_LIST: MasterGudang[] = [
  {
    id: "gudang-jakarta",
    nama: "Gudang Utama Jakarta",
    kota: "Jakarta Barat",
    pic: "Budi Santoso",
    alamat: "Jl. Daan Mogot Km 12 No. 8",
    totalItem: 1450,
    nilaiStok: 1250000000,
    kapasitasPersen: 82,
    kritisCount: 5,
  },
  {
    id: "gudang-bandung",
    nama: "Gudang Cabang Bandung",
    kota: "Bandung",
    pic: "Rian Hidayat",
    alamat: "Jl. Soekarno Hatta No. 450",
    totalItem: 920,
    nilaiStok: 680000000,
    kapasitasPersen: 68,
    kritisCount: 3,
  },
  {
    id: "gudang-surabaya",
    nama: "Gudang Hub Surabaya",
    kota: "Surabaya",
    pic: "Agus Pratama",
    alamat: "Jl. Raya Rungkut Industri No. 18",
    totalItem: 1180,
    nilaiStok: 940000000,
    kapasitasPersen: 91,
    kritisCount: 4,
  },
  {
    id: "gudang-medan",
    nama: "Gudang Transit Medan",
    kota: "Medan",
    pic: "Siti Aminah",
    alamat: "Jl. Yos Sudarso Km 6.5",
    totalItem: 410,
    nilaiStok: 310000000,
    kapasitasPersen: 45,
    kritisCount: 0,
  },
]

const INITIAL_STOK_KRITIS: StokKritisItem[] = [
  {
    id: "sk-1",
    sku: "BRG-ELK-001",
    nama: "Kabel Power Heavy Duty 3 Pin 1.8m",
    gudangId: "gudang-jakarta",
    gudangNama: "Gudang Utama Jakarta",
    stokSaatIni: 4,
    minStok: 25,
    satuan: "Pcs",
    supplierTerakhir: "PT Electro Utama Jaya",
    hargaBeli: 45000,
  },
  {
    id: "sk-2",
    sku: "BRG-PAK-044",
    nama: "Kardus Master Box Single Wall 40x30x30",
    gudangId: "gudang-jakarta",
    gudangNama: "Gudang Utama Jakarta",
    stokSaatIni: 12,
    minStok: 100,
    satuan: "Pcs",
    supplierTerakhir: "CV Packaging Mandiri",
    hargaBeli: 8500,
  },
  {
    id: "sk-3",
    sku: "BRG-OFF-019",
    nama: "Label Thermal Barcode 100x150mm (Roll 500)",
    gudangId: "gudang-bandung",
    gudangNama: "Gudang Cabang Bandung",
    stokSaatIni: 2,
    minStok: 15,
    satuan: "Roll",
    supplierTerakhir: "PT Print Label Express",
    hargaBeli: 62000,
  },
  {
    id: "sk-4",
    sku: "BRG-LOG-102",
    nama: "Pallet Plastik Heavy Duty 120x100cm",
    gudangId: "gudang-surabaya",
    gudangNama: "Gudang Hub Surabaya",
    stokSaatIni: 3,
    minStok: 10,
    satuan: "Unit",
    supplierTerakhir: "PT Indo Pallet Lestari",
    hargaBeli: 380000,
  },
  {
    id: "sk-5",
    sku: "BRG-SAF-008",
    nama: "Sarung Tangan Safety Rubberized Size L",
    gudangId: "gudang-jakarta",
    gudangNama: "Gudang Utama Jakarta",
    stokSaatIni: 5,
    minStok: 30,
    satuan: "Pasang",
    supplierTerakhir: "CV Safety First Indo",
    hargaBeli: 18500,
  },
]

const INITIAL_APPROVALS: PendingApprovalItem[] = [
  {
    id: "app-1",
    kodeTransaksi: "BM-20260724-009",
    tipe: "Barang Masuk",
    gudangId: "gudang-jakarta",
    gudangNama: "Gudang Utama Jakarta",
    requester: "Budi Santoso (Kepala Gudang)",
    tanggal: "2026-07-24 09:15",
    nilaiTotal: 42500000,
    totalItems: 85,
    catatan: "Penerimaan restok rutin komponen elektronik dari supplier PT Electro",
  },
  {
    id: "app-2",
    kodeTransaksi: "BK-20260724-014",
    tipe: "Barang Keluar",
    gudangId: "gudang-bandung",
    gudangNama: "Gudang Cabang Bandung",
    requester: "Rian Hidayat (Admin)",
    tanggal: "2026-07-24 10:02",
    nilaiTotal: 18200000,
    totalItems: 40,
    catatan: "Pengiriman barang ke distributor area Jawa Barat Order #ORD-8819",
  },
  {
    id: "app-3",
    kodeTransaksi: "MT-20260724-003",
    tipe: "Mutasi Stok",
    gudangId: "gudang-surabaya",
    gudangNama: "Gudang Hub Surabaya",
    requester: "Agus Pratama (Supervisor)",
    tanggal: "2026-07-24 10:30",
    nilaiTotal: 27800000,
    totalItems: 60,
    catatan: "Transfer stok darurat ke Gudang Cabang Bandung (Kebutuhan promo)",
  },
  {
    id: "app-4",
    kodeTransaksi: "BM-20260724-011",
    tipe: "Barang Masuk",
    gudangId: "gudang-medan",
    gudangNama: "Gudang Transit Medan",
    requester: "Siti Aminah (Staff)",
    tanggal: "2026-07-24 11:05",
    nilaiTotal: 12400000,
    totalItems: 25,
    catatan: "Barang retur customer dalam kondisi segel intact",
  },
  {
    id: "app-5",
    kodeTransaksi: "BK-20260724-019",
    tipe: "Barang Keluar",
    gudangId: "gudang-jakarta",
    gudangNama: "Gudang Utama Jakarta",
    requester: "Budi Santoso (Kepala Gudang)",
    tanggal: "2026-07-24 11:20",
    nilaiTotal: 64000000,
    totalItems: 120,
    catatan: "Delivery PO B2B Client PT Tekno Nusantara",
  },
]

const INITIAL_OPNAME: SelisihOpnameItem[] = [
  {
    id: "op-1",
    kodeOpname: "SO-20260723-01",
    gudangId: "gudang-jakarta",
    gudangNama: "Gudang Utama Jakarta",
    tanggal: "2026-07-23",
    namaBarang: "Adaptor Type-C Fast Charge 65W",
    sku: "BRG-ELK-088",
    stokSistem: 50,
    stokFisik: 47,
    selisih: -3,
    satuan: "Pcs",
    nilaiSelisih: -450000,
    petugas: "Eko Prasetyo",
  },
  {
    id: "op-2",
    kodeOpname: "SO-20260723-02",
    gudangId: "gudang-surabaya",
    gudangNama: "Gudang Hub Surabaya",
    tanggal: "2026-07-23",
    namaBarang: "Bubble Wrap Roll 1.25m x 50m",
    sku: "BRG-PAK-012",
    stokSistem: 30,
    stokFisik: 32,
    selisih: 2,
    satuan: "Roll",
    nilaiSelisih: 170000,
    petugas: "Dedi Kurniawan",
  },
]

const INITIAL_IZIN: IzinPendingItem[] = [
  {
    id: "iz-1",
    namaPetugas: "Dedi Kurniawan",
    nip: "PET-JKT-004",
    gudangId: "gudang-jakarta",
    gudangNama: "Gudang Utama Jakarta",
    tipe: "Izin",
    tanggalMulai: "2026-07-25",
    tanggalSelesai: "2026-07-25",
    alasan: "Urusan keluarga mendesak",
  },
  {
    id: "iz-2",
    namaPetugas: "Ahmad Rizky",
    nip: "PET-BDG-002",
    gudangId: "gudang-bandung",
    gudangNama: "Gudang Cabang Bandung",
    tipe: "Sakit",
    tanggalMulai: "2026-07-24",
    tanggalSelesai: "2026-07-26",
    alasan: "Demam tinggi & perawatan medis",
  },
  {
    id: "iz-3",
    namaPetugas: "Bambang Wijaya",
    nip: "PET-SBY-007",
    gudangId: "gudang-surabaya",
    gudangNama: "Gudang Hub Surabaya",
    tipe: "Cuti",
    tanggalMulai: "2026-07-28",
    tanggalSelesai: "2026-07-30",
    alasan: "Cuti tahunan",
  },
]

const INITIAL_ACTIVITIES: ActivityLogItem[] = [
  {
    id: "act-1",
    timestamp: "11:22 Hari ini",
    user: "Budi Santoso",
    role: "Kepala Gudang",
    gudangNama: "Gudang Utama Jakarta",
    aksi: "Membuat draft Barang Keluar BK-20260724-019 Rp 64.000.000",
    kategori: "keluar",
  },
  {
    id: "act-2",
    timestamp: "11:05 Hari ini",
    user: "Siti Aminah",
    role: "Staff Gudang",
    gudangNama: "Gudang Transit Medan",
    aksi: "Input Barang Masuk BM-20260724-011 (25 item retur)",
    kategori: "masuk",
  },
  {
    id: "act-3",
    timestamp: "10:30 Hari ini",
    user: "Agus Pratama",
    role: "Supervisor",
    gudangNama: "Gudang Hub Surabaya",
    aksi: "Pengajuan Mutasi Stok MT-20260724-003 ke Bandung",
    kategori: "mutasi",
  },
  {
    id: "act-4",
    timestamp: "09:45 Hari ini",
    user: "System Bot",
    role: "Automation",
    gudangNama: "Gudang Utama Jakarta",
    aksi: "Deteksi Stok Kritis: Kabel Power 3 Pin sisa 4 Pcs",
    kategori: "opname",
  },
  {
    id: "act-5",
    timestamp: "08:00 Hari ini",
    user: "18 Petugas Gudang",
    role: "Operational Staff",
    gudangNama: "Semua Gudang",
    aksi: "Clock-in Absensi Shift Pagi selesai (18 Hadir, 2 Izin/Cuti)",
    kategori: "absensi",
  },
]

export function useDashboardData(selectedWarehouseId: string | null) {
  const [stokKritisList] = useState<StokKritisItem[]>(INITIAL_STOK_KRITIS)
  const [approvalsList, setApprovalsList] = useState<PendingApprovalItem[]>(INITIAL_APPROVALS)
  const [opnameList] = useState<SelisihOpnameItem[]>(INITIAL_OPNAME)
  const [izinList, setIzinList] = useState<IzinPendingItem[]>(INITIAL_IZIN)
  const [activityFeed, setActivityFeed] = useState<ActivityLogItem[]>(INITIAL_ACTIVITIES)

  // Filtered queries based on selectedWarehouseId ("all" or null means all warehouses)
  const isAllWarehouses = !selectedWarehouseId || selectedWarehouseId === "all"

  const filteredStokKritis = useMemo(() => {
    if (isAllWarehouses) return stokKritisList
    return stokKritisList.filter((item) => item.gudangId === selectedWarehouseId)
  }, [stokKritisList, selectedWarehouseId, isAllWarehouses])

  const filteredApprovals = useMemo(() => {
    if (isAllWarehouses) return approvalsList
    return approvalsList.filter((item) => item.gudangId === selectedWarehouseId)
  }, [approvalsList, selectedWarehouseId, isAllWarehouses])

  const filteredOpname = useMemo(() => {
    if (isAllWarehouses) return opnameList
    return opnameList.filter((item) => item.gudangId === selectedWarehouseId)
  }, [opnameList, selectedWarehouseId, isAllWarehouses])

  const filteredIzin = useMemo(() => {
    if (isAllWarehouses) return izinList
    return izinList.filter((item) => item.gudangId === selectedWarehouseId)
  }, [izinList, selectedWarehouseId, isAllWarehouses])

  // Aggregate KPI Calculations
  const kpiData = useMemo(() => {
    if (isAllWarehouses) {
      const totalNilaiStok = MASTER_GUDANG_LIST.reduce((acc, g) => acc + g.nilaiStok, 0)
      return {
        totalNilaiStok,
        barangMasukUnits: 480,
        barangMasukRp: 185000000,
        barangKeluarUnits: 310,
        barangKeluarRp: 142000000,
        petugasHadir: 18,
        totalPetugas: 20,
      }
    }

    const currentGudang = MASTER_GUDANG_LIST.find((g) => g.id === selectedWarehouseId)
    const nilaiStok = currentGudang ? currentGudang.nilaiStok : 450000000
    return {
      totalNilaiStok: nilaiStok,
      barangMasukUnits: Math.round(nilaiStok * 0.0002),
      barangMasukRp: Math.round(nilaiStok * 0.12),
      barangKeluarUnits: Math.round(nilaiStok * 0.00015),
      barangKeluarRp: Math.round(nilaiStok * 0.09),
      petugasHadir: selectedWarehouseId === "gudang-jakarta" ? 7 : 4,
      totalPetugas: selectedWarehouseId === "gudang-jakarta" ? 8 : 5,
    }
  }, [selectedWarehouseId, isAllWarehouses])

  // Single Warehouse Storage Racks Breakdown
  const storageRacks = useMemo<RakStorageDetail[]>(() => {
    return [
      { kodeRak: "RAK-A1 (Elektronik)", kategori: "Elektronik & Kabel", kapasitasMax: 500, terisi: 440, persen: 88, status: "Hampir Penuh" },
      { kodeRak: "RAK-A2 (Sparepart)", kategori: "Komponen Mesin", kapasitasMax: 400, terisi: 280, persen: 70, status: "Normal" },
      { kodeRak: "RAK-B1 (Kemasan)", kategori: "Kardus & Plastik", kapasitasMax: 800, terisi: 785, persen: 98, status: "Overcapacity" },
      { kodeRak: "RAK-C1 (Tools)", kategori: "Peralatan Safety", kapasitasMax: 300, terisi: 135, persen: 45, status: "Normal" },
    ]
  }, [])

  // Quick Action Handlers
  const approveApproval = useCallback((id: string) => {
    setApprovalsList((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) {
        setActivityFeed((acts) => [
          {
            id: `act-${Date.now()}`,
            timestamp: "Baru saja",
            user: "Pemilik Usaha (Owner)",
            role: "Owner",
            gudangNama: item.gudangNama,
            aksi: `Menyetujui ${item.tipe} ${item.kodeTransaksi} (Rp ${item.nilaiTotal.toLocaleString("id-ID")})`,
            kategori: item.tipe === "Barang Masuk" ? "masuk" : item.tipe === "Barang Keluar" ? "keluar" : "mutasi",
          },
          ...acts,
        ])
      }
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  const rejectApproval = useCallback((id: string, reason: string) => {
    setApprovalsList((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) {
        setActivityFeed((acts) => [
          {
            id: `act-${Date.now()}`,
            timestamp: "Baru saja",
            user: "Pemilik Usaha (Owner)",
            role: "Owner",
            gudangNama: item.gudangNama,
            aksi: `Menolak ${item.tipe} ${item.kodeTransaksi} — Alasan: "${reason}"`,
            kategori: "mutasi",
          },
          ...acts,
        ])
      }
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  const approveIzin = useCallback((id: string) => {
    setIzinList((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const rejectIzin = useCallback((id: string) => {
    setIzinList((prev) => prev.filter((item) => item.id !== id))
  }, [])

  return {
    masterWarehouses: MASTER_GUDANG_LIST,
    isAllWarehouses,
    exceptionCounts: {
      stokKritis: filteredStokKritis.length,
      approvalPending: filteredApprovals.length,
      selisihOpname: filteredOpname.length,
      izinPending: filteredIzin.length,
      total: filteredStokKritis.length + filteredApprovals.length + filteredOpname.length + filteredIzin.length,
    },
    stokKritisList: filteredStokKritis,
    approvalsList: filteredApprovals,
    opnameList: filteredOpname,
    izinList: filteredIzin,
    kpiData,
    storageRacks,
    activityFeed,
    approveApproval,
    rejectApproval,
    approveIzin,
    rejectIzin,
  }
}
