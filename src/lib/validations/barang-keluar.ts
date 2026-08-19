import { z } from "zod"

export const barangKeluarItemSchema = z.object({
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

export const barangKeluarSchema = z.object({
  noReferensi: z
    .string()
    .trim()
    .min(
      1,
      "Nomor referensi wajib diisi. Silakan klik tombol refresh jika belum ada."
    ),
  nomorSuratJalan: z.string().optional(),
  tanggal: z.string().min(1, "Tanggal transaksi pengeluaran wajib diisi"),
  gudangId: z.string().min(1, "Gudang asal pengeluaran wajib dipilih"),
  customer: z.string().min(1, "Customer / tujuan pengiriman wajib dipilih"),
  catatan: z.string().optional(),
  dokumen: z
    .array(z.instanceof(File))
    .max(5, "Maksimal unggah 5 file dokumen")
    .optional(),
  items: z
    .array(barangKeluarItemSchema)
    .min(1, "Minimal tambahkan 1 item barang keluar"),
})

export type BarangKeluarFormValues = z.infer<typeof barangKeluarSchema>
