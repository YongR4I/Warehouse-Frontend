import { z } from "zod"

export const barangSchema = z.object({
  nama: z.string().min(1, "Nama barang wajib diisi"),
  sku: z.string().min(1, "Kode SKU wajib diisi"),
  barcode: z.string().optional(),
  kategoriId: z.string().min(1, "Kategori wajib dipilih"),
  satuan: z.string().min(1, "Satuan / UOM wajib dipilih"),
  stokMin: z.number().min(0, "Stok minimum minimal 0"),
  status: z.string().min(1, "Status wajib dipilih"),
  foto: z.array(z.instanceof(File)).optional(),
  dokumen: z.array(z.instanceof(File)).optional(),
  deskripsi: z.string().optional(),
})

export type BarangFormValues = z.infer<typeof barangSchema>
