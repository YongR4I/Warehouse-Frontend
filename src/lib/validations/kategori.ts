import { z } from "zod"

export const kategoriSchema = z.object({
  nama: z.string().trim().min(1, "Nama kategori barang wajib diisi"),
  prefix: z.string().optional(),
  deskripsi: z.string().optional(),
})

export type KategoriFormValues = z.infer<typeof kategoriSchema>

export const satuanSchema = z.object({
  kode: z
    .string()
    .trim()
    .min(1, "Kode satuan / UOM wajib diisi (contoh: PCS, BOX)"),
  nama: z.string().trim().min(1, "Nama satuan lengkap wajib diisi"),
  keterangan: z.string().optional(),
})

export type SatuanFormValues = z.infer<typeof satuanSchema>
