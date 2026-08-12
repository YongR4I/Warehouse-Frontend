"use client"
import { useState, useMemo } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { useOpnameStore, type OpnameDetailItem } from "@/store"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import {
  BiClipboard,
  BiCheckCircle,
  BiErrorCircle,
  BiTrendingDown,
  BiCheck,
  BiPlus,
  BiMinus,
} from "react-icons/bi"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export default function AuditOpnamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "edit" // "edit" or "view"

  const noDokumen = useParams<{ id: string }>().id

  const { sessions, details, updateDetailItem, finalizeSession } = useOpnameStore()

  // Find the current session
  const session = useMemo(() => {
    return sessions.find((s) => s.noDokumen === noDokumen)
  }, [sessions, noDokumen])

  // Get detail items
  const sessionItems: OpnameDetailItem[] = useMemo(() => {
    return details[noDokumen] || []
  }, [details, noDokumen])

  // Filters state
  const [searchQuery, setSearchQuery] = useState("")
  const [selisihFilter, setSelisihFilter] = useState<string | null>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Handle count stepper changes
  const handleQtyChange = (itemId: string, currentFisik: number, increment: boolean) => {
    if (mode === "view") return
    const newFisik = increment ? currentFisik + 1 : Math.max(0, currentFisik - 1)
    
    // Automatically set default reason code based on variance
    const item = sessionItems.find((i: OpnameDetailItem) => i.id === itemId)
    if (item) {
      const netSelisih = newFisik - item.stokSistem
      let reasonCode = item.reasonCode
      if (netSelisih === 0) {
        reasonCode = "Tidak ada selisih"
      } else if (item.reasonCode === "Tidak ada selisih" || !item.reasonCode) {
        reasonCode = netSelisih < 0 ? "Barang Rusak" : "Salah Catat"
      }
      updateDetailItem(noDokumen, itemId, { stokFisik: newFisik, reasonCode })
    }
  }

  // Handle details text / dropdown input changes
  const handleItemUpdate = (itemId: string, field: "reasonCode" | "catatan", val: string) => {
    if (mode === "view") return
    updateDetailItem(noDokumen, itemId, { [field]: val })
  }

  // Handle finalization
  const handleFinalize = () => {
    if (mode === "view") return
    
    // Simple confirmation dialog
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menyelesaikan sesi opname ini? Stok sistem akan disesuaikan secara permanen."
    )
    if (confirmed) {
      finalizeSession(noDokumen)
      router.push("/inventory/opname")
    }
  }

  // Computed statistics
  const stats = useMemo(() => {
    const totalSku = sessionItems.length
    const matchSku = sessionItems.filter((i: OpnameDetailItem) => i.selisih === 0).length
    const diffSku = sessionItems.filter((i: OpnameDetailItem) => i.selisih !== 0).length
    const valuationVariance = sessionItems.reduce(
      (sum: number, item: OpnameDetailItem) => sum + item.selisih * item.cost,
      0
    )
    return { totalSku, matchSku, diffSku, valuationVariance }
  }, [sessionItems])

  // Filtered detail list
  const filteredData = useMemo(() => {
    return sessionItems.filter((row: OpnameDetailItem) => {
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        row.name.toLowerCase().includes(query) ||
        row.sku.toLowerCase().includes(query) ||
        row.rak.toLowerCase().includes(query)

      const matchesSelisih =
        !selisihFilter ||
        selisihFilter === "all" ||
        (selisihFilter === "selisih" && row.selisih !== 0) ||
        (selisihFilter === "sesuai" && row.selisih === 0)

      return matchesSearch && matchesSelisih
    })
  }, [sessionItems, searchQuery, selisihFilter])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredData.slice(start, end)
  }, [filteredData, currentPage])

  if (!session) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Sesi Opname Tidak Ditemukan</h2>
        <Button variant="default" onClick={() => router.push("/inventory/opname")}>
          Kembali ke List Opname
        </Button>
      </div>
    )
  }

  // Formatting currency IDR
  const formatValuation = (val: number) => {
    const isNegative = val < 0
    const absVal = Math.abs(val)
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absVal)
    // Replace "Rp" with "Rp " to match image or keep standard format
    const cleanFormatted = formatted.replace("Rp", "Rp ")
    return `${isNegative ? "-" : ""}${cleanFormatted}`
  }

  return (
    <>
      {/* ─── HEADER ─── */}
      <div className="wrapper">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <PageHeader
            items={[
              { label: "Aktivitas Gudang" },
              { label: "Stok Opname", href: "/inventory/opname" },
              { label: session.noDokumen },
            ]}
            title={session.noDokumen}
            icon={BiClipboard}
            description="Audit Stok Opname"
          />
          {mode === "edit" && session.status !== "Selesai" && (
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                onClick={handleFinalize}
                className="h-[42px] rounded-[12px] bg-black font-semibold text-white hover:bg-black/90 active:scale-[0.98] flex items-center gap-2 px-5 shadow-md"
              >
                <BiCheck className="size-5" />
                <span>Finalisasi & Adjust Stok</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ─── METADATA GRID ─── */}
      <div className="wrapper mt-8 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 rounded-2xl border border-border/50 bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div>
          <div className="text-xs text-muted-foreground font-medium">Nomor Referensi</div>
          <div className="text-sm font-bold text-foreground mt-1">{session.noDokumen}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground font-medium">Lokasi Gudang</div>
          <div className="text-sm font-bold text-foreground mt-1">{session.lokasi}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground font-medium">Tanggal Audit</div>
          <div className="text-sm font-bold text-foreground mt-1">{session.tanggal}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground font-medium">Petugas Audit</div>
          <div className="text-sm font-bold text-foreground mt-1">{session.petugas}</div>
        </div>
      </div>

      {/* ─── STATS CARDS ─── */}
      <div className="wrapper mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Item SKU */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-zinc-50 to-zinc-100/50 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <BiClipboard className="size-4.5 text-slate-500" />
            <span>Total Item (SKU)</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {stats.totalSku} SKU
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-400">
            Seluruh barang terdaftar audit
          </div>
        </div>

        {/* Card 2: Stok Sesuai (Match) */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <BiCheckCircle className="size-4.5 text-emerald-600" />
            <span>Stok Sesuai (Match)</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-emerald-700">
              {stats.matchSku} SKU
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-emerald-500">
            Stok fisik == stok sistem
          </div>
        </div>

        {/* Card 3: Terdapat Selisih */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50/50 to-rose-100/30 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
            <BiErrorCircle className="size-4.5 text-rose-600" />
            <span>Terdapat Selisih</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-rose-700">
              {stats.diffSku} SKU
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-rose-500">
            Memerlukan verifikasi lanjutan
          </div>
        </div>

        {/* Card 4: Est. Valuation Selisih */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50/50 to-rose-100/30 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
            <BiTrendingDown className="size-4.5 text-rose-600" />
            <span>Est. Valuation Selisih</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-rose-700">
              {formatValuation(stats.valuationVariance)}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-rose-500">
            Total financial variance
          </div>
        </div>
      </div>

      {/* ─── FILTER BAR ─── */}
      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-3">
          <InputSearch
            placeholder="Cari nama barang, SKU, atau lokasi rak..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="flex-1"
          />
          
          <Opsion
            placeholder="Semua Status Selisih"
            value={selisihFilter || ""}
            onValueChange={(val) => {
              setSelisihFilter(val)
              setCurrentPage(1)
            }}
            className="w-[245px]"
            options={[
              { value: "all", label: "Semua Status Selisih" },
              { value: "selisih", label: "Terdapat Selisih" },
              { value: "sesuai", label: "Stok Sesuai (Match)" },
            ]}
          />
        </div>
      </div>

      {/* ─── TABLE ─── */}
      <div className="wrapper mt-[25px]">
        <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <TableHeader className="border-b border-border/60 bg-white">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case whitespace-nowrap">
                    SKU & Informasi Barang
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case whitespace-nowrap">
                    Lokasi Rak
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case whitespace-nowrap">
                    Satuan
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case whitespace-nowrap text-center">
                    Stok Sistem
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case whitespace-nowrap text-center w-[160px]">
                    Stok Fisik Audit
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case whitespace-nowrap text-center">
                    Selisih
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case whitespace-nowrap w-[200px]">
                    Alasan Selisih (Reason Code)
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case whitespace-nowrap w-[240px]">
                    Catatan Opsional
                  </TableHead>
                  <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case whitespace-nowrap">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row: OpnameDetailItem) => {
                  const selisihVal = row.stokFisik - row.stokSistem
                  
                  return (
                    <TableRow
                      key={row.id}
                      className="h-16 border-b border-border/40 hover:bg-muted/30"
                    >
                      {/* Product Name & SKU */}
                      <TableCell className="pl-6 whitespace-nowrap">
                        <div className="font-semibold text-foreground text-sm leading-none">
                          {row.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {row.sku} <span className="mx-1">•</span> {row.category}
                        </div>
                      </TableCell>

                      {/* Lokasi Rak */}
                      <TableCell className="font-semibold text-foreground text-sm whitespace-nowrap">
                        {row.rak}
                      </TableCell>

                      {/* Satuan */}
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {row.satuan}
                      </TableCell>

                      {/* Stok Sistem */}
                      <TableCell className="text-center font-sans text-sm text-foreground whitespace-nowrap">
                        {row.stokSistem}
                      </TableCell>

                      {/* Stok Fisik Audit Stepper */}
                      <TableCell className="text-center whitespace-nowrap">
                        {mode === "edit" && session.status !== "Selesai" ? (
                          <div className="inline-flex items-center rounded-lg border border-border bg-card p-1">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(row.id, row.stokFisik, false)}
                              className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer active:scale-95"
                            >
                              <BiMinus className="size-3.5" />
                            </button>
                            <input
                              type="text"
                              value={row.stokFisik}
                              readOnly
                              className="w-12 text-center text-sm font-semibold text-foreground bg-transparent border-none outline-none focus:ring-0 select-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleQtyChange(row.id, row.stokFisik, true)}
                              className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer active:scale-95"
                            >
                              <BiPlus className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-semibold text-sm text-foreground">
                            {row.stokFisik}
                          </span>
                        )}
                      </TableCell>

                      {/* Selisih Badge */}
                      <TableCell className="text-center whitespace-nowrap">
                        {selisihVal < 0 ? (
                          <span className="inline-flex items-center justify-center h-6 px-2.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                            {selisihVal}
                          </span>
                        ) : selisihVal > 0 ? (
                          <span className="inline-flex items-center justify-center h-6 px-2.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                            +{selisihVal}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-6 px-2.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            0
                          </span>
                        )}
                      </TableCell>

                      {/* Alasan Selisih Select */}
                      <TableCell className="whitespace-nowrap">
                        {mode === "edit" && session.status !== "Selesai" ? (
                          <Opsion
                            placeholder="Alasan..."
                            value={row.reasonCode || ""}
                            onValueChange={(val) => handleItemUpdate(row.id, "reasonCode", val || "Tidak ada selisih")}
                            className="w-[180px] h-[38px] rounded-lg border-border"
                            options={[
                              { value: "Tidak ada selisih", label: "- Tidak ada selisih -" },
                              { value: "Barang Rusak", label: "Barang Rusak" },
                              { value: "Salah Catat", label: "Salah Catat" },
                              { value: "Penyusutan", label: "Penyusutan / Menguap" },
                              { value: "Kehilangan", label: "Kehilangan / Pencurian" },
                            ]}
                          />
                        ) : (
                          <span className="text-sm text-foreground">
                            {row.reasonCode || "-"}
                          </span>
                        )}
                      </TableCell>

                      {/* Catatan Opsional Text Input */}
                      <TableCell className="whitespace-nowrap">
                        {mode === "edit" && session.status !== "Selesai" ? (
                          <input
                            type="text"
                            value={row.catatan}
                            placeholder="Catatan..."
                            onChange={(e) => handleItemUpdate(row.id, "catatan", e.target.value)}
                            className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
                            {row.catatan || "-"}
                          </span>
                        )}
                      </TableCell>

                      {/* Aksi "Kartu Stok" Button */}
                      <TableCell className="pr-6 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => {
                            window.alert(`Membuka Kartu Stok untuk barang: ${row.name} (${row.sku})`)
                          }}
                          className="h-8.5 rounded-lg border-border bg-card text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground font-semibold"
                        >
                          Kartu Stok
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-48 text-center text-muted-foreground text-sm">
                      Tidak ada barang yang cocok dengan pencarian / filter Anda.
                    </TableCell>
                  </TableRow>
                )}
                {paginatedData.length > 0 && paginatedData.length < itemsPerPage && (
                  <TableRow
                    style={{ height: `${(itemsPerPage - paginatedData.length) * 64}px` }}
                    className="pointer-events-none border-none hover:bg-transparent"
                  >
                    <TableCell colSpan={9} className="border-none p-0" />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter className="border-t border-border/50 bg-white">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={9} className="p-0 align-middle">
                    <div className="bg-white h-14 px-6 flex items-center justify-between text-xs text-muted-foreground font-sans select-none">
                      <span>
                        Menampilkan{" "}
                        {filteredData.length > 0
                          ? (currentPage - 1) * itemsPerPage + 1
                          : 0}
                        -{Math.min(currentPage * itemsPerPage, filteredData.length)} dari{" "}
                        {filteredData.length} data
                      </span>
                      <div className="flex items-center">
                        <div className="flex items-center border border-border/80 rounded-lg overflow-hidden bg-background">
                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 flex items-center justify-center hover:bg-muted text-muted-foreground border-r border-border/80 transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-40"
                          >
                            &lt;
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setCurrentPage(p)}
                              className={cn(
                                "h-8 w-8 flex items-center justify-center border-r border-border/80 transition-colors cursor-pointer",
                                currentPage === p
                                  ? "bg-muted/60 text-foreground font-medium"
                                  : "text-muted-foreground hover:bg-muted"
                              )}
                            >
                              {p}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="h-8 w-8 flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-40"
                          >
                            &gt;
                          </button>
                        </div>
                      </div>
                      <span>10 per halaman</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
