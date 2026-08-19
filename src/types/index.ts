export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

export interface ApiMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiMeta
}

export interface Permission {
  id: number
  name: string
  guard_name: string
}

export interface Role {
  id: number
  name: string
  guard_name: string
  permissions?: Permission[]
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  name: string
  email: string
  gudang_id: number | null
  no_pegawai?: string | null
  telepon?: string | null
  foto?: string | null
  is_active: boolean
  last_login_at?: string | null
  roles?: Role[]
  gudang?: Gudang | null
  created_at?: string
  updated_at?: string
}

export interface Gudang {
  id: number
  kode?: string
  nama: string
  alamat?: string | null
  pic?: string | null
  telepon?: string | null
  latitude?: number | null
  longitude?: number | null
  status?: string
  created_at?: string
  updated_at?: string
}

export interface Kategori {
  id: number
  parent_id?: number | null
  nama: string
  deskripsi?: string | null
  created_at?: string
  updated_at?: string
}

export interface Satuan {
  id: number
  nama: string
  singkatan?: string
  created_at?: string
  updated_at?: string
}

export interface Barang {
  id: number
  sku: string
  barcode?: string | null
  nama: string
  kategori_id: number
  satuan_id: number
  min_stok?: number
  max_stok?: number
  berat?: number | null
  foto?: string | null
  harga_beli?: number
  harga_jual?: number
  deskripsi?: string | null
  status?: string
  kategori?: Kategori | null
  satuan?: Satuan | null
  created_at?: string
  updated_at?: string
}

export interface Supplier {
  id: number
  kode: string
  tipe?: string
  nama: string
  kontak?: string | null
  telepon?: string | null
  email?: string | null
  alamat?: string | null
  npwp?: string | null
  created_at?: string
  updated_at?: string
}

export interface Customer {
  id: number
  kode: string
  tipe?: string
  nama: string
  kontak?: string | null
  telepon?: string | null
  email?: string | null
  alamat?: string | null
  npwp?: string | null
  created_at?: string
  updated_at?: string
}

export interface LokasiRak {
  id: number
  gudang_id: number
  kode_rak: string
  zona?: string | null
  kapasitas?: number | null
  deskripsi?: string | null
  status?: string
  gudang?: Gudang | null
  created_at?: string
  updated_at?: string
}

export interface BatchBarang {
  id: number
  barang_id: number
  batch_number: string
  expired_date?: string | null
  qty?: number
  barang?: Barang | null
  created_at?: string
  updated_at?: string
}

export interface HistoryHarga {
  id: number
  barang_id: number
  harga_beli: number
  harga_jual: number
  tanggal_efektif: string
  created_by?: number
  barang?: Barang | null
  created_at?: string
  updated_at?: string
}

export interface BarangMasukDetailItem {
  id?: number
  barang_id: number
  lokasi_rak_id?: number | null
  qty: number
  harga_satuan?: number
  expired_at?: string | null
  barang?: Barang | null
  lokasi_rak?: LokasiRak | null
}

export interface BarangMasuk {
  id: number
  no_referensi: string
  nomor_surat_jalan?: string | null
  gudang_id: number
  supplier_id: number
  tanggal: string
  keterangan?: string | null
  status: string
  created_by?: number | null
  approved_by?: number | null
  approved_at?: string | null
  dokumen?: string | null
  details?: BarangMasukDetailItem[]
  gudang?: Gudang | null
  supplier?: Supplier | null
  createdBy?: User | null
  approvedBy?: User | null
  created_at?: string
  updated_at?: string
}

export interface BarangKeluarDetailItem {
  id?: number
  barang_id: number
  lokasi_rak_id?: number | null
  qty: number
  harga_satuan?: number
  barang?: Barang | null
  lokasi_rak?: LokasiRak | null
}

export interface BarangKeluar {
  id: number
  no_referensi: string
  nomor_surat_jalan?: string | null
  gudang_id: number
  customer_id: number
  tanggal: string
  keterangan?: string | null
  status: string
  created_by?: number | null
  approved_by?: number | null
  approved_at?: string | null
  delivered_by?: number | null
  delivered_at?: string | null
  dokumen?: string | null
  details?: BarangKeluarDetailItem[]
  gudang?: Gudang | null
  customer?: Customer | null
  createdBy?: User | null
  approvedBy?: User | null
  deliveredBy?: User | null
  created_at?: string
  updated_at?: string
}

export interface MutasiStok {
  id: number
  no_referensi: string
  barang_id?: number | null
  gudang_asal_id: number
  gudang_tujuan_id: number
  lokasi_rak_asal_id?: number | null
  lokasi_rak_tujuan_id?: number | null
  qty?: number | null
  tanggal: string
  keterangan?: string | null
  status: string
  created_by?: number | null
  approved_by?: number | null
  approved_at?: string | null
  details?: MutasiDetailItem[]
  gudang_asal?: Gudang | null
  gudang_tujuan?: Gudang | null
  barang?: Barang | null
  createdBy?: User | null
  approvedBy?: User | null
  created_at?: string
  updated_at?: string
}

export interface MutasiDetailItem {
  id?: number
  barang_id: number
  qty: number
  barang?: Barang | null
}

export interface StokOpnameDetailItem {
  id?: number
  barang_id: number
  stok_sistem?: number
  stok_fisik?: number
  selisih?: number
  keterangan?: string | null
  barang?: Barang | null
}

export interface StokOpname {
  id: number
  no_referensi: string
  gudang_id: number
  tanggal: string
  keterangan?: string | null
  status: string
  created_by?: number | null
  approved_by?: number | null
  approved_at?: string | null
  details?: StokOpnameDetailItem[]
  gudang?: Gudang | null
  createdBy?: User | null
  approvedBy?: User | null
  created_at?: string
  updated_at?: string
}

export interface KartuStok {
  id: number
  barang_id: number
  gudang_id?: number | null
  lokasi_rak_id?: number | null
  tipe: string
  qty: number
  saldo_sebelum: number
  saldo_sesudah: number
  referensi_type?: string | null
  referensi_id?: number | null
  keterangan?: string | null
  created_by?: number | null
  barang?: Barang | null
  gudang?: Gudang | null
  created_at?: string
  updated_at?: string
}

export interface Shift {
  id: number
  nama: string
  jam_masuk: string
  jam_pulang: string
  toleransi_masuk?: number
  toleransi_pulang?: number
  status?: string
  created_at?: string
  updated_at?: string
}

export interface Absensi {
  id: number
  user_id: number
  gudang_id: number
  shift_id: number
  tanggal: string
  jam_masuk?: string | null
  jam_pulang?: string | null
  status: string
  lokasi_checkin?: string | null
  lokasi_checkout?: string | null
  radius_validasi?: number | null
  foto_masuk?: string | null
  foto_pulang?: string | null
  keterangan?: string | null
  approved_by?: number | null
  approved_at?: string | null
  user?: User | null
  gudang?: Gudang | null
  shift?: Shift | null
  created_at?: string
  updated_at?: string
}

export interface JadwalPetugas {
  id: number
  user_id: number
  shift_id: number
  tanggal: string
  created_by?: number | null
  user?: User | null
  shift?: Shift | null
  created_at?: string
  updated_at?: string
}

export interface Notifikasi {
  id: number
  user_id?: number
  title?: string
  message?: string
  type?: string
  is_read?: boolean
  read_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface AktivitasLog {
  id: number
  user_id?: number | null
  modul?: string
  aksi?: string
  deskripsi?: string | null
  data?: unknown
  ip_address?: string | null
  user_agent?: string | null
  user?: User | null
  created_at?: string
  updated_at?: string
}

export interface UploadResult {
  url: string
  path: string
  name: string
}

export interface LaporanStokRow {
  barang_id: number
  sku?: string
  nama?: string
  kategori?: string
  satuan?: string
  gudang?: string
  total_stok?: number
  min_stok?: number
  nilai_stok?: number
  status?: string
}

export interface LaporanRow {
  id?: number
  no_referensi?: string
  tanggal?: string
  gudang?: string
  supplier?: string
  customer?: string
  status?: string
  total_qty?: number
  total_nilai?: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface GudangPayload {
  kode: string
  nama: string
  alamat?: string
  pic?: string
  telepon?: string
  latitude?: number
  longitude?: number
  status?: string
}

export interface KategoriPayload {
  parent_id?: number
  nama: string
  deskripsi?: string
}

export interface SatuanPayload {
  nama: string
  singkatan: string
}

export interface BarangPayload {
  sku: string
  barcode?: string
  nama: string
  kategori_id: number
  satuan_id: number
  min_stok?: number
  max_stok?: number
  berat?: number
  foto?: string
  harga_beli?: number
  harga_jual?: number
  deskripsi?: string
  status?: string
}

export interface SupplierPayload {
  kode: string
  tipe?: string
  nama: string
  kontak?: string
  telepon?: string
  email?: string
  alamat?: string
  npwp?: string
}

export interface CustomerPayload {
  kode: string
  tipe?: string
  nama: string
  kontak?: string
  telepon?: string
  email?: string
  alamat?: string
  npwp?: string
}

export interface LokasiRakPayload {
  gudang_id: number
  kode_rak: string
  zona?: string
  kapasitas?: number
  deskripsi?: string
  status?: string
}

export interface BatchBarangPayload {
  barang_id: number
  batch_number: string
  expired_date?: string
  qty?: number
}

export interface ShiftPayload {
  nama: string
  jam_masuk: string
  jam_pulang: string
  toleransi_masuk?: number
  toleransi_pulang?: number
  status?: string
}

export interface AbsensiPayload {
  user_id: number
  gudang_id: number
  shift_id: number
  tanggal: string
  jam_masuk?: string
  jam_pulang?: string
  status: string
  lokasi_checkin?: string
  lokasi_checkout?: string
  radius_validasi?: number
  foto_masuk?: string
  foto_pulang?: string
  keterangan?: string
}

export interface JadwalPetugasPayload {
  user_id: number
  shift_id: number
  tanggal: string
}

export interface BarangMasukPayload {
  no_referensi: string
  nomor_surat_jalan?: string
  gudang_id: number
  supplier_id: number
  tanggal: string
  keterangan?: string
  dokumen?: string
  details: Array<{
    barang_id: number
    lokasi_rak_id?: number
    qty: number
    harga_satuan?: number
    expired_at?: string
  }>
}

export interface BarangKeluarPayload {
  no_referensi: string
  nomor_surat_jalan?: string
  gudang_id: number
  customer_id: number
  tanggal: string
  keterangan?: string
  dokumen?: string
  details: Array<{
    barang_id: number
    lokasi_rak_id?: number
    qty: number
    harga_satuan?: number
  }>
}

export interface MutasiStokPayload {
  no_referensi: string
  barang_id?: number
  gudang_asal_id: number
  gudang_tujuan_id: number
  lokasi_rak_asal_id?: number
  lokasi_rak_tujuan_id?: number
  qty?: number
  tanggal: string
  keterangan?: string
  details?: Array<{ barang_id: number; qty: number }>
}

export interface StokOpnamePayload {
  no_referensi: string
  gudang_id: number
  tanggal: string
  keterangan?: string
  details?: Array<{
    barang_id: number
    stok_sistem?: number
    stok_fisik?: number
    keterangan?: string
  }>
}

export interface UserPayload {
  name: string
  email: string
  password?: string
  gudang_id?: number
  no_pegawai?: string
  telepon?: string
  foto?: string
  is_active?: boolean
  roles?: string[]
}

export interface RolePayload {
  name: string
  permissions?: string[]
}

export interface Petugas {
  id: number
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
