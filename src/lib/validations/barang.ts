import { z } from "zod"

export const barangSchema = z.object({
  nama: z.string().trim().min(1, "Nama barang wajib diisi"),
  sku: z.string().trim().min(1, "Kode SKU unik wajib diisi"),
  barcode: z.string().optional(),
  kategoriId: z.string().min(1, "Kategori barang wajib dipilih"),
  satuan: z.string().min(1, "Satuan / UOM wajib dipilih"),
  stokMin: z
    .number({ message: "Stok minimum harus berupa angka" })
    .min(0, "Stok minimum tidak boleh negatif (minimal 0)"),
  status: z.string().min(1, "Status operasional barang wajib dipilih"),
  foto: z.array(z.instanceof(File)).optional(),
  dokumen: z.array(z.instanceof(File)).optional(),
  deskripsi: z.string().optional(),
})

export type BarangFormValues = z.infer<typeof barangSchema>
