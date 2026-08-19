export type ReferenceType = "BM" | "BK" | "MS" | "SO" | "ADJ"

export interface GenerateReferenceOptions {
  date?: Date | string
  existingRefs?: string[]
}

/**
 * Menghasilkan nomor referensi otomatis dengan format standar:
 * - BM (Barang Masuk): BM-YYYYMMDD-XXX (cth: BM-20260819-001)
 * - BK (Barang Keluar): BK-YYYYMMDD-XXX (cth: BK-20260819-001)
 * - MS (Mutasi Stok): MS-YYYYMMDD-XXX (cth: MS-20260819-001)
 * - SO (Stok Opname): SO-YYYYMM-XXX (cth: SO-202608-001)
 * - ADJ (Penyesuaian): ADJ-YYYYMMDD-XXX (cth: ADJ-20260819-001)
 */
export function generateReferenceNumber(
  type: ReferenceType,
  options?: GenerateReferenceOptions | Date | string
): string {
  let dateVal: Date | string = new Date()
  let existingRefs: string[] = []

  if (options) {
    if (options instanceof Date || typeof options === "string") {
      dateVal = options
    } else {
      if (options.date) dateVal = options.date
      if (options.existingRefs) existingRefs = options.existingRefs
    }
  }

  const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal
  const validDate = isNaN(d.getTime()) ? new Date() : d

  const year = validDate.getFullYear()
  const month = String(validDate.getMonth() + 1).padStart(2, "0")
  const day = String(validDate.getDate()).padStart(2, "0")

  let prefixWithDate = ""
  if (type === "SO") {
    prefixWithDate = `${type}-${year}${month}`
  } else {
    prefixWithDate = `${type}-${year}${month}${day}`
  }

  let maxSeq = 0
  const pattern = new RegExp(`^${prefixWithDate}-(\\d+)$`, "i")

  if (existingRefs && existingRefs.length > 0) {
    for (const ref of existingRefs) {
      if (!ref) continue
      const match = ref.trim().match(pattern)
      if (match) {
        const seq = parseInt(match[1], 10)
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq
        }
      }
    }
  }

  const nextSeq = String(maxSeq + 1).padStart(3, "0")
  return `${prefixWithDate}-${nextSeq}`
}
