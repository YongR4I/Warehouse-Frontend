import { z } from "zod"

export const petugasSchema = z.object({
  kode: z.string().min(1, "Kode unik pegawai wajib diisi"),
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  nomorTelepon: z.string().min(1, "Nomor telepon wajib diisi"),
  peran: z.string().min(1, "Tanggung jawab / peran wajib dipilih"),
  areaKerja: z.string().min(1, "Area kerja penempatan wajib diisi"),
  tanggalBergabung: z.string().min(1, "Tanggal bergabung wajib diisi"),
  status: z.string().min(1, "Status operasional wajib dipilih"),
})

export type PetugasFormValues = z.infer<typeof petugasSchema>
