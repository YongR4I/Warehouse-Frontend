import { z } from "zod"

const barangKeluarItemSchema = z.object({
  barangId: z.string().min(1, "Barang harus dipilih"),
  jumlah: z.number().min(1, "Jumlah minimal 1"),
})

export const barangKeluarSchema = z.object({
  tanggal: z.string().min(1, "Tanggal transaksi wajib diisi"),
  gudangId: z.string().min(1, "Gudang tujuan wajib dipilih"),
  customer: z.string().min(1, "Customer / tujuan wajib diisi"),
  catatan: z.string().optional(),
  dokumen: z
    .array(z.instanceof(File))
    .max(5, "Maksimal 5 file")
    .optional(),
  items: z
    .array(barangKeluarItemSchema)
    .min(1, "Minimal 1 item barang"),
})

export type BarangKeluarFormValues = z.infer<typeof barangKeluarSchema>
