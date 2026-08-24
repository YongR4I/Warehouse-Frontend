import { z } from "zod"

export const petugasSchema = z.object({
  namaLengkap: z.string().trim().min(1, "Nama lengkap petugas wajib diisi"),
  kode: z.string().trim().min(1, "Kode unik pegawai / NIK wajib diisi"),
  nomorTelepon: z
    .string()
    .trim()
    .min(1, "Nomor telepon / kontak petugas wajib diisi"),
  peran: z.string().min(1, "Tanggung jawab / peran penugasan wajib dipilih"),
  areaKerja: z.string().trim().min(1, "Area kerja penempatan wajib diisi"),
  tanggalBergabung: z.string().min(1, "Tanggal bergabung wajib diisi"),
  status: z.enum(["Aktif", "Cuti", "Non-Aktif"], {
    message: "Status operasional petugas wajib dipilih",
  }),
})

export type PetugasFormValues = z.infer<typeof petugasSchema>
