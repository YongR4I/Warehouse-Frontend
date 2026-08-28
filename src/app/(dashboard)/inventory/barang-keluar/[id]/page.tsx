"use client"

import { useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { useApiDetail, useApiAction } from "@/hooks/use-api"
import { getErrorMessage } from "@/lib/api"
import api from "@/lib/api"
import axios from "axios"
import {
  formatDate,
  formatCurrency,
  formatNumber,
  statusColor,
  statusLabel,
} from "@/lib/status"
import { useAuthStore } from "@/store/use-auth-store"
import { toast } from "sonner"
import type { BarangKeluar } from "@/types"
import { BiCheck, BiX, BiFileBlank, BiPrinter, BiSend } from "react-icons/bi"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { DetailPageSkeleton } from "@/components/skeletons"

export default function BarangKeluarDetailPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const queryClient = useQueryClient()

  const { data, isLoading } = useApiDetail<BarangKeluar>({
    key: `barang-keluar-${id}`,
    url: `/barang-keluar/${id}`,
  })
  const doc = data?.data

  const approveMutation = useApiAction(
    "barang-keluar",
    "/barang-keluar",
    "approve"
  )
  const rejectMutation = useApiAction(
    "barang-keluar",
    "/barang-keluar",
    "reject"
  )
  const deliverMutation = useApiAction(
    "barang-keluar",
    "/barang-keluar",
    "deliver"
  )

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const allItems = useMemo(() => doc?.details ?? [], [doc])

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return allItems.filter(
      (row) =>
        !query ||
        row.barang?.nama?.toLowerCase().includes(query) ||
        row.barang?.sku?.toLowerCase().includes(query)
    )
  }, [allItems, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredData.slice(start, end)
  }, [filteredData, currentPage])

  const [isPrinting, setIsPrinting] = useState(false)

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["barang-keluar"] })
    queryClient.invalidateQueries({ queryKey: [`barang-keluar-${id}`] })
  }

  const handleApprove = async () => {
    try {
      const res = await approveMutation.mutateAsync(Number(id))
      toast.success(res.message)
      invalidateQueries()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleReject = async () => {
    try {
      const res = await rejectMutation.mutateAsync(Number(id))
      toast.success(res.message)
      invalidateQueries()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleDeliver = async () => {
    try {
      const res = await deliverMutation.mutateAsync(Number(id))
      toast.success(res.message)
      invalidateQueries()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handlePrint = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsPrinting(true)
    try {
      const response = await api.get(`/barang-keluar/${id}/print-surat-jalan`, {
        responseType: "blob",
      })
      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      window.open(url, "_blank")
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined
      if (status === 403) {
        toast.error(
          "Anda tidak memiliki izin (permission: barang-keluar-print) untuk mencetak surat jalan."
        )
      } else if (status === 401) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.")
      } else {
        toast.error(
          "Gagal mengunduh PDF Surat Jalan. Mohon coba beberapa saat lagi."
        )
      }
    } finally {
      setIsPrinting(false)
    }
  }

  const canApprove =
    doc?.status === "pending" &&
    useAuthStore.getState().hasPermission("barang-keluar-approve")
  const canDeliver =
    doc?.status === "approved" &&
    useAuthStore.getState().hasPermission("barang-keluar-deliver")

  if (isLoading) {
    return <DetailPageSkeleton metaCount={9} columns={6} rows={6} />
  }

  if (!doc) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Dokumen Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground">
          Pengeluaran barang dengan ID {id} tidak ada.
        </p>
        <Button
          variant="default"
          onClick={() => router.push("/inventory/barang-keluar")}
        >
          Kembali ke Keluar Barang (Out)
        </Button>
      </div>
    )
  }

  const statusDot =
    doc.status === "approved"
      ? "bg-[#22C55E]"
      : doc.status === "pending"
        ? "bg-amber-500"
        : doc.status === "rejected"
          ? "bg-rose-500"
          : "bg-slate-400"

  return (
    <div className="font-sans">
      <div className="wrapper">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <PageHeader
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Aktivitas Gudang" },
              {
                label: "Keluar Barang (Out)",
                href: "/inventory/barang-keluar",
              },
              { label: doc.no_referensi },
            ]}
            title={
              <span className="flex items-center gap-2.5">
                <span>{doc.no_referensi}</span>
                <span
                  className={cn(
                    "inline-block size-3 shrink-0 rounded-full",
                    statusDot
                  )}
                />
              </span>
            }
            description={`Dibuat oleh ${doc.createdBy?.name ?? "-"} · ${formatDate(doc.tanggal)}`}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={isPrinting}
            >
              <BiPrinter className="mr-1.5" />
              {isPrinting ? "Membuka PDF..." : "Cetak Surat Jalan"}
            </Button>
            {canApprove && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                >
                  <BiX className="mr-1.5" />
                  Tolak
                </Button>
                <Button
                  variant="default"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  <BiCheck className="mr-1.5" />
                  Approve
                </Button>
              </>
            )}
            {canDeliver && (
              <Button
                variant="default"
                onClick={handleDeliver}
                disabled={deliverMutation.isPending}
              >
                <BiSend className="mr-1.5" />
                Kirim Barang
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="wrapper mt-10 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <div className="text-xs font-normal text-muted-foreground">
            Gudang Tujuan
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {doc.gudang?.nama ?? "-"}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-muted-foreground">Customer</div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {doc.customer?.nama ?? "-"}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-muted-foreground">Tanggal</div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {formatDate(doc.tanggal)}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-muted-foreground">Dibuat oleh</div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {doc.createdBy?.name ?? "-"}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-muted-foreground">
            Disetujui oleh
          </div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {doc.approvedBy?.name ?? "-"}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-muted-foreground">Dikirim oleh</div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {doc.deliveredBy?.name ?? "-"}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-muted-foreground">Keterangan</div>
          <div className="mt-1 text-sm font-bold text-foreground">
            {doc.keterangan ?? "-"}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-muted-foreground">Dokumen</div>
          <div className="mt-1">
            {doc.dokumen ? (
              <a
                href="#"
                onClick={handlePrint}
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-semibold text-[#0284C7] hover:underline",
                  isPrinting && "pointer-events-none opacity-50"
                )}
              >
                <BiFileBlank className="size-4 shrink-0 text-[#0284C7]" />
                <span>Surat Jalan</span>
              </a>
            ) : (
              <span className="text-sm font-bold text-foreground">-</span>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-normal text-muted-foreground">Status</div>
          <div className="mt-1">
            <ColoredBadge color={statusColor(doc.status)}>
              {statusLabel(doc.status)}
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
        <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs">
          <div className="w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <TableHeader className="border-b border-border/40 bg-card">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    SKU
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Nama barang
                  </TableHead>
                  <TableHead className="text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Lokasi rak
                  </TableHead>
                  <TableHead className="text-center text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Qty
                  </TableHead>
                  <TableHead className="text-right text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Harga satuan
                  </TableHead>
                  <TableHead className="pr-6 text-right text-xs font-bold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Subtotal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow
                    key={row.id ?? `${row.barang_id}-${index}`}
                    className="h-16 border-b border-border/40 transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="pl-6 font-sans text-sm font-medium whitespace-nowrap text-foreground">
                      {row.barang?.sku ?? "-"}
                    </TableCell>
                    <TableCell className="font-sans text-sm font-semibold whitespace-nowrap text-foreground">
                      {row.barang?.nama ?? "-"}
                    </TableCell>
                    <TableCell className="font-sans text-sm leading-tight whitespace-pre-line text-muted-foreground">
                      {row.lokasi_rak?.kode_rak ?? "-"}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                      {formatNumber(row.qty)}
                    </TableCell>
                    <TableCell className="text-right font-sans text-sm whitespace-nowrap text-foreground tabular-nums">
                      {formatCurrency(row.harga_satuan)}
                    </TableCell>
                    <TableCell className="pr-6 text-right font-sans text-sm whitespace-nowrap text-foreground tabular-nums">
                      {formatCurrency((row.qty ?? 0) * (row.harga_satuan ?? 0))}
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-48 text-center font-sans text-sm text-muted-foreground"
                    >
                      Tidak ada data barang.
                    </TableCell>
                  </TableRow>
                )}
                {paginatedData.length > 0 &&
                  paginatedData.length < itemsPerPage && (
                    <TableRow
                      style={{
                        height: `${(itemsPerPage - paginatedData.length) * 64}px`,
                      }}
                      className="pointer-events-none border-none hover:bg-transparent"
                    >
                      <TableCell colSpan={6} className="border-none p-0" />
                    </TableRow>
                  )}
              </TableBody>
              <TableFooter className="border-t border-border/40 bg-card">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="p-0 align-middle">
                    <div className="flex h-14 items-center justify-between bg-card px-6 font-sans text-xs text-muted-foreground select-none">
                      <span>
                        Menampilkan{" "}
                        {filteredData.length > 0
                          ? (currentPage - 1) * itemsPerPage + 1
                          : 0}
                        -
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredData.length
                        )}{" "}
                        dari {filteredData.length} data
                      </span>
                      <div className="flex items-center">
                        <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                          >
                            &lt;
                          </button>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((p) => (
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
                            onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
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