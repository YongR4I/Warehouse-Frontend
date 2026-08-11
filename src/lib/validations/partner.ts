import { z } from "zod"

export const supplierSchema = z.object({
  kode: z.string().min(1, "Kode supplier wajib diisi"),
  nama: z.string().min(1, "Nama perusahaan / toko wajib diisi"),
  pic: z.string().optional(),
  telepon: z.string().min(1, "Nomor telepon / WhatsApp wajib diisi"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  alamat: z.string().min(1, "Alamat lengkap wajib diisi"),
  catatan: z.string().optional(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>

export const customerSchema = z.object({
  kode: z.string().min(1, "Kode customer wajib diisi"),
  nama: z.string().min(1, "Nama perusahaan / customer wajib diisi"),
  pic: z.string().optional(),
  telepon: z.string().min(1, "Nomor telepon / WhatsApp wajib diisi"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  alamatPengiriman: z.string().min(1, "Alamat pengiriman wajib diisi"),
  catatan: z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>
