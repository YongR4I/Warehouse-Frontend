# Pola Halaman Detail (Detail Page Pattern)

> Dokumentasi ini menjelaskan arsitektur, komponen, dan flow dari halaman **Detail Barang Masuk** (`src/app/(dashboard)/inventory/barang-masuk/detail/[id]/page.tsx`) sebagai referensi untuk membuat halaman detail serupa (barang keluar, mutasi, stok opname, dll.).

---

## 1. Struktur Route

Halaman detail selalu berada di dalam folder halaman list-nya, dengan segment dinamis `[id]`:

```
src/app/(dashboard)/inventory/
  barang-masuk/
    page.tsx            → halaman list
    detail/
      [id]/page.tsx     → halaman detail (baru)
  barang-keluar/
    page.tsx
    detail/
      [id]/page.tsx     → contoh halaman baru (ikuti pola yang sama)
  mutasi/
    detail/[id]/page.tsx
  ...
```

### URL Pattern

```
/inventory/barang-masuk/detail/BM-2026070001
/inventory/barang-keluar/detail/BK-2026070014
/inventory/mutasi/detail/MU-2026070001
```

**Penting:** `[id]` berisi **nomor referensi** dokumen (contoh: `BM-2026070001`), bukan id numerik database. Sesuaikan dengan prefix tiap modul (BM = Barang Masuk, BK = Barang Keluar, MU = Mutasi, dst.).

### Membaca `params` di Next.js 16

Di halaman **client component**, `params` dari prop adalah Promise dan `use(Promise.resolve(params))` **tidak didukung** (error: "suspended by an uncached promise"). Gunakan hook **`useParams()`** dari `next/navigation`:

```tsx
import { useParams } from "next/navigation"

export default function DetailPage() {
  const noReferensi = useParams<{ id: string }>().id
  ...
}
```

> Catatan: pola `use(Promise.resolve(params))` (yang dipakai `opname/[id]` sebelumnya) sudah diganti ke `useParams()` — jangan dipakai lagi untuk halaman baru.

---

## 2. Layout Halaman (4 Section)

```
┌──────────────────────────────────────┐
│ wrapper                              │  ← Section 1: Header
│ ├─ PageHeader                        │
│ │  breadcrumb + title + description  │
│ └─ Button (opsional, kanan atas)     │
├──────────────────────────────────────┤
│ wrapper mt-8                          │  ← Section 2: Metadata Grid
│ └─ grid rounded-2xl border bg-card    │
│    (No. Referensi, Gudang, Supplier,  │
│     Tanggal, Status, Dokumen)         │
├──────────────────────────────────────┤
│ wrapper mt-[50px]                     │  ← Section 3: Filter Bar
│ └─ InputSearch (pencarian item)       │
├──────────────────────────────────────┤
│ wrapper mt-[25px]                     │  ← Section 4: Table Item
│ └─ Table + pagination + summary total │
└──────────────────────────────────────┘
```

---

## 3. Component Tree Lengkap

```
DetailPage
├── div.wrapper (header)
│   ├── div.flex.flex-col.gap-4.sm:flex-row.sm:items-end.justify-between
│   │   ├── PageHeader
│   │   │   props: { items, title, icon, description }
│   │   │   → breadcrumb: [Modul, Nama Halaman (link ke list), noReferensi]
│   │   │   → description: "Dibuat oleh {nama} · {tanggal} · {waktu}"
│   │   └── Button variant="outline-black" (aksi opsional, mis. Unduh Dokumen)
│
├── div.wrapper.mt-8 (metadata grid)
│   └── div.grid.grid-cols-2.md:grid-cols-3.gap-x-8.gap-y-4
│       .rounded-2xl.border.border-border/50.bg-card.p-6
│       └── div[] (setiap metadata)
│           ├── div.text-xs.text-muted-foreground.font-medium  → label
│           └── div.text-sm.font-bold.text-foreground.mt-1     → value
│           (status pakai <ColoredBadge>)
│
├── div.wrapper.mt-[50px] (filter bar)
│   └── div.flex.items-center.gap-3
│       └── InputSearch placeholder="Cari nama barang, SKU, atau lokasi rak..."
│           className="flex-1" + value/onChange + setCurrentPage(1)
│
└── div.wrapper.mt-[25px] (table)
    └── div.rounded-xl.border.border-border/60.bg-card.overflow-hidden
        └── div.overflow-x-auto
            └── table.w-full
                ├── TableHeader (bg-white border-b)
                │   └── TableRow h-14 → TableHead[]
                ├── TableBody
                │   └── TableRow h-16 → TableCell[]
                │       (SKU & Info Barang: nama bold + sku • kategori muted)
                │       Empty state: colSpan + h-48 text-center
                │       Spacer: height (perPage - length) * 64
                └── TableFooter
                    └── pagination (prev, angka, next) + "10 per halaman"
    └── div.wrapper.mt-[25px] (opsional summary)
        └── total item + total nilai
```

---

## 4. Komponen yang Tersedia

### 4.1 PageHeader (`@/components/page-header`)
```ts
interface BreadcrumbItem { label: string; href?: string }
interface PageHeaderProps {
  items: BreadcrumbItem[]
  title: string
  icon?: IconType       // dari react-icons, contoh: BiDownArrowCircle
  description?: string
}
```

### 4.2 ColoredBadge (`@/components/ui/colored-badge`)
```ts
interface ColoredBadgeProps { color: "blue"|"red"|"yellow"|"green"|"purple"|"sky"|"gray" }
```
Dipakai untuk status: `green` (disetujui), `yellow` (menunggu), `red` (ditolak), `gray` (draft).

### 4.3 InputSearch (`@/components/input` → `InputSearch`)
- Wrapper shadcn `Input` + icon `BiSearch`, height fixed 43px.

### 4.4 Table (`@/components/ui/table`)
- Ekspor: `Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableFooter`
- Pada halaman detail, gunakan `<table>` mentah di dalam `div.rounded-xl.border...` agar pagination fleksibel (pola `opname/[id]`).

### 4.5 Button (`@/components/ui/button`)
- Variants: `default`, `outline`, `secondary`, `ghost`, `outline-black`, `destructive`, `link`.

---

## 5. Import Pattern (wajib diikuti)

```tsx
import { useState, useMemo, use } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { BiDownArrowCircle } from "react-icons/bi"      // icon menyesuaikan modul
import {
  TableHeader, TableBody, TableHead, TableRow, TableCell, TableFooter,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
```

---

## 6. Penyesuaian Konten per Modul

> Inilah inti dari guide ini: konten detail page **selalu menyesuaikan modul**. Ganti field pada tabel berikut:

| Modul | URL | Breadcrumb (link tengah) | Label Gudang | Pihak Terkait | Metadata Grid | Kolom Item Table |
|---|---|---|---|---|---|---|
| Barang Masuk | `/inventory/barang-masuk/detail/[id]` | Terima Barang (In) | Gudang Asal | Supplier | No. Referensi, Gudang Asal, Supplier, Tanggal, Status, Dokumen | SKU & Info Barang, Lokasi Rak, Satuan, Qty Diterima, Harga Satuan, Total |
| Barang Keluar | `/inventory/barang-keluar/detail/[id]` | Keluar Barang (Out) | Gudang Tujuan | Customer | No. Referensi, Gudang Tujuan, Customer, Tanggal, Status, Dokumen | SKU & Info Barang, Lokasi Rak, Satuan, Qty Keluar, Harga Satuan, Total |
| Mutasi | `/inventory/mutasi/detail/[id]` | Mutasi Stok | Gudang Asal → Tujuan | (tidak ada) | No. Referensi, Gudang Asal, Gudang Tujuan, Tanggal, Status, Dokumen | SKU & Info Barang, Lokasi Rak, Satuan, Qty Mutasi, Stok Sistem |
| Stok Opname | `/inventory/opname/[id]` | Stok Opname | Lokasi Gudang | Petugas Audit | No. Referensi, Lokasi, Tanggal, Petugas | (sudah ada — jangan tumpang tindih) |

### Mapping per modul:

- **Barang Masuk (`BM-`)**: gudang asal + supplier, item = qty diterima + harga satuan.
- **Barang Keluar (`BK-`)**: gudang tujuan + customer, item = qty keluar + harga satuan.
- **Mutasi (`MU-`)**: gudang asal → gudang tujuan (2 field), item = qty mutasi (tanpa harga).
- **Stok Opname (`OP-`)**: sudah ada pola sendiri (`opname/[id]`), jangan ubah.

### Ikon per modul (`react-icons/bi`):
- Barang Masuk: `BiDownArrowCircle`
- Barang Keluar: `BiUpArrowCircle`
- Mutasi: `BiTransfer` / `BiRightArrowAlt`
- Opname: `BiClipboard`

---

## 7. State Management & API Integration (Production)

Halaman contoh menggunakan **dummy data** (`detailInfo` + `detailItems` berbentuk `Record<string, ...>` yang di-lookup berdasarkan `noReferensi`). Untuk production, gunakan:

### React Query Hooks (`@/hooks/use-api`)
```ts
import { useApiDetail } from "@/hooks/use-api"

const { data, isLoading } = useApiDetail<BarangMasuk>({
  key: "barang-masuk",
  url: `/barang-masuk/${noReferensi}`,   // endpoint detail
})
```

### NotFound State
```tsx
if (!info) {
  return (
    <div className="flex h-96 flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Dokumen Tidak Ditemukan</h2>
      <Button variant="default" onClick={() => router.push("/inventory/barang-masuk")}>
        Kembali ke List
      </Button>
    </div>
  )
}
```

### Response Types
```ts
ApiResponse<T>       → { data: T; message: string; success: boolean }
PaginatedResponse<T> → { data: T[]; meta: { currentPage, totalPages, totalItems, itemsPerPage } }
```

---

## 8. Konvensi Styling

### Spacing
- Antar section: `mt-8` (header→metadata), `mt-[50px]` (metadata→filter), `mt-[25px]` (filter→table).
- Padding halaman disediakan oleh layout (`px-14 py-10`).

### Metadata Grid
| Elemen | Style |
|--------|-------|
| Container | `grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 rounded-2xl border border-border/50 bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]` |
| Label | `text-xs text-muted-foreground font-medium` |
| Value | `text-sm font-bold text-foreground mt-1` |
| Status | `<ColoredBadge>` dengan `mt-1.5` |

### Tabel
| Elemen | Style |
|--------|-------|
| Wrapper | `rounded-xl border border-border/60 bg-card overflow-hidden` |
| TableHeader row | `h-14 hover:bg-transparent bg-white border-b border-border/60` |
| TableHead | `text-xs font-semibold text-foreground normal-case tracking-normal whitespace-nowrap` |
| TableBody row | `h-16 hover:bg-muted/30 border-b border-border/40` |
| SKU & Info Barang | nama: `text-sm font-semibold leading-none`; kode: `text-xs text-muted-foreground mt-1` |
| Kolom angka (qty/harga) | `text-center` (qty) / `text-right` (harga) + `font-sans tabular-nums` |
| Empty state | `colSpan={N} h-48 text-center text-muted-foreground` |
| Footer | `border-t border-border/50 bg-white`, `h-14 px-6 flex justify-between text-xs` |
| Currency | `new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })` |

### Ikon
- Semua dari `react-icons/bi` (BoxIcons), **bukan** lucide-react.

---

## 9. Template Cepat (Copy-paste ready)

```tsx
"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { BiDownArrowCircle } from "react-icons/bi"
import {
  TableHeader, TableBody, TableHead, TableRow, TableCell, TableFooter,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
// import { useApiDetail } from "@/hooks/use-api"   // jika real API

// ── GANTI: dummy info per dokumen ────────────────────────────
const detailInfo: Record<string, any> = {
  "REF-0001": { gudang: "...", pihak: "...", tanggal: "...", waktu: "...", dibuatOleh: "...", status: "disetujui", dokumen: "2 file" },
}

// ── GANTI: dummy items ────────────────────────────────────────
const detailItems: Record<string, any[]> = {
  "REF-0001": [
    { sku: "SKU-001", nama: "Barang A", kategori: "Kategori", rak: "A-01-01", satuan: "Pcs", qty: 10, hargaSatuan: 100000 },
  ],
}

export default function DetailPage() {
  const router = useRouter()
  const noReferensi = useParams<{ id: string }>().id

  const info = detailInfo[noReferensi]
  const items = detailItems[noReferensi] || []

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return items.filter((row) => !query || row.nama.toLowerCase().includes(query) || row.sku.toLowerCase().includes(query))
  }, [items, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredData.slice(start, start + itemsPerPage)
  }, [filteredData, currentPage])

  if (!info) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Dokumen Tidak Ditemukan</h2>
        <Button variant="default" onClick={() => router.push("/inventory/barang-masuk")}>
          Kembali ke List
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="wrapper">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <PageHeader
            items={[
              { label: "Aktivitas Gudang" },
              { label: "Nama Halaman", href: "/inventory/{modul}" },
              { label: noReferensi },
            ]}
            title={noReferensi}
            icon={BiDownArrowCircle}
            description={`Dibuat oleh ${info.dibuatOleh} · ${info.tanggal} · ${info.waktu}`}
          />
          <Button variant="outline-black">Unduh Dokumen</Button>
        </div>
      </div>

      <div className="wrapper mt-8 grid grid-cols-2 gap-x-8 gap-y-4 rounded-2xl border border-border/50 bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)] md:grid-cols-3">
        {/* GANTI: sesuaikan field dengan modul (lihat tabel section 6) */}
        <div>
          <div className="text-xs font-medium text-muted-foreground">No. Referensi</div>
          <div className="mt-1 text-sm font-bold text-foreground">{noReferensi}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">Gudang Asal</div>
          <div className="mt-1 text-sm font-bold text-foreground">{info.gudang}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground">Status</div>
          <div className="mt-1.5">
            <ColoredBadge color="green">{info.status}</ColoredBadge>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-3">
          <InputSearch
            placeholder="Cari nama barang, SKU, atau lokasi rak..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            className="flex-1"
          />
        </div>
      </div>

      <div className="wrapper mt-[25px]">
        <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <TableHeader className="border-b border-border/60 bg-white">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="pl-6 ...">SKU & Informasi Barang</TableHead>
                  <TableHead className="...">Lokasi Rak</TableHead>
                  <TableHead className="...">Satuan</TableHead>
                  <TableHead className="text-center ...">Qty</TableHead>
                  <TableHead className="pr-6 text-right ...">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row) => (
                  <TableRow key={row.sku} className="h-16 border-b border-border/40 hover:bg-muted/30">
                    <TableCell className="pl-6 whitespace-nowrap">
                      <div className="text-sm leading-none font-semibold text-foreground">{row.nama}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{row.sku}</div>
                    </TableCell>
                    <TableCell className="...">{row.rak}</TableCell>
                    <TableCell className="...">{row.satuan}</TableCell>
                    <TableCell className="text-center ...">{row.qty}</TableCell>
                    <TableCell className="pr-6 text-right ...">{row.qty * row.hargaSatuan}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="border-t border-border/50 bg-white">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="p-0 align-middle">
                    {/* salin pola pagination dari barang-masuk/detail/[id] */}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
```

---

## 10. Checklist Implementasi Halaman Detail Baru

- [ ] Buat folder `src/app/(dashboard)/inventory/{modul}/detail/[id]/`
- [ ] Salin `page.tsx` dari `barang-masuk/detail/[id]` (atau gunakan template section 9)
- [ ] Sesuaikan dengan tabel **section 6**:
  - [ ] Prefix no. referensi (BM/BK/MU) + ikon modul
  - [ ] Label gudang (Asal / Tujuan / Asal→Tujuan)
  - [ ] Pihak terkait (Supplier / Customer / tanpa)
  - [ ] Kolom item table sesuai modul
- [ ] Breadcrumb tengah mengarah ke halaman list modul
- [ ] Dummy data dibuat dalam bentuk `Record<string, ...>` (info + items)
- [ ] Jangan lupa NotFound state jika id tidak ketemu
- [ ] Link tombol chevron di halaman list: `router.push(\`/inventory/{modul}/detail/${row.noReferensi}\`)`
- [ ] Run `npm run typecheck` dan `npm run lint` setelah selesai

---

## 11. Catatan Pengembangan ke Depan

- **Fitur "Disetujui oleh" (Approval)**: untuk saat ini metadata menampilkan "Dibuat oleh". Saat fitur approval hadir, tambahkan field `disetujuiOleh` ke metadata grid dan header description.
- **Real API**: ganti dummy `detailInfo`/`detailItems` dengan `useApiDetail` (lihat section 7).
