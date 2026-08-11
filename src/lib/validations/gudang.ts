import { z } from "zod"

export const gudangSchema = z.object({
  kode: z.string().min(1, "Kode gudang wajib diisi"),
  nama: z.string().min(1, "Nama gudang wajib diisi"),
  pic: z.string().min(1, "Penanggung jawab (PIC) wajib diisi"),
  status: z.string().min(1, "Status wajib dipilih"),
  alamat: z.string().min(1, "Alamat lengkap wajib diisi"),
  catatan: z.string().optional(),
})

export type GudangFormValues = z.infer<typeof gudangSchema>

export const rakSchema = z.object({
  gudangId: z.string().min(1, "Gudang wajib dipilih"),
  kodeRak: z.string().min(1, "Kode rak / bin wajib diisi"),
  lorong: z.string().optional(),
  level: z.string().optional(),
  status: z.string().min(1, "Status rak wajib dipilih"),
  keterangan: z.string().optional(),
})

export type RakFormValues = z.infer<typeof rakSchema>
