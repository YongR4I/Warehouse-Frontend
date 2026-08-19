import { z } from "zod"

export const barangMasukItemSchema = z.object({
  barangId: z.string().min(1, "Barang wajib dipilih"),
  jumlah: z
    .number({ message: "Jumlah harus berupa angka" })
    .min(1, "Jumlah item minimal 1"),
  harga: z
    .number({ message: "Harga harus berupa angka" })
    .nullable()
    .optional(),
  lokasiRakId: z.string().optional(),
})

export const barangMasukSchema = z.object({
  noReferensi: z
    .string()
    .trim()
    .min(
      1,
      "Nomor referensi wajib diisi. Silakan klik tombol refresh jika belum ada."
    ),
  nomorSuratJalan: z.string().optional(),
  tanggal: z.string().min(1, "Tanggal transaksi penerimaan wajib diisi"),
  gudangId: z.string().min(1, "Gudang tujuan penerimaan wajib dipilih"),
  supplierId: z.string().min(1, "Supplier pengirim wajib dipilih"),
  catatan: z.string().optional(),
  dokumen: z
    .array(z.instanceof(File))
    .max(5, "Maksimal unggah 5 file dokumen")
    .optional(),
  items: z
    .array(barangMasukItemSchema)
    .min(1, "Minimal tambahkan 1 item barang masuk"),
})

export type BarangMasukFormValues = z.infer<typeof barangMasukSchema>
