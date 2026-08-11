import { z } from "zod"

export const kategoriSchema = z.object({
  nama: z.string().min(1, "Nama kategori wajib diisi"),
  prefix: z.string().optional(),
  deskripsi: z.string().optional(),
})

export type KategoriFormValues = z.infer<typeof kategoriSchema>

export const satuanSchema = z.object({
  kode: z.string().min(1, "Kode satuan / UOM wajib diisi"),
  nama: z.string().min(1, "Nama satuan lengkap wajib diisi"),
  keterangan: z.string().optional(),
})

export type SatuanFormValues = z.infer<typeof satuanSchema>
