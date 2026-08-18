import { z } from "zod"

const mutasiItemSchema = z.object({
  barangId: z.string().min(1, "Barang harus dipilih"),
  jumlah: z.number().min(1, "Jumlah minimal 1"),
})

export const mutasiSchema = z.object({
  noReferensi: z.string().min(1, "No. referensi wajib diisi"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  gudangAsalId: z.string().min(1, "Gudang asal wajib dipilih"),
  gudangTujuanId: z.string().min(1, "Gudang tujuan wajib dipilih"),
  catatan: z.string().optional(),
  items: z.array(mutasiItemSchema).min(1, "Minimal 1 item barang"),
}).refine((data) => data.gudangAsalId !== data.gudangTujuanId, {
  message: "Gudang tujuan tidak boleh sama dengan gudang asal",
  path: ["gudangTujuanId"],
})

export type MutasiFormValues = z.infer<typeof mutasiSchema>
