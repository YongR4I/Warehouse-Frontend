# Warehouse Frontend

Frontend untuk sistem manajemen gudang (warehouse management system) berbasis **Next.js 16** (App Router) + **Tailwind CSS v4** + **shadcn/ui** (base-rhea style).

Backend API: [rafi30-boop/warehouse-be](https://github.com/rafi30-boop/warehouse-be)

## Fitur

- Auth: login, register, logout, refresh token otomatis (interceptor axios)
- Route guard + permission-based UI (tombol/aksi disembunyikan sesuai role)
- Master data: Gudang, Kategori, Satuan, Barang, Supplier, Customer, Lokasi Rak
- Transaksi stok: Barang Masuk, Barang Keluar, Mutasi Stok, Stok Opname (dengan alur persetujuan)
- Kartu stok, stok per gudang
- Absensi: petugas, jadwal shift, presensi, rekap
- Laporan: pergerakan stok, selisih opname, ekspor Excel
- Dashboard KPI, notifikasi (toast sonner), pengaturan user & role
- Bahasa: Indonesia

## Persyaratan

- Node.js 20.9+ (disarankan 22+)
- Backend `warehouse-be` berjalan di `http://localhost:8000`

## Instalasi

```bash
# 1. Clone repository
git clone https://github.com/YongR4I/Warehouse-Frontend.git
cd Warehouse-Frontend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# pastikan NEXT_PUBLIC_API_URL menunjuk ke API backend
# contoh: NEXT_PUBLIC_API_URL=http://localhost:8000/api

# 4. Jalankan dev server
npm run dev
# buka http://localhost:3000
```

## Akun Default (hasil seeder backend)

| Role       | Email                  | Password   |
|------------|------------------------|------------|
| Super Admin| superadmin@example.com | password   |
| Admin      | admin@example.com      | password   |
| Operator   | operator@example.com   | password   |

## Perintah

```bash
npm run dev         # dev server (localhost:3000)
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm run format      # Prettier
```

## Struktur

- `src/app/(dashboard)/` — halaman yang dilindungi (master, inventory, absensi, laporan, pengaturan)
- `src/app/(auth)/` — halaman publik (login, register)
- `src/components/` — komponen UI (shadcn/ui + komponen fitur per modul)
- `src/store/` — state management Zustand (auth, filter, scan buffer)
- `src/hooks/` — React Query wrappers (useApiList, useApiCreate, dll.)
- `src/lib/api.ts` — axios instance + interceptor refresh token
- `src/types/index.ts` — tipe data sesuai skema API backend