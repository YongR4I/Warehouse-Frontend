import { z } from "zod"

const barangMasukItemSchema = z.object({
  barangId: z.string().min(1, "Barang harus dipilih"),
  jumlah: z.number().min(1, "Jumlah minimal 1"),
})

export const barangMasukSchema = z.object({
  tanggal: z.string().min(1, "Tanggal transaksi wajib diisi"),
  gudangId: z.string().min(1, "Gudang asal wajib dipilih"),
  supplierId: z.string().min(1, "Supplier wajib dipilih"),
  catatan: z.string().optional(),
  dokumen: z
    .array(z.instanceof(File))
    .max(5, "Maksimal 5 file")
    .optional(),
  items: z
    .array(barangMasukItemSchema)
    .min(1, "Minimal 1 item barang"),
})

export type BarangMasukFormValues = z.infer<typeof barangMasukSchema>
