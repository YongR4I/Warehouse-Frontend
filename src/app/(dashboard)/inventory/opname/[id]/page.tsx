"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { useApiDetail, useApiUpdate, useApiAction } from "@/hooks/use-api"
import { useAuthStore } from "@/store/use-auth-store"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api"
import { statusLabel, statusColor, formatDate, formatCurrency } from "@/lib/status"
import {
  BiClipboard,
  BiCheckCircle,
  BiErrorCircle,
  BiTrendingDown,
  BiCheck,
  BiPlus,
  BiMinus,
  BiX,
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
import type { StokOpname, StokOpnamePayload } from "@/types"

interface EditableRow {
  key: string
  barang_id: number
  sku: string
  nama: string
  satuan: string
  stok_sistem: number
  stok_fisik: number
  keterangan: string
  harga_beli: number
}

export default function AuditOpnamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "edit"
  const id = useParams<{ id: string }>().id

  const { data, isLoading } = useApiDetail<StokOpname>({
    key: `opname-${id}`,
    url: `/stok-opname/${id}`,
  })
  const updateMutation = useApiUpdate<StokOpname, StokOpnamePayload>("opname", "/stok-opname")
  const completeMutation = useApiAction("opname", "/stok-opname", "complete")
  const cancelMutation = useApiAction("opname", "/stok-opname", "cancel")
  const hasPermission = useAuthStore((state) => state.hasPermission)

  const session = data?.data

  const [prevSession, setPrevSession] = useState<StokOpname | null | undefined>(session)
  const [editable, setEditable] = useState<EditableRow[]>([])
  const [dirty, setDirty] = useState(false)

  if (session !== prevSession) {
    setPrevSession(session)
    if (session) {
      setEditable(
        (session.details ?? []).map((d, index) => ({
          key: String(d.id ?? index),
          barang_id: d.barang_id,
          sku: d.barang?.sku ?? "-",
          nama: d.barang?.nama ?? `Barang #${d.barang_id}`,
          satuan: d.barang?.satuan?.nama ?? "-",
          stok_sistem: d.stok_sistem ?? 0,
          stok_fisik: d.stok_fisik ?? d.stok_sistem ?? 0,
          keterangan: d.keterangan ?? "",
          harga_beli: d.barang?.harga_beli ?? 0,
        }))
      )
    } else {
      setEditable([])
    }
    setDirty(false)
  }

  const [searchQuery, setSearchQuery] = useState("")
  const [selisihFilter, setSelisihFilter] = useState<string | null>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const isEditable =
    mode === "edit" &&
    (session?.status === "draft" || session?.status === "in_progress") &&
    hasPermission("stok-opname-edit")

  const setRow = (key: string, patch: Partial<EditableRow>) => {
    setEditable((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
    setDirty(true)
  }

  const handleQtyChange = (key: string, increment: boolean) => {
    setEditable((prev) =>
      prev.map((r) => {
        if (r.key !== key) return r
        const next = increment ? r.stok_fisik + 1 : Math.max(0, r.stok_fisik - 1)
        return { ...r, stok_fisik: next }
      })
    )
    setDirty(true)
  }

  const handleSave = async () => {
    if (!session) return
    try {
      const payload: StokOpnamePayload = {
        no_referensi: session.no_referensi,
        gudang_id: session.gudang_id,
        tanggal: session.tanggal,
        keterangan: session.keterangan ?? undefined,
        details: editable.map((r) => ({
          barang_id: r.barang_id,
          stok_sistem: r.stok_sistem,
          stok_fisik: r.stok_fisik,
          keterangan: r.keterangan || undefined,
        })),
      }
      const response = await updateMutation.mutateAsync({ id: session.id, data: payload })
      toast.success(response.message)
      setDirty(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleComplete = async () => {
    if (!window.confirm("Selesaikan opname ini? Backend akan menghitung selisih dan menyesuaikan stok.")) {
      return
    }
    try {
      const response = await completeMutation.mutateAsync(id)
      toast.success(response.message)
      router.push("/inventory/opname")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleCancel = async () => {
    if (!window.confirm("Batalkan sesi opname ini?")) return
    try {
      const response = await cancelMutation.mutateAsync(id)
      toast.success(response.message)
      router.push("/inventory/opname")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const stats = useMemo(() => {
    const totalSku = editable.length
    const matchSku = editable.filter((i) => i.stok_fisik - i.stok_sistem === 0).length
    const diffSku = editable.filter((i) => i.stok_fisik - i.stok_sistem !== 0).length
    const valuationVariance = editable.reduce(
      (sum, item) => sum + (item.stok_fisik - item.stok_sistem) * item.harga_beli,
      0
    )
    return { totalSku, matchSku, diffSku, valuationVariance }
  }, [editable])

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return editable.filter((row) => {
      const matchesSearch =
        !query ||
        row.nama.toLowerCase().includes(query) ||
        row.sku.toLowerCase().includes(query)
      const selisih = row.stok_fisik - row.stok_sistem
      const matchesSelisih =
        !selisihFilter ||
        selisihFilter === "all" ||
        (selisihFilter === "selisih" && selisih !== 0) ||
        (selisihFilter === "sesuai" && selisih === 0)
      return matchesSearch && matchesSelisih
    })
  }, [editable, searchQuery, selisihFilter])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredData.slice(start, end)
  }, [filteredData, currentPage])

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
        Memuat data...
      </div>
    )
  }

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

  const formatValuation = (val: number) => {
    const isNegative = val < 0
    const absVal = Math.abs(val)
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absVal)
    return `${isNegative ? "-" : ""}${formatted}`
  }

  return (
    <>
      <div className="wrapper">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <PageHeader
            items={[
              { label: "Aktivitas Gudang" },
              { label: "Stok Opname", href: "/inventory/opname" },
              { label: session.no_referensi },
            ]}
            title={session.no_referensi}
            icon={BiClipboard}
            description="Audit Stok Opname"
          />
          <div className="flex items-center gap-2">
            {isEditable && (
              <Button
                variant="outline"
                className="h-[42px] rounded-[12px] text-rose-600"
                onClick={handleCancel}
              >
                <BiX className="size-5" />
                <span>Batalkan</span>
              </Button>
            )}
            {isEditable && dirty && (
              <Button
                variant="outline"
                className="h-[42px] rounded-[12px]"
                onClick={handleSave}
              >
                <span>Simpan Perubahan</span>
              </Button>
            )}
            {isEditable && (
              <Button
                variant="default"
                onClick={handleComplete}
                className="h-[42px] rounded-[12px] bg-black font-semibold text-white hover:bg-black/90 active:scale-[0.98] flex items-center gap-2 px-5 shadow-md"
              >
                <BiCheck className="size-5" />
                <span>Finalisasi & Adjust Stok</span>
              </Button>
            )}
            {!isEditable && (
              <div className="flex items-center gap-2">
                <ColoredBadge color={statusColor(session.status)}>
                  {statusLabel(session.status)}
                </ColoredBadge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="wrapper mt-8 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8 rounded-2xl border border-border/50 bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <div>
          <div className="text-xs text-muted-foreground font-medium">Nomor Referensi</div>
          <div className="text-sm font-bold text-foreground mt-1">{session.no_referensi}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground font-medium">Lokasi Gudang</div>
          <div className="text-sm font-bold text-foreground mt-1">
            {session.gudang?.nama ?? "-"}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground font-medium">Tanggal Audit</div>
          <div className="text-sm font-bold text-foreground mt-1">
            {formatDate(session.tanggal)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground font-medium">Status</div>
          <div className="mt-1">
            <ColoredBadge color={statusColor(session.status)}>
              {statusLabel(session.status)}
            </ColoredBadge>
          </div>
        </div>
      </div>

      <div className="wrapper mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case whitespace-nowrap w-[240px]">
                    Catatan Opsional
                  </TableHead>
                  <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case whitespace-nowrap">
                    Nilai
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row) => {
                  const selisihVal = row.stok_fisik - row.stok_sistem
                  return (
                    <TableRow
                      key={row.key}
                      className="h-16 border-b border-border/40 hover:bg-muted/30"
                    >
                      <TableCell className="pl-6 whitespace-nowrap">
                        <div className="font-semibold text-foreground text-sm leading-none">
                          {row.nama}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{row.sku}</div>
                      </TableCell>

                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {row.satuan}
                      </TableCell>

                      <TableCell className="text-center font-sans text-sm text-foreground whitespace-nowrap">
                        {row.stok_sistem}
                      </TableCell>

                      <TableCell className="text-center whitespace-nowrap">
                        {isEditable ? (
                          <div className="inline-flex items-center rounded-lg border border-border bg-card p-1">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(row.key, false)}
                              className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer active:scale-95"
                            >
                              <BiMinus className="size-3.5" />
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={row.stok_fisik}
                              onChange={(e) =>
                                setRow(row.key, { stok_fisik: Number(e.target.value) || 0 })
                              }
                              className="w-14 text-center text-sm font-semibold text-foreground bg-transparent border-none outline-none focus:ring-0"
                            />
                            <button
                              type="button"
                              onClick={() => handleQtyChange(row.key, true)}
                              className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer active:scale-95"
                            >
                              <BiPlus className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-semibold text-sm text-foreground">
                            {row.stok_fisik}
                          </span>
                        )}
                      </TableCell>

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

                      <TableCell className="whitespace-nowrap">
                        {isEditable ? (
                          <input
                            type="text"
                            value={row.keterangan}
                            placeholder="Catatan..."
                            onChange={(e) => setRow(row.key, { keterangan: e.target.value })}
                            className="h-9 w-full rounded-lg border border-border bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
                            {row.keterangan || "-"}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="pr-6 text-right whitespace-nowrap text-sm text-foreground tabular-nums">
                        {formatCurrency(selisihVal * row.harga_beli)}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center text-muted-foreground text-sm">
                      Tidak ada barang yang cocok dengan pencarian / filter Anda.
                    </TableCell>
                  </TableRow>
                )}
                {paginatedData.length > 0 && paginatedData.length < itemsPerPage && (
                  <TableRow
                    style={{ height: `${(itemsPerPage - paginatedData.length) * 64}px` }}
                    className="pointer-events-none border-none hover:bg-transparent"
                  >
                    <TableCell colSpan={7} className="border-none p-0" />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter className="border-t border-border/50 bg-white">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="p-0 align-middle">
                    <div className="bg-white h-14 px-6 flex items-center justify-between text-xs text-muted-foreground font-sans select-none">
                      <span>
                        Menampilkan{" "}
                        {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                        {Math.min(currentPage * itemsPerPage, filteredData.length)} dari{" "}
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
                      <span>{itemsPerPage} per halaman</span>
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