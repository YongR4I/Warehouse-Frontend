export type ReferenceType = "BM" | "BK" | "MS" | "SO" | "ADJ" | "PG"

export interface GenerateReferenceOptions {
  date?: Date | string
  existingRefs?: string[]
  currentRef?: string
}

/**
 * Menghasilkan nomor referensi / kode otomatis dengan format standar:
 * - BM (Barang Masuk): BM-YYYYMMDD-XXX (cth: BM-20260819-001)
 * - BK (Barang Keluar): BK-YYYYMMDD-XXX (cth: BK-20260819-001)
 * - MS (Mutasi Stok): MS-YYYYMMDD-XXX (cth: MS-20260819-001)
 * - SO (Stok Opname): SO-YYYYMM-XXX (cth: SO-202608-001)
 * - ADJ (Penyesuaian): ADJ-YYYYMMDD-XXX (cth: ADJ-20260819-001)
 * - PG (Petugas / Pegawai Gudang): PG-XXX (cth: PG-001, PG-005)
 */
export function generateReferenceNumber(
  type: ReferenceType,
  options?: GenerateReferenceOptions | Date | string
): string {
  let dateVal: Date | string = new Date()
  let existingRefs: string[] = []

  if (options) {
    if (options instanceof Date) {
      dateVal = options
    } else if (typeof options === "string") {
      // If a reference string like "BM-20260819-001" or "PG-005" was passed
      if (/^[A-Z]{2,3}(-\d+)+$/i.test(options)) {
        existingRefs.push(options)
      } else {
        dateVal = options
      }
    } else {
      if (options.date) dateVal = options.date
      if (options.existingRefs) existingRefs = [...options.existingRefs]
      if (options.currentRef) existingRefs.push(options.currentRef)
    }
  }

  const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal
  const validDate = isNaN(d.getTime()) ? new Date() : d

  const year = validDate.getFullYear()
  const month = String(validDate.getMonth() + 1).padStart(2, "0")
  const day = String(validDate.getDate()).padStart(2, "0")

  let prefixWithDate = ""
  let pattern: RegExp

  if (type === "PG") {
    prefixWithDate = "PG"
    pattern = /^PG-(\d+)$/i
  } else if (type === "SO") {
    prefixWithDate = `${type}-${year}${month}`
    pattern = new RegExp(`^${prefixWithDate}-(\\d+)$`, "i")
  } else {
    prefixWithDate = `${type}-${year}${month}${day}`
    pattern = new RegExp(`^${prefixWithDate}-(\\d+)$`, "i")
  }

  let maxSeq = 0

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
