import { z } from "zod"

export const mutasiItemSchema = z.object({
  barangId: z.string().min(1, "Barang wajib dipilih"),
  jumlah: z
    .number({ message: "Jumlah harus berupa angka" })
    .min(1, "Jumlah transfer barang minimal 1"),
})

export const mutasiSchema = z
  .object({
    noReferensi: z
      .string()
      .trim()
      .min(
        1,
        "Nomor referensi wajib diisi. Silakan klik tombol refresh jika belum ada."
      ),
    tanggal: z.string().min(1, "Tanggal mutasi stok wajib diisi"),
    gudangAsalId: z.string().min(1, "Gudang asal wajib dipilih"),
    gudangTujuanId: z.string().min(1, "Gudang tujuan wajib dipilih"),
    catatan: z.string().optional(),
    items: z
      .array(mutasiItemSchema)
      .min(1, "Minimal tambahkan 1 item barang yang akan dimutasi"),
  })
  .refine(
    (data) =>
      !data.gudangAsalId ||
      !data.gudangTujuanId ||
      data.gudangAsalId !== data.gudangTujuanId,
    {
      message: "Gudang tujuan tidak boleh sama dengan gudang asal",
      path: ["gudangTujuanId"],
    }
  )

export type MutasiFormValues = z.infer<typeof mutasiSchema>
