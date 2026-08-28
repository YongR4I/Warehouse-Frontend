import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { useAuthStore } from "@/store/use-auth-store"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let refreshPromise: Promise<string | null> | null = null

async function tryRefreshToken(): Promise<string | null> {
  const token = useAuthStore.getState().token
  if (!token) return null
  try {
    const response = await axios.post(
      `${api.defaults.baseURL}/refresh`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const newToken = response.data?.data?.token ?? response.data?.token
    if (newToken) {
      useAuthStore.getState().setToken(newToken)
      return newToken as string
    }
    return null
  } catch {
    return null
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined

    if (error.response?.status === 401 && original && !original._retry) {
      const isAuthRequest =
        original.url?.includes("/login") || original.url?.includes("/refresh")
      if (!isAuthRequest) {
        original._retry = true
        refreshPromise = refreshPromise ?? tryRefreshToken()
        const newToken = await refreshPromise
        refreshPromise = null
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`
          return api(original)
        }
      }
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)

export function formatFriendlyFieldName(field: string): string {
  const cleanField = field
    .replace(/^details\.\d+\./, "")
    .replace(/^items\.\d+\./, "")
  const fieldMap: Record<string, string> = {
    no_referensi: "Nomor Referensi",
    noReferensi: "Nomor Referensi",
    nomor_referensi: "Nomor Referensi",
    reference_number: "Nomor Referensi",
    nomor_surat_jalan: "Nomor Surat Jalan",
    nomorSuratJalan: "Nomor Surat Jalan",
    gudang_id: "Gudang",
    gudangId: "Gudang",
    gudang_asal_id: "Gudang Asal",
    gudangAsalId: "Gudang Asal",
    gudang_tujuan_id: "Gudang Tujuan",
    gudangTujuanId: "Gudang Tujuan",
    supplier_id: "Supplier",
    supplierId: "Supplier",
    customer_id: "Customer",
    customer: "Customer",
    barang_id: "Barang",
    barangId: "Barang",
    lokasi_rak_id: "Lokasi Rak",
    lokasiRakId: "Lokasi Rak",
    kode_rak: "Kode Rak",
    kodeRak: "Kode Rak",
    qty: "Jumlah",
    jumlah: "Jumlah",
    harga_satuan: "Harga Satuan",
    harga: "Harga Satuan",
    tanggal: "Tanggal Transaksi",
    sku: "Kode SKU",
    barcode: "Barcode",
    nama: "Nama",
    nama_lengkap: "Nama Lengkap",
    namaLengkap: "Nama Lengkap",
    kode: "Kode",
    telepon: "Nomor Telepon",
    nomor_telepon: "Nomor Telepon",
    nomorTelepon: "Nomor Telepon",
    email: "Email",
    password: "Password",
    alamat: "Alamat",
    alamat_pengiriman: "Alamat Pengiriman",
    alamatPengiriman: "Alamat Pengiriman",
    status: "Status",
    kategori_id: "Kategori",
    kategoriId: "Kategori",
    satuan: "Satuan",
    satuan_id: "Satuan",
    stok_min: "Stok Minimum",
    min_stok: "Stok Minimum",
    stokMin: "Stok Minimum",
    catatan: "Catatan",
    keterangan: "Keterangan",
    pic: "Penanggung Jawab (PIC)",
    details: "Daftar Item",
    items: "Daftar Item",
  }
  return fieldMap[cleanField] || field
}

export function formatFriendlyErrorMessage(
  field: string,
  rawMessage: string
): string {
  const lowerMsg = rawMessage.toLowerCase()
  const fieldName = formatFriendlyFieldName(field)
  const isRefNumber = /no_?referensi|reference_?number|nomor_?referensi/i.test(
    field
  )

  if (
    lowerMsg.includes("already been taken") ||
    lowerMsg.includes("unique") ||
    lowerMsg.includes("sudah terpakai") ||
    lowerMsg.includes("sudah digunakan") ||
    lowerMsg.includes("duplicate")
  ) {
    if (isRefNumber) {
      return "Nomor referensi sudah terpakai. Silakan klik tombol buat ulang (refresh) untuk mendapatkan nomor referensi baru."
    }
    if (/sku/i.test(field)) {
      return "Kode SKU ini sudah terdaftar di sistem. Silakan gunakan kode SKU yang berbeda."
    }
    if (/barcode/i.test(field)) {
      return "Barcode ini sudah terdaftar pada barang lain. Silakan periksa kembali."
    }
    if (/email/i.test(field)) {
      return "Alamat email ini sudah terdaftar. Silakan gunakan email lain."
    }
    if (/kode/i.test(field)) {
      return `${fieldName} sudah terdaftar. Silakan gunakan kode unik lainnya.`
    }
    return `${fieldName} sudah terdaftar atau sudah digunakan di sistem.`
  }

  if (
    lowerMsg.includes("required") ||
    lowerMsg.includes("wajib") ||
    lowerMsg.includes("field is required")
  ) {
    if (isRefNumber) return "Nomor referensi wajib diisi."
    return `${fieldName} wajib diisi.`
  }

  if (
    lowerMsg.includes("must be a number") ||
    lowerMsg.includes("numeric") ||
    lowerMsg.includes("integer")
  ) {
    return `${fieldName} harus berupa angka yang valid.`
  }

  if (
    lowerMsg.includes("must be at least") ||
    lowerMsg.includes("greater than")
  ) {
    return `${fieldName} harus lebih besar dari batas minimum.`
  }

  if (
    lowerMsg.includes("not found") ||
    lowerMsg.includes("does not exist") ||
    lowerMsg.includes("invalid")
  ) {
    return `${fieldName} yang dipilih tidak valid atau tidak ditemukan.`
  }

  return rawMessage
}

export function getErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan. Silakan coba lagi."
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string
          error?: string
          errors?: Record<string, string[] | string>
        }
      | undefined

    if (
      data?.errors &&
      typeof data.errors === "object" &&
      Object.keys(data.errors).length > 0
    ) {
      const formattedErrors: string[] = []
      for (const [field, messages] of Object.entries(data.errors)) {
        const msgList = Array.isArray(messages) ? messages : [messages]
        for (const msg of msgList) {
          if (typeof msg === "string" && msg.trim()) {
            formattedErrors.push(formatFriendlyErrorMessage(field, msg))
          }
        }
      }
      if (formattedErrors.length === 1) {
        return formattedErrors[0]
      }
      if (formattedErrors.length > 1) {
        return `Validasi gagal:\n• ${formattedErrors.join("\n• ")}`
      }
    }

    if (data?.message) {
      const msg = data.message
      const isGenericValidation =
        /validation error|the given data was invalid|unprocessable entity/i.test(
          msg
        )

      const duplicateSqlMatch = msg.match(/Duplicate entry '([^']+)' for key/i)
      if (duplicateSqlMatch) {
        const val = duplicateSqlMatch[1]
        return `Data "${val}" sudah terdaftar dalam sistem (duplikat). Silakan gunakan nomor atau kode baru.`
      }

      if (isGenericValidation) {
        return "Terdapat kesalahan pengisian data pada formulir. Silakan periksa kembali kolom yang bertanda merah."
      }

      if (/no_?referensi.*already been taken/i.test(msg)) {
        return "Nomor referensi sudah terpakai. Silakan klik tombol refresh untuk membuat nomor referensi baru."
      }

      return msg
    }

    if (data?.error) return data.error

    if (error.response?.status === 422) {
      return "Data yang dikirim tidak valid. Silakan periksa kembali isian formulir."
    }
    if (error.response?.status === 409) {
      return "Terjadi konflik data (kemungkinan nomor referensi atau kode sudah digunakan)."
    }
    if (error.response?.status === 403) {
      return "Anda tidak memiliki hak akses untuk melakukan tindakan ini."
    }
    if (error.response?.status === 404) {
      return "Data atau layanan yang diminta tidak ditemukan."
    }
    if (error.response?.status === 500) {
      return "Terjadi kesalahan pada server. Silakan hubungi admin atau coba beberapa saat lagi."
    }
    if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
      return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
    }
  }

  if (error instanceof Error && error.message) {
    if (error.message.includes("Network Error")) {
      return "Gagal terhubung ke server. Silakan periksa jaringan internet Anda."
    }
    return error.message
  }

  return fallback
}

export function getFieldErrors(error: unknown): Record<string, string[]> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      { errors?: Record<string, string[] | string> } | undefined
    if (data?.errors && typeof data.errors === "object") {
      const result: Record<string, string[]> = {}
      for (const [key, value] of Object.entries(data.errors)) {
        const list = Array.isArray(value) ? value : [value]
        result[key] = list.map((msg) => formatFriendlyErrorMessage(key, msg))
      }
      return result
    }
  }
  return {}
}

const FIELD_KEY_MAP: Record<string, string> = {
  no_referensi: "noReferensi",
  nomor_referensi: "noReferensi",
  reference_number: "noReferensi",
  nomor_surat_jalan: "nomorSuratJalan",
  gudang_id: "gudangId",
  gudang_asal_id: "gudangAsalId",
  gudang_tujuan_id: "gudangTujuanId",
  supplier_id: "supplierId",
  customer_id: "customer",
  barang_id: "barangId",
  lokasi_rak_id: "lokasiRakId",
  kode_rak: "kodeRak",
  min_stok: "stokMin",
  stok_min: "stokMin",
  kategori_id: "kategoriId",
  satuan_id: "satuan",
  nama_lengkap: "namaLengkap",
  nomor_telepon: "nomorTelepon",
  tanggal_bergabung: "tanggalBergabung",
  area_kerja: "areaKerja",
  alamat_pengiriman: "alamatPengiriman",
  periode_minggu: "periodeMinggu",
  periode_mingggu: "periodeMinggu",
  periodeMinggu: "periodeMinggu",
}

import type { FieldValues, UseFormSetError, Path } from "react-hook-form"

export function handleApiValidationErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>
): boolean {
  const fieldErrors = getFieldErrors(error)
  const entries = Object.entries(fieldErrors)
  if (entries.length === 0) return false

  for (const [key, messages] of entries) {
    if (!messages || messages.length === 0) continue
    const msg = messages[0]

    let mappedKey = FIELD_KEY_MAP[key] || key
    if (key.startsWith("details.")) {
      mappedKey = key.replace(/^details\.(\d+)\.(.+)$/, (_, idx, subField) => {
        const sub = FIELD_KEY_MAP[subField] || subField
        return `items.${idx}.${sub}`
      })
    }

    setError(mappedKey as Path<TFieldValues>, {
      type: "server",
      message: msg,
    })
  }

  return true
}

export async function uploadFile(
  file: File
): Promise<{ url: string; path: string; name: string }> {
  const formData = new FormData()
  formData.append("file", file)
  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  const data = response.data?.data
  if (!data?.url) {
    throw new Error("Upload gagal: URL tidak ditemukan pada respons")
  }
  return data as { url: string; path: string; name: string }
}

export async function downloadFile(
  url: string,
  params?: Record<string, unknown>
): Promise<void> {
  const response = await api.get(url, { params, responseType: "blob" })
  const contentType = response.headers["content-type"] ?? ""
  const blob = response.data as Blob
  const contentDisposition = response.headers["content-disposition"]
  let filename = "download"
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";]+)"?/)
    if (match?.[1]) filename = match[1]
  } else if (typeof contentType === "string" && contentType.includes("pdf")) {
    filename = "dokumen.pdf"
  } else {
    filename = "export.xlsx"
  }
  const objectUrl = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = objectUrl
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  link.parentNode?.removeChild(link)
  window.URL.revokeObjectURL(objectUrl)
}

export default api
