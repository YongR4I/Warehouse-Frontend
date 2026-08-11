import { z } from "zod"

const shiftValue = z.enum(["Shift 1", "Shift 2", "Shift 3", "OFF"])

export const jadwalShiftSchema = z.object({
  periodeMingggu: z.string().min(1, "Periode minggu kerja wajib diisi"),
  petugasId: z.string().min(1, "Nama petugas gudang wajib dipilih"),
  peran: z.string().min(1, "Tanggung jawab / peran wajib dipilih"),
  alokasi: z.object({
    sen: shiftValue,
    sel: shiftValue,
    rab: shiftValue,
    kam: shiftValue,
    jum: shiftValue,
    sab: shiftValue,
    min: shiftValue,
  }),
  catatan: z.string().optional(),
})

export type JadwalShiftFormValues = z.infer<typeof jadwalShiftSchema>
