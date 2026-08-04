# Form Drawer Architecture & Developer Guide

Dokumen ini berisi panduan lengkap, spesifikasi komponen, serta panduan langkah demi langkah (context) untuk membuat form drawer baru di aplikasi **Warehouse Frontend**.

---

## 🏛️ Architecture Overview (3-Layer Model)

Untuk menjaga konsistensi UI, skala aplikasi (15+ form), dan menghindari *code duplication*, seluruh form drawer di aplikasi ini menggunakan **3-Layer Architecture**:

1. **Layer 1: Shell (`FormDrawer`)**
   - Wrapper komponen `Sheet` dari shadcn/ui yang menyediakan kerangka drawer (Header, Body scrollable, dan Footer melayang/sticky).
2. **Layer 2: Primitives (`src/components/forms/` & `src/components/item-table/`)**
   - Komponen dasar pembentuk input form (`FormInput`, `FormSelect`, `FormDate`, `FormTextarea`, `FormUpload`, `FormSection`) dan tabel transaksi (`ItemTable`, `ItemTableRow`).
   - Memiliki batas tinggi minimum default **`min-h-10` (`40px`)**.
3. **Layer 3: Feature Form (Domain Form)**
   - Form spesifik tiap fitur (misal: `BarangMasukForm`, `SupplierForm`, `BarangKeluarForm`). Layer ini hanya menyusun Layer 1 + Layer 2 + Zod Schema & React Hook Form logic (~60–100 baris kode).

---

## 📁 Struktur Folder

```text
src/
├── components/
│   ├── forms/                              ← Shared Form Primitives
│   │   ├── form-drawer.tsx                 ← Drawer shell (Header, Body, Footer slots)
│   │   ├── form-field.tsx                  ← Label + input wrapper + error display
│   │   ├── form-input.tsx                  ← Input text/number + min-h-10
│   │   ├── form-select.tsx                 ← Select dropdown + min-h-10
│   │   ├── form-textarea.tsx               ← Textarea + min-h-10
│   │   ├── form-date.tsx                   ← Input date + min-h-10
│   │   ├── form-upload.tsx                 ← UploadInput dropzone
│   │   ├── form-section.tsx                ← Title section wrapper
│   │   └── index.ts                        ← Barrel export
│   │
│   ├── item-table/                         ← Reusable Dynamic Transaction Table
│   │   ├── item-table.tsx                  ← Table shell (header + body + add item button)
│   │   ├── item-table-row.tsx              ← Single row template (# index + delete button)
│   │   └── index.ts                        ← Barrel export
│   │
│   ├── barang-masuk/
│   │   └── barang-masuk-form.tsx           ← Form transaksi penerimaan barang
│   └── master/                             ← Form master data sederhana
│       ├── supplier-form.tsx
│       ├── gudang-form.tsx
│       └── barang-form.tsx
```

---

## ⚙️ Component Specs & API Reference

### 1. `FormDrawer`
Komponen utama penampung drawer.

| Prop | Type | Default | Keterangan |
|---|---|---|---|
| `open` | `boolean` | **Required** | Status open/close drawer |
| `onOpenChange` | `(open: boolean) => void` | **Required** | Callback toggle status drawer |
| `title` | `string` | **Required** | Judul form di header |
| `description` | `string` | `undefined` | Subtitle / deskripsi singkat di header |
| `icon` | `React.ComponentType` \| `ReactNode` | `undefined` | Icon BoxIcons (misal: `BiDownArrowCircle`) |
| `children` | `ReactNode` | **Required** | Diisi dengan `<FormDrawer.Body>` & `<FormDrawer.Footer>` |

- `<FormDrawer.Body>`: Container area form yang dapat di-scroll (`overflow-y-auto bg-[#f9f9f9] p-6`).
- `<FormDrawer.Footer summary={...}>`: Container bagian bawah sticky yang berisi ringkasan data dan tombol aksi (`Batal`, `Draft`, `Simpan`).

---

### 2. Form Primitives (`src/components/forms`)

Semua field wrapper mendukung prop berikut:
- `label?: string` (Judul label input)
- `required?: boolean` (Menambahkan tanda bintang merah `*`)
- `error?: string | FieldError` (Menampilkan pesan error validasi warna merah)

#### `FormInput`
```tsx
<FormInput
  label="Kode Barang"
  required
  error={errors.kode}
  placeholder="SKU-001"
  {...register("kode")}
/>
```

#### `FormSelect`
```tsx
<FormSelect
  label="Gudang Asal"
  required
  error={errors.gudangId}
  options={[
    { value: "1", label: "Gudang Pusat" },
    { value: "2", label: "Gudang Timur" }
  ]}
  value={field.value}
  onValueChange={field.onChange}
/>
```

#### `FormDate`
```tsx
<FormDate
  label="Tanggal Transaksi"
  required
  error={errors.tanggal}
  {...register("tanggal")}
/>
```

#### `FormTextarea`
```tsx
<FormTextarea
  label="Catatan (Opsional)"
  placeholder="Tambahkan catatan..."
  rows={3}
  {...register("catatan")}
/>
```

#### `FormUpload`
```tsx
<FormField label="Upload Dokumen Pendukung">
  <Controller
    control={control}
    name="dokumen"
    render={({ field }) => (
      <UploadInput
        accept=".pdf,.jpg,.png"
        multiple
        onChange={(e) => field.onChange(Array.from(e.target.files || []))}
      />
    )}
  />
</FormField>
```

#### `FormSection`
```tsx
<FormSection title="Daftar Item">
  {/* Content / Table */}
</FormSection>
```

---

### 3. Dynamic Item Table (`src/components/item-table`)

#### `ItemTable`
- `headers`: Array nama kolom `string` atau objek `{ label: string; className?: string }`.
- `onAdd`: Callback saat tombol "+ Tambah item" diklik.
- `error`: Error validasi tabel (misal: "Minimal 1 item harus diisi").

#### `ItemTableRow`
- `index`: Index baris (0-indexed, otomatis menampilkan nomor `#`).
- `onRemove`: Callback saat tombol hapus (icon sampah) diklik.
- `canRemove`: Flag `boolean` (opsional, misal `fields.length > 1`).

---

## 🚀 Template: Cara Membuat Form Baru

### Scenario A: Form Master Data Sederhana (Tanpa Tabel)

Contoh: Membuat `SupplierForm`

1. Buat Schema Validasi (`src/lib/validations/supplier.ts`):
```ts
import { z } from "zod"

export const supplierSchema = z.object({
  nama: z.string().min(1, "Nama supplier wajib diisi"),
  telepon: z.string().optional(),
  alamat: z.string().optional(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>
```

2. Buat Komponen Form (`src/components/master/supplier-form.tsx`):
```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDrawer, FormInput, FormTextarea } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { BiBuilding } from "react-icons/bi"
import { supplierSchema, type SupplierFormValues } from "@/lib/validations/supplier"

interface SupplierFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupplierForm({ open, onOpenChange }: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { nama: "", telepon: "", alamat: "" },
  })

  const onSubmit = (data: SupplierFormValues) => {
    console.log("Submit supplier:", data)
    reset()
    onOpenChange(false)
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Tambah Supplier"
      description="Masukkan data supplier baru ke dalam sistem."
      icon={BiBuilding}
    >
      <FormDrawer.Body>
        <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Nama Supplier"
            required
            error={errors.nama}
            placeholder="PT Sumber Makmur"
            {...register("nama")}
          />

          <FormInput
            label="No. Telepon"
            error={errors.telepon}
            placeholder="08123456789"
            {...register("telepon")}
          />

          <FormTextarea
            label="Alamat"
            error={errors.alamat}
            placeholder="Alamat lengkap supplier..."
            {...register("alamat")}
          />
        </form>
      </FormDrawer.Body>

      <FormDrawer.Footer>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Batal
        </Button>
        <Button
          type="submit"
          form="supplier-form"
          className="bg-black text-white hover:bg-black/90"
          disabled={isSubmitting}
        >
          Simpan Supplier
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
```

---

### Scenario B: Form Transaksi dengan Tabel Dinamis (Item Table)

Contoh: Membuat `BarangKeluarForm`

```tsx
"use client"

import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FormDrawer,
  FormField,
  FormDate,
  FormTextarea,
  FormSection,
} from "@/components/forms"
import { ItemTable, ItemTableRow } from "@/components/item-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TableCell } from "@/components/ui/table"
import { BiUpArrowCircle } from "react-icons/bi"
import { barangKeluarSchema, type BarangKeluarFormValues } from "@/lib/validations/barang-keluar"

interface BarangKeluarFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BarangKeluarForm({ open, onOpenChange }: BarangKeluarFormProps) {
  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<BarangKeluarFormValues>({
    resolver: zodResolver(barangKeluarSchema),
    defaultValues: {
      tanggal: new Date().toISOString().split("T")[0],
      gudangId: "",
      items: [{ barangId: "", jumlah: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  const watchItems = watch("items")
  const totalItem = watchItems?.reduce((sum, i) => sum + (i.jumlah || 0), 0) ?? 0

  const onSubmit = (data: BarangKeluarFormValues) => {
    console.log("Submit barang keluar:", data)
    onOpenChange(false)
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Pengeluaran Barang"
      description="Catat pengeluaran stok barang dari gudang."
      icon={BiUpArrowCircle}
    >
      <FormDrawer.Body>
        <form id="barang-keluar-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormDate label="Tanggal Transaksi" error={errors.tanggal} {...register("tanggal")} />
            
            <FormField label="Gudang Asal" error={errors.gudangId}>
              <Controller
                control={control}
                name="gudangId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="min-h-10 h-10 w-full rounded-xl border-border bg-card px-3.5">
                      <SelectValue placeholder="Pilih gudang" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover">
                      <SelectItem value="1">Gudang Pusat</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <FormSection title="Daftar Item Outbound">
            <ItemTable
              headers={[
                "SKU / Nama Barang",
                { label: "Jumlah Keluar", className: "w-32 text-right" },
              ]}
              onAdd={() => append({ barangId: "", jumlah: 1 })}
              error={errors.items?.message || errors.items?.root?.message}
            >
              {fields.map((field, index) => (
                <ItemTableRow
                  key={field.id}
                  index={index}
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                >
                  <TableCell>
                    {/* Select Barang */}
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      min={1}
                      {...register(`items.${index}.jumlah`, { valueAsNumber: true })}
                      className="h-8 w-full rounded-lg border border-border px-2 text-right text-sm"
                    />
                  </TableCell>
                </ItemTableRow>
              ))}
            </ItemTable>
          </FormSection>
        </form>
      </FormDrawer.Body>

      <FormDrawer.Footer
        summary={
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Total Item Keluar</p>
            <p className="text-lg font-semibold text-foreground">{totalItem}</p>
          </div>
        }
      >
        <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
        <Button type="submit" form="barang-keluar-form" disabled={isSubmitting}>Simpan Transaksi</Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
```

---

## ✅ Checklist Pembuatan Form Baru

- [ ] Schema Zod dibuat di `src/lib/validations/[feature].ts`.
- [ ] Menggunakan `FormDrawer` sebagai shell utama.
- [ ] Form controls menggunakan tinggi minimal `min-h-10` (`40px`).
- [ ] Menghubungkan ID `<form id="my-form">` dengan tombol submit di `<FormDrawer.Footer>` via prop `form="my-form"`.
- [ ] Menjalankan `npm run typecheck` dan `npm run lint` untuk memastikan tidak ada error TypeScript atau ESLint.
