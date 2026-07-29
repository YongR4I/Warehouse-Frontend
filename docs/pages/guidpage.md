# Pola Halaman Laporan (Report Page Pattern)

> Dokumentasi ini menjelaskan arsitektur, komponen, dan flow dari halaman **Pergerakan Stok** (`src/app/(dashboard)/(laporan)/pergerakan-stok/page.tsx`) sebagai referensi untuk membuat halaman serupa.

---

## 1. Struktur Route

Semua halaman laporan diletakkan di dalam folder `(dashboard)/(laporan)`:

```
src/app/(dashboard)/(laporan)/
  layout.tsx          → (opsional, bisa shared layout per grup)
  pergerakan-stok/
    page.tsx          → halaman contoh
  barang-masuk/       → halaman baru (ikuti pola yang sama)
  barang-keluar/      → halaman baru
  ...
```

Halaman otomatis mendapat layout dari:
- `(dashboard)/layout.tsx` → `BasicLayout` (sidebar + header + main `px-14 py-10`)

---

## 2. Layout Halaman (3 Section)

Setiap halaman laporan memiliki 3 section utama dengan spacing tetap:

```
┌─────────────────────────────────────┐
│  wrapper (tanpa className spesifik)  │  ← Section 1: Header
│  ┌─ PageHeader                      │
│  │  breadcrumb > title + icon > desc│
│  └─ Button group (export + action)   │
├─────────────────────────────────────┤
│  wrapper mt-[50px]                   │  ← Section 2: Filter Bar
│  └─ InputSearch + Opsion + Opsion   │
├─────────────────────────────────────┤
│  wrapper mt-[25px]                   │  ← Section 3: Table
│  └─ Table > THeader + TBody + TFoot │
└─────────────────────────────────────┘
```

---

## 3. Component Tree Lengkap

```
LaporanPage
├── div.wrapper (header)
│   ├── div.flex.items-end.justify-between
│   │   ├── PageHeader
│   │   │   props: { items, title, icon, description }
│   │   │   → breadcrumb nav uppercase dengan ">" separator
│   │   │   → icon (react-icons/bi) + h1 title
│   │   │   → optional description (text-[#857F78])
│   │   └── div.flex.items-center.gap-2.mt-4 (button group)
│   │       ├── Button variant="outline-black"
│   │       │   ukuran: w-[181.42px] h-[42px] rounded-[12px]
│   │       └── Button variant="default"
│   │           teks: "+ {Action Label}"
│
├── div.wrapper.mt-[50px] (filter bar)
│   └── div.flex.items-center.gap-2
│       ├── InputSearch placeholder="..." className="flex-1"
│       │   → BiSearch icon + Input shadcn, h-[43px]
│       └── Opsion (Gudang)
│       │   → Select shadcn, w-[158.47px], h-[42px]
│       │   → options: { value, label }[], placeholder default "Semua Gudang"
│       └── Opsion (Status / filter lain)
│           → placeholder="Semua Status" explicit
│
└── div.wrapper.mt-[25px] (table)
    └── Table (rounded-xl border border-border/60 bg-card)
        ├── TableHeader (bg-white border-b border-border/60)
        │   └── TableRow h-14 hover:bg-transparent
        │       └── TableHead[]
        │           → text-xs font-semibold text-foreground normal-case tracking-normal
        │           → kolom terakhir: pr-6 text-right "Aksi"
        │           → kolom tengah (status/dokumen): text-center
        │           → kolom pertama: pl-6
        ├── TableBody (min-h-[300px])
        │   └── TableRow[] h-16 hover:bg-muted/30 border-b border-border/40
        │       └── TableCell[]
        │           → text-sm font-sans text-foreground
        │           → kolom tanggal: text-muted-foreground
        │           → kolom status: text-center + <StatusBadge status={...} />
        │           → kolom dokumen: text-center, conditional render
        │           → kolom aksi: pr-6 text-right, 2 button icon
        │             ● BiChevronRight + BiDotsVerticalRounded
        │             ● style: p-1 hover:bg-muted rounded-md
        │       Render rute:
        │         <div className="flex items-center gap-1.5">
        │           <span>{asal}</span>
        │           <BiRightArrowAlt className="size-4 text-muted-foreground shrink-0" />
        │           <span>{tujuan}</span>
        │         </div>
        │   Empty state (jika data < 5 baris):
        │     <TableRow height={300 - (length * 64)}>
        │       <TableCell colSpan={N} />
        │     </TableRow>
        └── TableFooter (border-t border-border/50 bg-white)
            └── TableRow hover:bg-transparent
                └── TableCell colSpan={N} p-0
                    └── div.h-14.px-6.flex.items-center.justify-between
                        ├── "Menampilkan {start}-{end} dari {total} data"
                        ├── Pagination: border border-border/80 rounded-lg overflow-hidden
                        │   button prev, page numbers, button next
                        └── "{perPage} per halaman"
```

---

## 4. Komponen yang Tersedia

### 4.1 PageHeader (`@/components/page-header`)
```ts
interface BreadcrumbItem { label: string; href?: string }
interface PageHeaderProps {
  items: BreadcrumbItem[]
  title: string
  icon?: IconType       // dari react-icons, contoh: BiBarChartAlt2
  description?: string
}
```

### 4.2 InputSearch (`@/components/input` → `InputSearch`)
- Wrapper shadcn `Input` + icon `BiSearch`
- `React.ComponentProps<"input">` → semua prop input native
- Height fixed `43px`, spacing: pl-10 pr-3.5

### 4.3 Opsion (`@/components/opsion` → `Opsion`)
```ts
interface OpsionOption { value: string; label: string }
interface OpsionProps {
  options: OpsionOption[]
  placeholder?: string    // default "Semua Gudang"
  value?: string
  onValueChange?: (value: string | null) => void
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  name?: string
  className?: string
}
```
- Width fixed `158.47px`, height `42px`, `"use client"`
- Jika ingin placeholder berbeda, kirim `placeholder="..."` explicit

### 4.4 StatusBadge (`@/components/badge` → `StatusBadge`)
```ts
type Status = "disetujui" | "menunggu_approval" | "ditolak" | "draft"
interface StatusBadgeProps { status: Status; className?: string }
```
| Status | Label | Variant |
|--------|-------|---------|
| `disetujui` | Disetujui | `success` (hijau) |
| `menunggu_approval` | Menunggu Approval | `warning` (amber, custom border/warna) |
| `ditolak` | Ditolak | `destructive` (merah) |
| `draft` | Draft | `neutral` (abu-abu) |

### 4.5 Button (`@/components/ui/button`)
- Variants: `default`, `outline`, `secondary`, `ghost`, `outline-black`, `destructive`, `link`
- `outline-black` → dipakai untuk tombol export (border hitam, bg transparan, rounded-[12px])
- `default` → dipakai untuk tombol aksi utama

### 4.6 Table (`@/components/ui/table`)
- Ekspor: `Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableFooter`
- Selalu wrapping dengan `div.rounded-xl.border.border-border/60.bg-card`

---

## 5. Import Pattern (wajib diikuti)

```tsx
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"         // via barrel export
import { Opsion } from "@/components/opsion"              // via barrel export
import { StatusBadge } from "@/components/badge"           // via barrel export
import { BiSolidReport, BiChevronRight, BiDotsVerticalRounded } from "react-icons/bi"
// icon lain sesuai kebutuhan: BiBarChartAlt2, BiRightArrowAlt, BiFile, dll.
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableFooter } from "@/components/ui/table"
```

---

## 6. State Management & API Integration (Production)

Halaman contoh menggunakan **dummy data**. Untuk production, gunakan pola berikut:

### Filter Store (`useFilterStore`)
```ts
import { useFilterStore } from "@/store"
// state: search, gudang, kategori, dateFrom, dateTo
// method: setSearch, setGudang, setKategori, setDateRange, resetFilters
```

### React Query Hooks (`@/hooks/use-api`)
```ts
import { useApiList } from "@/hooks/use-api"
import type { PaginatedResponse } from "@/types"

// Untuk list dengan pagination:
const { data, isLoading } = useApiList<BarangMasuk>({
  key: "barang-masuk",   // query key
  url: "/barang-masuk",  // endpoint
  enabled: true,         // boolean condition
})

// Untuk detail:
const { data } = useApiDetail<BarangMasuk>({ key: "barang-masuk", url: "/barang-masuk/1" })

// Mutation:
const createMutation = useApiCreate<BarangMasuk, BarangMasukPayload>("barang-masuk", "/barang-masuk")
const updateMutation = useApiUpdate<BarangMasuk, BarangMasukPayload>("barang-masuk", "/barang-masuk")
const deleteMutation = useApiDelete("barang-masuk", "/barang-masuk")
```

### Response Types
```ts
ApiResponse<T>       → { data: T; message: string; success: boolean }
PaginatedResponse<T> → { data: T[]; meta: { currentPage, totalPages, totalItems, itemsPerPage } }
```

### Axios Instance (`@/lib/api`)
- Base URL dari `NEXT_PUBLIC_API_URL` atau `http://localhost:8000/api`
- Auto-attach Bearer token dari `useAuthStore`
- Auto-logout pada 401

---

## 7. Konvensi Styling

### Spacing
- Antar section: `mt-[50px]` (header→filter), `mt-[25px]` (filter→table)
- Padding halaman: disediakan oleh layout (`px-14 py-10`)

### Tabel
| Elemen | Style |
|--------|-------|
| Wrapper table | `rounded-xl border border-border/60 bg-card` |
| TableHeader row | `h-14 hover:bg-transparent bg-white border-b border-border/60` |
| TableHead | `text-xs font-semibold text-foreground normal-case tracking-normal` |
| TableBody | `min-h-[300px]` |
| TableBody row | `h-16 hover:bg-muted/30 border-b border-border/40` |
| TableCell default | `text-sm font-sans text-foreground` |
| TableCell tanggal | `text-sm font-sans text-muted-foreground` |
| TableCell status | `text-center` |
| TableCell aksi | `pr-6 text-right` |
| TableCell pertama | `pl-6` |
| Footer | `border-t border-border/50 bg-white` |

### Filter Bar
- `flex items-center gap-2`
- InputSearch: `className="flex-1"` (mengisi sisa ruang)

### Ikon
- Semua dari `react-icons/bi` (BoxIcons), **bukan** lucide-react
- Icon export: `BiSolidReport`
- Arrow rute: `BiRightArrowAlt` (size-4)
- Aksi chevron: `BiChevronRight` (size-4)
- Aksi menu: `BiDotsVerticalRounded` (size-4)
- Dokumen: `BiFile` (size-3)

### Warna
- `#857F78` → teks breadcrumb & description
- `border-border/60`, `border-border/80`, `border-border/40` → variasi opacity border
- `bg-muted/30`, `bg-muted/60`, `hover:bg-muted` → hover/active states

---

## 8. Template Cepat (Copy-paste ready)

```tsx
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { BiSolidReport, BiChevronRight, BiDotsVerticalRounded } from "react-icons/bi"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableFooter } from "@/components/ui/table"
// import { StatusBadge } from "@/components/badge"         // jika perlu status badge
// import { useApiList } from "@/hooks/use-api"            // jika perlu real API
// import { useFilterStore } from "@/store"                 // jika perlu filter global
// import { IconLain } from "react-icons/bi"               // icon tambahan

// Sementara dummy data
const dummyData = [] as const

export default function LaporanPage() {
  return (
    <>
      {/* ─── HEADER ─── */}
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Nama Halaman" },
            ]}
            title="Judul Halaman"
            icon={IconLain}
            description="Deskripsi halaman."
          />
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline-black">
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
            <Button variant="default">
              + Aksi Utama
            </Button>
          </div>
        </div>
      </div>

      {/* ─── FILTER ─── */}
      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch placeholder="Cari..." className="flex-1" />
          <Opsion
            options={[
              { value: "all", label: "Semua Gudang" },
              { value: "1", label: "Gudang A" },
            ]}
          />
          <Opsion
            placeholder="Semua Status"
            options={[
              { value: "all", label: "Semua Status" },
              { value: "aktif", label: "Aktif" },
            ]}
          />
        </div>
      </div>

      {/* ─── TABLE ─── */}
      <div className="wrapper mt-[25px]">
        <Table>
          <TableHeader className="bg-white border-b border-border/60">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold text-foreground normal-case tracking-normal">Kolom 1</TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal">Kolom 2</TableHead>
              <TableHead className="text-xs font-semibold text-foreground normal-case tracking-normal text-center">Kolom Status</TableHead>
              <TableHead className="pr-6 text-xs font-semibold text-foreground normal-case tracking-normal text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="min-h-[300px]">
            {dummyData.map((row) => (
              <TableRow key={row.id} className="h-16 hover:bg-muted/30 border-b border-border/40">
                <TableCell className="pl-6 text-sm font-sans text-foreground">{row.kolom1}</TableCell>
                <TableCell className="text-sm font-sans text-foreground">{row.kolom2}</TableCell>
                <TableCell className="text-sm font-sans text-center">
                  {/* <StatusBadge status={row.status} /> */}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <div className="flex items-center justify-end gap-1 text-muted-foreground">
                    <button className="p-1 hover:bg-muted rounded-md transition-colors cursor-pointer">
                      <BiChevronRight className="size-4 text-foreground/75" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded-md transition-colors cursor-pointer">
                      <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4} className="p-0 align-middle">
                <div className="bg-white h-14 px-6 flex items-center justify-between text-xs text-muted-foreground font-sans">
                  <span>Menampilkan 1-0 dari 0 data</span>
                  <div className="flex items-center">
                    <div className="flex items-center border border-border/80 rounded-lg overflow-hidden bg-background">
                      <button className="h-8 w-8 flex items-center justify-center hover:bg-muted text-muted-foreground border-r border-border/80 transition-colors cursor-pointer">&lt;</button>
                      <button className="h-8 w-8 flex items-center justify-center bg-muted/60 text-foreground font-medium border-r border-border/80 transition-colors cursor-pointer">1</button>
                      <button className="h-8 w-8 flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors cursor-pointer">&gt;</button>
                    </div>
                  </div>
                  <span>10 per halaman</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </>
  )
}
```

---

## 9. Checklist Implementasi Halaman Baru

- [ ] Buat folder di `src/app/(dashboard)/(laporan)/{page-name}/`
- [ ] Buat `page.tsx` dengan pola 3 section (header, filter, table)
- [ ] Jika ada tipe data baru, tambahkan interface di `src/types/index.ts`
- [ ] Gunakan barrel exports untuk import komponen (`@/components/input`, `@/components/opsion`, dll.)
- [ ] Ikuti konvensi styling tabel (header, cell, spacing, warna)
- [ ] Gunakan icon dari `react-icons/bi`
- [ ] Untuk real API: gunakan `useApiList` + `useFilterStore`
- [ ] Pastikan halaman adalah `export default function` (tidak perlu "use client" jika hanya JSX + dummy data)
- [ ] Run `npm run typecheck` dan `npm run lint` setelah selesai
  at on