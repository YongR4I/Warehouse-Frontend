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
      const isAuthRequest = original.url?.includes("/login") || original.url?.includes("/refresh")
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
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)

export function getErrorMessage(error: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function getFieldErrors(error: unknown): Record<string, string[]> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { errors?: Record<string, string[]> } | undefined
    return data?.errors ?? {}
  }
  return {}
}

export async function uploadFile(file: File): Promise<{ url: string; path: string; name: string }> {
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

export async function downloadFile(url: string, params?: Record<string, unknown>): Promise<void> {
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