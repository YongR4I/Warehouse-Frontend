import { z } from "zod"

export const supplierSchema = z.object({
  kode: z.string().trim().min(1, "Kode unik supplier wajib diisi"),
  nama: z.string().trim().min(1, "Nama perusahaan / toko supplier wajib diisi"),
  pic: z.string().optional(),
  telepon: z
    .string()
    .trim()
    .min(1, "Nomor telepon / WhatsApp supplier wajib diisi"),
  email: z
    .string()
    .email("Format email tidak valid (contoh: nama@perusahaan.com)")
    .optional()
    .or(z.literal("")),
  alamat: z.string().trim().min(1, "Alamat lengkap supplier wajib diisi"),
  catatan: z.string().optional(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>

export const customerSchema = z.object({
  kode: z.string().trim().min(1, "Kode unik customer wajib diisi"),
  nama: z
    .string()
    .trim()
    .min(1, "Nama perusahaan / perorangan customer wajib diisi"),
  pic: z.string().optional(),
  telepon: z
    .string()
    .trim()
    .min(1, "Nomor telepon / WhatsApp customer wajib diisi"),
  email: z
    .string()
    .email("Format email tidak valid (contoh: nama@domain.com)")
    .optional()
    .or(z.literal("")),
  alamatPengiriman: z
    .string()
    .trim()
    .min(1, "Alamat pengiriman customer wajib diisi"),
  catatan: z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>
