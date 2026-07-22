export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface Gudang {
  id: string
  nama: string
  alamat: string
  keterangan?: string
}

export interface Kategori {
  id: string
  nama: string
  deskripsi?: string
}

export interface Barang {
  id: string
  kode: string
  nama: string
  kategoriId: string
  satuan: string
  stok: number
  hargaBeli: number
  hargaJual: number
}

export interface Supplier {
  id: string
  nama: string
  alamat: string
  telepon: string
  email?: string
}

export interface Customer {
  id: string
  nama: string
  alamat: string
  telepon: string
  email?: string
}

export interface BarangMasuk {
  id: string
  tanggal: string
  gudangId: string
  supplierId: string
  items: BarangMasukItem[]
}

export interface BarangMasukItem {
  id: string
  barangId: string
  jumlah: number
  harga: number
}

export interface BarangKeluar {
  id: string
  tanggal: string
  gudangId: string
  customerId: string
  items: BarangKeluarItem[]
}

export interface BarangKeluarItem {
  id: string
  barangId: string
  jumlah: number
  harga: number
}

export interface Mutasi {
  id: string
  tanggal: string
  gudangAsalId: string
  gudangTujuanId: string
  items: MutasiItem[]
}

export interface MutasiItem {
  id: string
  barangId: string
  jumlah: number
}

export interface Opname {
  id: string
  tanggal: string
  gudangId: string
  items: OpnameItem[]
}

export interface OpnameItem {
  id: string
  barangId: string
  stokSistem: number
  stokFisik: number
  selisih: number
  keterangan?: string
}

export interface Petugas {
  id: string
  nama: string
  nip: string
  telepon: string
}

export interface JadwalShift {
  id: string
  petugasId: string
  tanggal: string
  shift: "pagi" | "siang" | "malam"
  jamMulai: string
  jamSelesai: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}
