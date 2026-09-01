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
  stok_saat_ini?: number
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
  // Kontrak v3: baris absensi bisa milik akun (user_id) ATAU karyawan
  // tanpa akun (petugas_id) — salah satu pasti terisi.
  user_id: number | null
  petugas_id?: number | null
  // Nama ternormalisasi dari BE: petugas.nama ?? user.name
  nama?: string | null
  gudang_id: number
  shift_id: number
  tanggal: string
  jam_masuk?: string | null
  jam_pulang?: string | null
  status: string
  // Kontrak v4 ([[TODO-ABSENSI-SCAN]]): audit sumber absen + flag lembur/dadakan
  // BE bisa kirim 0/1 (int) untuk boolean, jadi longgarkan type agar tidak mismatch
  sumber?: "qr" | "manual" | string | number | null
  di_luar_jadwal?: boolean | number | string | null
  lokasi_checkin?: string | null
  lokasi_checkout?: string | null
  radius_validasi?: number | null
  foto_masuk?: string | null
  foto_pulang?: string | null
  keterangan?: string | null
  approved_by?: number | null
  approved_at?: string | null
  user?: User | null
  petugas?: {
    id: number
    nama: string
    kode: string
    jabatan?: string | null
  } | null
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
  judul?: string
  pesan?: string
  tipe?: string
  priority?: string
  link?: string | null
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

export interface QrIssueData {
  payload: string
  version: number
  issued_at: string
}

export interface AbsensiScanUser {
  id: number
  name: string
  kode_petugas?: string | null
  no_pegawai?: string | null
  jabatan?: string | null
}

export type AbsensiScanTipe = "masuk" | "pulang" | "duplicate"

export type ScanIdentitasJenis = "petugas" | "user"

// Blok identitas ternormalisasi dari POST /absensi/scan (kontrak v3):
// sumber nama/kode/jabatan untuk UI scanner, terlepas dari subjek token.
export interface ScanIdentitas {
  jenis: ScanIdentitasJenis
  id: number
  nama: string
  kode?: string | null
  jabatan?: string | null
  no_pegawai?: string | null
}

export interface AbsensiScanResult {
  tipe: AbsensiScanTipe
  duplicate?: boolean
  identitas: ScanIdentitas
  petugas?: {
    id: number
    nama: string
    kode: string
    jabatan?: string | null
    status_operasional: PetugasStatusOperasional
  } | null
  // Backward-compat: hanya terisi jika token milik akun login (users).
  // Karyawan tanpa akun = null.
  user: AbsensiScanUser | null
  absensi: {
    id: number
    tanggal: string
    jam_masuk: string | null
    jam_pulang: string | null
    status: string
    sumber?: string | number | null
    di_luar_jadwal?: boolean | number | string | null
  } | null
  shift: {
    id: number
    nama: string
    jam_masuk: string
    jam_pulang: string
  } | null
  gudang: { id: number; nama: string } | null
}

export type IzinJenis = "izin" | "sakit" | "cuti"

export type IzinStatus = "menunggu" | "disetujui" | "ditolak" | "dibatalkan"

export interface IzinRequest {
  id: number
  // Kontrak portal-izin v2: subjek bisa akun (user_id) ATAU karyawan native
  // (petugas_id) — salah satu pasti terisi
  user_id: number | null
  petugas_id?: number | null
  nama?: string | null
  jenis: IzinJenis
  tanggal_mulai: string
  tanggal_selesai: string
  jumlah_hari?: number
  alasan?: string | null
  bukti?: string | null
  status: IzinStatus
  catatan_penolakan?: string | null
  approved_by?: number | null
  approved_at?: string | null
  user?: User | null
  petugas?: {
    id: number
    nama: string
    kode: string
    jabatan?: string | null
  } | null
  created_at?: string
  updated_at?: string
}

export interface IzinPayload {
  jenis: IzinJenis
  tanggal_mulai: string
  tanggal_selesai: string
  alasan: string
  bukti?: string
  // Kontrak izin-v2: hanya dipakai pemegang izin-edit (pengajuan atas nama)
  user_id?: number
}

export type PetugasStatusOperasional = "Aktif" | "Cuti" | "Non-Aktif"

// Petugas = master karyawan gudang (mandiri, tidak wajib punya akun login).
// user_id/user hanya terisi jika karyawan diberi akses sistem WMS.
export interface Petugas {
  id: number
  nama: string
  kode: string
  telepon?: string | null
  jabatan?: string | null
  area_kerja?: string | null
  tanggal_bergabung?: string | null
  status_operasional: PetugasStatusOperasional
  user_id?: number | null
  user?: User | null
  created_at?: string
  updated_at?: string
}

export interface PetugasPayload {
  nama: string
  kode?: string
  telepon?: string
  jabatan?: string
  area_kerja?: string
  tanggal_bergabung?: string
  status_operasional?: PetugasStatusOperasional
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

export interface JadwalShift {
  id: string
  petugasId: string
  tanggal: string
  shift: "pagi" | "siang" | "malam"
  jamMulai: string
  jamSelesai: string
}

export interface DashboardMetrics {
  total_barang: number
  total_stok: number
  total_nilai_stok: number
  total_gudang: number
  barang_masuk_bulan_ini: { qty: number; count: number }
  barang_keluar_bulan_ini: { qty: number; count: number }
  pending_approvals: number
}

export interface DashboardChartData {
  range: "24h" | "7d" | "30d"
  labels: string[]
  masuk: number[]
  keluar: number[]
}

export interface DashboardActivityLog {
  id: number
  waktu: string
  kategori: string
  petugas: string
  role: string
  gudang: string
  detail: string
  referensi: string
  status: string
}

export interface DashboardStokKritis {
  id: number
  sku: string
  nama: string
  stok_saat_ini: number
  min_stok: number
}

export interface DashboardPendingItem {
  id: number
  no_referensi: string
  tanggal: string
  gudang: string
  petugas: string
  total_qty?: number
  status?: string
  ada_selisih?: boolean
}

export interface DashboardAlerts {
  stok_kritis: DashboardStokKritis[]
  pending_masuk: DashboardPendingItem[]
  pending_opname: DashboardPendingItem[]
}

export interface DashboardWarehouseCapacity {
  id: number
  nama: string
  terisi: number
  kapasitas: number
  persen: number
}

export interface DashboardAttendanceShift {
  nama: string
  jam_masuk: string
  jam_pulang: string
  hadir: number
  total: number
}

export interface DashboardData {
  metrics: DashboardMetrics
  chart: DashboardChartData
  recent_activity: DashboardActivityLog[]
  alerts: DashboardAlerts
  warehouse_capacity: DashboardWarehouseCapacity[]
  attendance_today: DashboardAttendanceShift[]
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
  keterangan?: string | null
  user?: User | null
  gudang?: Gudang | null
  shift?: Shift | null
}

export interface AbsensiLaporanRow {
  id?: number
  user_id?: number
  gudang_id?: number
  shift_id?: number
  tanggal?: string
  jam_masuk?: string | null
  jam_pulang?: string | null
  status?: string
  keterangan?: string | null
  user_name?: string
  gudang_nama?: string
  shift_nama?: string
}

export interface LaporanRow {
  id: number
  no_referensi: string
  tanggal: string
  status: string
  total_qty: number
  supplier_nama?: string
  customer_nama?: string
  gudang_nama?: string
  status_label?: string
}
