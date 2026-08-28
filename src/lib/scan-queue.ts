import api from "@/lib/api"

// Antrian scan offline utk halaman /scan-absensi (kontrak v4,
// lihat Obsidian TODO-ABSENSI-SCAN): gagal jaringan -> simpan lokal,
// flush POST /absensi/scan/sync saat online kembali.

export interface QueuedScan {
  qr_payload: string
  gudang_id?: number | null
  waktu_scan: string
  client_ref: string
}

export interface ScanSyncItemResult {
  client_ref: string
  ok: boolean
  tipe?: "masuk" | "pulang" | "duplicate"
  error_message?: string
}

const QUEUE_KEY = "scan-absensi-queue"
const MAX_QUEUE = 200

export function loadQueue(): QueuedScan[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? (parsed as QueuedScan[]) : []
  } catch {
    return []
  }
}

function saveQueue(items: QueuedScan[]) {
  window.localStorage.setItem(
    QUEUE_KEY,
    JSON.stringify(items.slice(-MAX_QUEUE))
  )
}

// Format lokal YYYY-MM-DDTHH:mm:ss sesuai kontrak waktu_scan
export function nowForQueue(date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(
    date.getDate()
  )}T${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
}

function makeClientRef(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function enqueueScan(
  qrPayload: string,
  waktuScan = nowForQueue()
): number {
  const items = loadQueue()
  items.push({
    qr_payload: qrPayload,
    gudang_id: null,
    waktu_scan: waktuScan,
    client_ref: makeClientRef(),
  })
  saveQueue(items)
  return Math.min(items.length, MAX_QUEUE)
}

export interface FlushSummary {
  sent: number
  remaining: number
}

// Kirim seluruh antrian. null = tidak mencoba (kosong/offline/gagal jaringan).
// Respons sukses -> item yang sudah diproses server dibuang dari antrian
// (termasuk yang ditolak permanen, mis. kartu invalid — retry tak akan membantu).
export async function flushScanQueue(): Promise<FlushSummary | null> {
  const items = loadQueue()
  if (items.length === 0 || navigator.onLine === false) return null

  let results: ScanSyncItemResult[]
  try {
    const res = await api.post<{
      data: { results: ScanSyncItemResult[] }
    }>("/absensi/scan/sync", { scans: items })
    results = res.data.data.results ?? []
  } catch {
    // Gagal jaringan / server error -> biarkan antrian utuh untuk percobaan berikutnya
    return null
  }

  const doneRefs = new Set(results.map((r) => r.client_ref))
  const remaining = items.filter((item) => !doneRefs.has(item.client_ref))
  saveQueue(remaining)

  return { sent: doneRefs.size, remaining: remaining.length }
}
