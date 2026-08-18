"use client"

import { useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { ColoredBadge } from "@/components/ui/colored-badge"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useApiDetail, useApiAction } from "@/hooks/use-api"
import { useAuthStore } from "@/store/use-auth-store"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api"
import { statusLabel, statusColor, formatDate } from "@/lib/status"
import { BiTransfer, BiCheck, BiX, BiCheckDouble } from "react-icons/bi"
import type { MutasiStok } from "@/types"

export default function MutasiDetailPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const { data, isLoading } = useApiDetail<MutasiStok>({
    key: `mutasi-${id}`,
    url: `/mutasi-stok/${id}`,
  })
  const approveMutation = useApiAction("mutasi", "/mutasi-stok", "approve")
  const rejectMutation = useApiAction("mutasi", "/mutasi-stok", "reject")
  const completeMutation = useApiAction("mutasi", "/mutasi-stok", "complete")
  const hasPermission = useAuthStore((state) => state.hasPermission)

  const info = data?.data

  const items = useMemo(() => {
    if (!info) return []
    if (info.details && info.details.length > 0) return info.details
    if (info.barang_id) {
      return [
        {
          id: info.id,
          barang_id: info.barang_id,
          qty: info.qty ?? 0,
          barang: info.barang,
        },
      ]
    }
    return []
  }, [info])

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return items.filter(
      (row) =>
        !query ||
        row.barang?.nama?.toLowerCase().includes(query) ||
        row.barang?.sku?.toLowerCase().includes(query)
    )
  }, [items, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredData.slice(start, end)
  }, [filteredData, currentPage])

  const runAction = async (
    mutation: typeof approveMutation,
    action: string,
    message: string
  ) => {
    try {
      const response = await mutation.mutateAsync(id)
      toast.success(response.message ?? message)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
        Memuat data...
      </div>
    )
  }

  if (!info) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Dokumen Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground">
          Mutasi dengan ID {id} tidak ada.
        </p>
        <Button variant="default" onClick={() => router.push("/inventory/mutasi")}>
          Kembali ke Mutasi Stok
        </Button>
      </div>
    )
  }

  return (
    <div className="font-sans">
      <div className="wrapper">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <PageHeader
            items={[
              { label: "AKTIVITAS GUDANG" },
              { label: "MUTASI STOK", href: "/inventory/mutasi" },
              { label: info.no_referensi },
            ]}
            title={
              <span className="flex items-center gap-2.5">
                <span>{info.no_referensi}</span>
              </span>
            }
            description={`Dibuat oleh ${info.createdBy?.name ?? "-"} · ${formatDate(info.tanggal)}`}
            icon={BiTransfer}
          />
          <div className="flex items-center gap-2">
            {info.status === "pending" && hasPermission("mutasi-stok-approve") && (
              <>
                <Button
                  variant="outline"
                  className="h-[42px] rounded-[12px] text-rose-600"
                  onClick={() =>
                    runAction(rejectMutation, "reject", "Mutasi ditolak")
                  }
                >
                  <BiX className="size-5" />
                  <span>Tolak</span>
                </Button>
                <Button
                  variant="default"
                  className="h-[42px] rounded-[12px] bg-black font-semibold text-white hover:bg-black/90"
                  onClick={() =>
                    runAction(approveMutation, "approve", "Mutasi disetujui")
                  }
                >
                  <BiCheck className="size-5" />
                  <span>Setujui</span>
                </Button>
              </>
            )}
            {info.status === "approved" && hasPermission("mutasi-stok-complete") && (
              <Button
                variant="default"
                className="h-[42px] rounded-[12px] bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                onClick={() =>
                  window.confirm("Selesaikan mutasi ini? Stok akan berpindah gudang.") &&
                  runAction(completeMutation, "complete", "Mutasi selesai")
                }
              >
                <BiCheckDouble className="size-5" />
                <span>Selesaikan</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="wrapper mt-10 flex flex-wrap items-start justify-between gap-x-8 gap-y-6">
        <div>
          <div className="text-xs font-normal text-[#857F78]">Gudang Asal</div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.gudang_asal?.nama ?? "-"}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-[#857F78]">Gudang Tujuan</div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.gudang_tujuan?.nama ?? "-"}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-[#857F78]">Keterangan</div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {info.keterangan || "-"}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-[#857F78]">Status</div>
          <div className="mt-1">
            <ColoredBadge color={statusColor(info.status)}>
              {statusLabel(info.status)}
            </ColoredBadge>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[45px]">
        <div className="flex items-center gap-3">
          <InputSearch
            placeholder="Cari nama barang atau SKU..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="flex-1"
          />
        </div>
      </div>

      <div className="wrapper mt-[25px]">
        <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-white shadow-xs">
          <div className="w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <TableHeader className="border-b border-border/40 bg-white">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    SKU
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Nama Barang
                  </TableHead>
                  <TableHead className="text-center text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Qty Mutasi
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Satuan
                  </TableHead>
                  <TableHead className="pr-6 text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Keterangan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row) => (
                  <TableRow
                    key={row.id ?? `${row.barang_id}-${row.qty}`}
                    className="h-16 border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="pl-6 font-sans text-sm font-medium whitespace-nowrap text-foreground">
                      {row.barang?.sku ?? "-"}
                    </TableCell>
                    <TableCell className="font-sans text-sm font-semibold whitespace-nowrap text-foreground">
                      {row.barang?.nama ?? "-"}
                    </TableCell>
                    <TableCell className="font-sans text-center text-sm whitespace-nowrap text-foreground">
                      {row.qty}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.barang?.satuan?.nama ?? "-"}
                    </TableCell>
                    <TableCell className="font-sans pr-6 text-sm whitespace-nowrap text-[#857F78]">
                      {info.keterangan || "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="font-sans h-48 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data barang.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter className="border-t border-border/40 bg-white">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="p-0 align-middle">
                    <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground select-none">
                      <span>
                        Menampilkan{" "}
                        {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                        {Math.min(currentPage * itemsPerPage, filteredData.length)} dari{" "}
                        {filteredData.length} data
                      </span>
                      <div className="flex items-center">
                        <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                          >
                            &lt;
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setCurrentPage(p)}
                              className={cn(
                                "flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 transition-colors",
                                currentPage === p
                                  ? "bg-muted/60 font-medium text-foreground"
                                  : "text-muted-foreground hover:bg-muted"
                              )}
                            >
                              {p}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
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
    </div>
  )
}