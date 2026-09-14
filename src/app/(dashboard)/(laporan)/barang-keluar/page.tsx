"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch, DateRangeFilter } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { TableSkeletonRows } from "@/components/skeletons"
import { useApiList } from "@/hooks/use-api"
import { useOptions, toOptions } from "@/hooks/use-options"
import { useAuthStore } from "@/store/use-auth-store"
import { downloadFile } from "@/lib/api"
import { formatDate, statusColor, statusLabel, formatNumber } from "@/lib/status"
import { toast } from "sonner"
import { ExportModal } from "@/components/export-modal"
import { ReportSummaryCards, type ReportSummaryCardItem } from "@/components/report-summary-cards"
import type { BarangKeluar, Gudang, Customer } from "@/types"
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BiUpArrowCircle,
  BiFile,
  BiChevronRight,
  BiDotsVerticalRounded,
  BiShow,
  BiPrinter,
  BiSolidReport,
  BiLockAlt,
} from "react-icons/bi"
import {
  FileText,
  PackageMinus,
  Users,
  TrendingUp,
} from "lucide-react"

interface ItemWithQuantity {
  qty?: number | string | null
  jumlah?: number | string | null
  quantity?: number | string | null
}

function totalItemLabel(row: BarangKeluar): string {
  const details = row.details ?? []
  if (!details.length) return "-"
  const totalUnits = details.reduce(
    (acc, item) => {
      const it = item as ItemWithQuantity
      return acc + (Number(it.qty || it.jumlah || it.quantity) || 0)
    },
    0
  )
  const totalSKU = details.length
  return `${totalUnits.toLocaleString("id-ID")} unit (${totalSKU} item)`
}

function dokumenName(dokumen?: string | null): string {
  if (!dokumen) return "-"
  const parts = dokumen.split("/")
  return parts[parts.length - 1] || dokumen
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toDateParam(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default function LaporanBarangKeluarPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [gudangFilter, setGudangFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [customerFilter, setCustomerFilter] = useState("all")
  const [fromDate, setFromDate] = useState(() =>
    toDateParam(addDays(new Date(), -30))
  )
  const [toDate, setToDate] = useState(() => toDateParam(new Date()))
  const router = useRouter()

  const deferredSearch = useDeferredValue(search)
  const gudangOptions = useOptions<Gudang>("gudang", "/gudang")
  const customerOptions = useOptions<Customer>("customer", "/customer")

  const gudangItems = [
    { value: "all", label: "Semua Gudang" },
    ...gudangOptions.items.map((g) => ({ value: String(g.id), label: g.nama })),
  ]

  const statusOptions = [
    { value: "all", label: "Semua Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Disetujui" },
    { value: "delivered", label: "Terkirim" },
    { value: "partial", label: "Parsial" },
    { value: "rejected", label: "Ditolak" },
  ]

  const hasPermission = useAuthStore((s) => s.hasPermission)
  const canView = hasPermission("laporan-barang-keluar")

  const { data, isLoading } = useApiList<BarangKeluar>({
    key: "laporan-barang-keluar",
    url: "/laporan/barang-keluar",
    enabled: canView,
    params: {
      page,
      per_page: 15,
      search: deferredSearch.trim() || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      gudang_id: gudangFilter !== "all" ? gudangFilter : undefined,
      customer_id: customerFilter !== "all" ? customerFilter : undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
    },
  })

  const items = useMemo(() => data?.data ?? [], [data?.data])
  const meta = data?.meta
  const total = meta?.total ?? 0
  const perPage = meta?.per_page ?? 15
  const lastPage = meta?.last_page ?? 1

  // Hitung metrik ringkasan
  const summaryMetrics: ReportSummaryCardItem[] = useMemo(() => {
    const totalQty = items.reduce((acc, row) => {
      const rowItem = row as unknown as ItemWithQuantity & {
        details?: ItemWithQuantity[]
      }
      const rowQty =
        rowItem.details?.reduce((sum, d) => {
          return sum + (Number(d.qty || d.jumlah || d.quantity) || 0)
        }, 0) ??
        (Number(rowItem.qty || rowItem.jumlah || rowItem.quantity) || 0)
      return acc + rowQty
    }, 0)

    const uniqueCustomers = new Set(
      items.map((r) => r.customer_id || r.customer?.id).filter(Boolean)
    )

    const completedCount = items.filter(
      (r) => r.status === "delivered" || r.status === "approved"
    ).length
    const completionRate = total > 0 ? (completedCount / items.length) * 100 : 100

    return [
      {
        title: "Total Transaksi Keluar",
        value: formatNumber(total),
        subLabel: "Dokumen",
        description: `Pengeluaran periode ${formatDate(fromDate)} – ${formatDate(toDate)}`,
        icon: FileText,
        badge: {
          text: "Pengeluaran",
          color: "blue",
        },
      },
      {
        title: "Total Qty Barang Keluar",
        value: formatNumber(totalQty),
        subLabel: "Unit",
        description: "Jumlah unit barang yang didistribusikan",
        icon: PackageMinus,
        badge: {
          text: "Distribusi",
          color: "yellow",
        },
      },
      {
        title: "Total Tujuan / Customer",
        value: formatNumber(uniqueCustomers.size),
        subLabel: "Customer / Mitra",
        description: "Destinasi penerima dalam periode laporan",
        icon: Users,
        badge: {
          text: "Destinasi",
          color: "gray",
        },
      },
      {
        title: "Tingkat Penyelesaian (Delivery)",
        value: `${completionRate.toFixed(1)}%`,
        subLabel: `${completedCount} Selesai`,
        description: "Rasio pesanan terkirim/disetujui tepat waktu",
        icon: TrendingUp,
        badge: {
          text: completionRate >= 80 ? "Lancar" : "Perhatian",
          color: completionRate >= 80 ? "green" : "yellow",
        },
      },
    ]
  }, [items, total, fromDate, toDate])

  const handleCetak = async (id: number) => {
    try {
      await downloadFile(`/barang-keluar/${id}/print-surat-jalan`)
      toast.success("Surat jalan berhasil diunduh")
    } catch {
      toast.error("Gagal mengunduh surat jalan")
    }
  }

  // URL Ekspor Excel
  const exportQuery = new URLSearchParams({ format: "excel" })
  if (deferredSearch.trim()) exportQuery.set("search", deferredSearch.trim())
  if (statusFilter !== "all") exportQuery.set("status", statusFilter)
  if (gudangFilter !== "all") exportQuery.set("gudang_id", gudangFilter)
  if (customerFilter !== "all") exportQuery.set("customer_id", customerFilter)
  if (fromDate) exportQuery.set("from", fromDate)
  if (toDate) exportQuery.set("to", toDate)
  const exportUrl = `/laporan/barang-keluar?${exportQuery.toString()}`

  // Pagination page numbers
  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = []
    if (lastPage <= 5) {
      for (let i = 1; i <= lastPage; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push("ellipsis")
      const start = Math.max(2, page - 1)
      const end = Math.min(lastPage - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < lastPage - 2) pages.push("ellipsis")
      pages.push(lastPage)
    }
    return pages
  }, [page, lastPage])

  const rangeStart = total === 0 ? 0 : (page - 1) * perPage + 1
  const rangeEnd = Math.min(page * perPage, total)

  if (!canView) {
    return (
      <div className="wrapper">
        <PageHeader
          items={[{ label: "Pusat Laporan" }, { label: "Laporan Barang Keluar" }]}
          title="Laporan Barang Keluar"
          icon={BiUpArrowCircle}
          description="Laporan komprehensif pengeluaran barang ke pelanggan, volume unit, dan status pengiriman."
        />
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <BiLockAlt className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">Akses Ditolak</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Akun Anda tidak memiliki izin akses (<code>laporan-barang-keluar</code>) untuk melihat halaman laporan ini.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/dashboard")}
          >
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ─── HEADER ─── */}
      <div className="wrapper">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <PageHeader
            items={[{ label: "Pusat Laporan" }, { label: "Laporan Barang Keluar" }]}
            title="Laporan Barang Keluar"
            icon={BiUpArrowCircle}
            description="Laporan komprehensif pengeluaran barang, destinasi customer, volume unit, dan status pengiriman."
          />
          <div className="flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export (.excel/.pdf)
            </Button>
          </div>
        </div>
      </div>

      {/* ─── SUMMARY CARDS ─── */}
      <ReportSummaryCards items={summaryMetrics} isLoading={isLoading} />

      {/* ─── FILTER BAR ─── */}
      <div className="wrapper mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <InputSearch
            placeholder="Cari no. referensi atau customer..."
            className="min-w-[220px] flex-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <DateRangeFilter
            startDate={fromDate}
            endDate={toDate}
            onStartDateChange={(val) => {
              setFromDate(val)
              setPage(1)
            }}
            onEndDateChange={(val) => {
              setToDate(val)
              setPage(1)
            }}
            onChange={({ startDate, endDate }) => {
              setFromDate(startDate)
              setToDate(endDate)
              setPage(1)
            }}
          />
          <Opsion
            options={gudangItems}
            value={gudangFilter}
            onValueChange={(val) => {
              setGudangFilter(val || "all")
              setPage(1)
            }}
          />
          <Opsion
            placeholder="Semua Customer"
            options={[
              { value: "all", label: "Semua Customer" },
              ...toOptions(customerOptions.items),
            ]}
            value={customerFilter}
            onValueChange={(value) => {
              setCustomerFilter(value ?? "all")
              setPage(1)
            }}
          />
          <Opsion
            placeholder="Semua Status"
            options={statusOptions}
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value ?? "all")
              setPage(1)
            }}
          />
        </div>
      </div>

      {/* ─── DATA TABLE (READ-ONLY) ─── */}
      <div className="wrapper mt-[25px] min-w-0">
        <Table>
          <TableHeader className="border-b border-border/60 bg-card">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                No. Referensi
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Gudang Asal
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Customer / Tujuan
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Tanggal
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Total Item
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Dibuat Oleh
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Status
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Dokumen
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="min-h-[300px]">
            {isLoading ? (
              <TableSkeletonRows columns={9} rows={15} />
            ) : items.length === 0 ? (
              <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                <TableCell
                  colSpan={9}
                  className="py-10 text-center font-sans text-sm text-muted-foreground"
                >
                  Tidak ada data laporan barang keluar untuk filter yang dipilih.
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-16 border-b border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                    {row.no_referensi}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.gudang?.nama ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.customer?.nama ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                    {formatDate(row.tanggal)}
                  </TableCell>
                  <TableCell className="font-sans text-sm whitespace-nowrap text-foreground font-medium">
                    {totalItemLabel(row)}
                  </TableCell>
                  <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                    {row.createdBy?.name ?? "-"}
                  </TableCell>
                  <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                    <ColoredBadge color={statusColor(row.status)}>
                      {statusLabel(row.status)}
                    </ColoredBadge>
                  </TableCell>
                  <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                    {row.dokumen ? (
                      <span className="inline-flex items-center gap-0.5 rounded-[4px] border border-border/80 bg-card px-1.5 py-0.5 text-[11px] leading-none whitespace-nowrap text-muted-foreground">
                        <BiFile className="size-3 text-muted-foreground/80" />
                        <span>{dokumenName(row.dokumen)}</span>
                      </span>
                    ) : (
                      <span className="font-sans whitespace-nowrap text-muted-foreground">
                        -
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <button
                        className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted"
                        title="Lihat Detail"
                        onClick={() =>
                          router.push(`/inventory/barang-keluar/${row.id}`)
                        }
                      >
                        <BiChevronRight className="size-4 text-foreground/75" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors outline-none hover:bg-muted">
                          <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Aksi Laporan</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/inventory/barang-keluar/${row.id}`)
                            }
                          >
                            <BiShow />
                            <span>Lihat Detail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCetak(row.id)}>
                            <BiPrinter />
                            <span>Cetak Surat Jalan</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-card">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={9} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-card px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Menampilkan {rangeStart}-{rangeEnd} dari {total} data
                  </span>
                  <div className="flex items-center">
                    <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || lastPage === 0}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                      >
                        &lt;
                      </button>
                      {pageNumbers.map((p, idx) =>
                        p === "ellipsis" ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="flex h-8 w-8 items-center justify-center border-r border-border/80 text-muted-foreground"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPage(p)}
                            className={
                              p === page
                                ? "flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 bg-muted/60 font-medium text-foreground transition-colors"
                                : "flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted"
                            }
                          >
                            {p}
                          </button>
                        )
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setPage((p) => Math.min(lastPage, p + 1))
                        }
                        disabled={page === lastPage || lastPage === 0}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                  <span>{perPage} per halaman</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* ─── EXPORT MODAL ─── */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Laporan Barang Keluar"
        totalItemsCount={total}
        totalItemsLabel="Total Transaksi"
        filterLabel="Filter Aktif"
        exportUrl={exportUrl}
        checkboxes={[
          { id: "no_referensi", label: "No. Referensi", defaultChecked: true },
          { id: "tanggal", label: "Tanggal Pengeluaran", defaultChecked: true },
          { id: "customer", label: "Customer / Penerima", defaultChecked: true },
          { id: "gudang", label: "Gudang Asal", defaultChecked: true },
          { id: "qty", label: "Total Qty Item", defaultChecked: true },
          { id: "status", label: "Status Pengiriman", defaultChecked: true },
        ]}
      />
    </>
  )
}