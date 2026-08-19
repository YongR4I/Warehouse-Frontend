import { z } from "zod"

export const gudangSchema = z.object({
  kode: z.string().trim().min(1, "Kode unik gudang wajib diisi"),
  nama: z.string().trim().min(1, "Nama gudang wajib diisi"),
  pic: z.string().trim().min(1, "Penanggung jawab (PIC) gudang wajib diisi"),
  status: z.string().min(1, "Status operasional gudang wajib dipilih"),
  alamat: z.string().trim().min(1, "Alamat lengkap gudang wajib diisi"),
  catatan: z.string().optional(),
})

export type GudangFormValues = z.infer<typeof gudangSchema>

export const rakSchema = z.object({
  gudangId: z.string().min(1, "Gudang penempatan wajib dipilih"),
  kodeRak: z.string().trim().min(1, "Kode rak / bin wajib diisi"),
  lorong: z.string().optional(),
  level: z.string().optional(),
  status: z.string().min(1, "Status operasional rak wajib dipilih"),
  keterangan: z.string().optional(),
})

export type RakFormValues = z.infer<typeof rakSchema>
