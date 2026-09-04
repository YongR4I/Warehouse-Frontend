"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { ExportModal } from "@/components/export-modal"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch, DateRangeFilter } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { Card } from "@/components/ui/card"
import { TableSkeletonRows, StatGridSkeleton } from "@/components/skeletons"
import { useApiList } from "@/hooks/use-api"
import { useOptions, toOptions } from "@/hooks/use-options"
import { formatDate, formatNumber } from "@/lib/status"
import type { Gudang, Customer, LaporanRow } from "@/types"
import {
  BiSolidReport,
  BiChevronRight,
  BiTrendingUp,
} from "react-icons/bi"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

function unwrapRows<T>(data: unknown): T[] {
  const body = data as { data?: unknown } | T[] | null | undefined
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === "object" && Array.isArray(body.data)) {
    return body.data as T[]
  }
  return []
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
  const [searchQuery, setSearchQuery] = useState("")
  const [gudangFilter, setGudangFilter] = useState<string | null>(null)
  const [customerFilter, setCustomerFilter] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState(() =>
    toDateParam(addDays(new Date(), -30))
  )
  const [toDate, setToDate] = useState(() => toDateParam(new Date()))
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const deferredSearch = useDeferredValue(searchQuery)
  const gudangOptions = useOptions<Gudang>("gudang", "/gudang")
  const customerOptions = useOptions<Customer>("customer", "/customer")

  const gudangId =
    gudangFilter && gudangFilter !== "all" ? gudangFilter : undefined
  const customerId =
    customerFilter && customerFilter !== "all" ? customerFilter : undefined

  const laporanParams = useMemo(
    () => ({
      gudang_id: gudangId,
      customer_id: customerId,
      from: fromDate,
      to: toDate,
      per_page: itemsPerPage,
    }),
    [gudangId, customerId, fromDate, toDate]
  )

  const query = useApiList<LaporanRow>({
    key: "laporan-barang-keluar",
    url: "/laporan/barang-keluar",
    params: laporanParams,
  })

  const rawLaporan = unwrapRows<LaporanRow>(query.data)

  const filteredData = useMemo(() => {
    const queryStr = deferredSearch.toLowerCase().trim()
    if (!queryStr) return rawLaporan
    return rawLaporan.filter((row) => {
      return (
        (row.no_referensi ?? "").toLowerCase().includes(queryStr) ||
        (row.customer_nama ?? "").toLowerCase().includes(queryStr) ||
        (row.gudang_nama ?? "").toLowerCase().includes(queryStr)
      )
    })
  }, [rawLaporan, deferredSearch])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredData.slice(start, start + itemsPerPage)
  }, [filteredData, currentPage])

  const totalItems = useMemo(
    () => rawLaporan.reduce((acc, row) => acc + (row.total_qty ?? 0), 0),
    [rawLaporan]
  )

  const isLoading = query.isLoading

  const exportUrl = `/laporan/barang-keluar?format=excel&from=${fromDate}&to=${toDate}${
    gudangId ? `&gudang_id=${gudangId}` : ""
  }${customerId ? `&customer_id=${customerId}` : ""}`

  const renderPagination = (
    currentPage: number,
    lastPage: number,
    onPageChange: (page: number) => void
  ) => {
    if (lastPage <= 1) return null
    const buttons = []
    for (let i = 1; i <= lastPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 font-medium transition-colors last:border-r-0 ${
            currentPage === i
              ? "bg-muted/60 text-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {i}
        </button>
      )
    }
    return (
      <div className="flex items-center">
        <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            &lt;
          </button>
          {buttons}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= lastPage}
            className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            &gt;
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header Section */}
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Laporan" },
              { label: "Barang Keluar" },
            ]}
            title="Laporan Barang Keluar"
            icon={BiTrendingUp}
            description="Laporan pengeluaran barang ke customer dengan detail transaksi."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export (.excel/.pdf)
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Section */}
      {isLoading ? (
        <div className="wrapper mt-6">
          <StatGridSkeleton count={2} />
        </div>
      ) : (
        <div className="wrapper mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2">
            {/* Card 1: Total Transaksi */}
            <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-full flex-col justify-between px-5 py-4">
                <div className="flex items-center gap-2">
                  <BiSolidReport className="size-4 text-blue-500" />
                  <span className="text-sm font-medium text-foreground">
                    Total Transaksi
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {formatNumber(rawLaporan.length)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Dokumen
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Periode {fromDate} s/d {toDate}
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 2: Total Unit Keluar */}
            <Card className="min-h-[114px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-full flex-col justify-between px-5 py-4">
                <div className="flex items-center gap-2">
                  <BiTrendingUp className="size-4 text-rose-500" />
                  <span className="text-sm font-medium text-foreground">
                    Total Unit Keluar
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {formatNumber(totalItems)}
                    </span>
                    <span className="text-xs text-muted-foreground">Unit</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Jumlah keseluruhan barang keluar
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="wrapper mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <InputSearch
            placeholder="Cari no. referensi, customer, atau gudang..."
            className="flex-1"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
          <DateRangeFilter
            startDate={fromDate}
            endDate={toDate}
            onStartDateChange={(val) => {
              setFromDate(val)
              setCurrentPage(1)
            }}
            onEndDateChange={(val) => {
              setToDate(val)
              setCurrentPage(1)
            }}
            onChange={({ startDate, endDate }) => {
              setFromDate(startDate)
              setToDate(endDate)
              setCurrentPage(1)
            }}
          />
          <Opsion
            placeholder="Semua Gudang"
            value={gudangFilter ?? ""}
            onValueChange={(val) => {
              setGudangFilter(val || null)
              setCurrentPage(1)
            }}
            options={[
              { value: "all", label: "Semua Gudang" },
              ...toOptions(gudangOptions.items),
            ]}
          />
          <Opsion
            placeholder="Semua Customer"
            value={customerFilter ?? ""}
            onValueChange={(val) => {
              setCustomerFilter(val || null)
              setCurrentPage(1)
            }}
            options={[
              { value: "all", label: "Semua Customer" },
              ...toOptions(customerOptions.items),
            ]}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="wrapper mt-[25px] w-full min-w-0">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1400px] table-fixed caption-bottom text-sm">
              <TableHeader className="border-b border-border/60 bg-card">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="w-[120px] pl-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Tanggal
                  </TableHead>
                  <TableHead className="w-[140px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    No. Referensi
                  </TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Customer
                  </TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Gudang
                  </TableHead>
                  <TableHead className="w-[100px] text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Status
                  </TableHead>
                  <TableHead className="w-[100px] text-right pr-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Total Qty
                  </TableHead>
                  <TableHead className="w-[56px] pr-6 text-right text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="min-h-[300px]">
                {isLoading && <TableSkeletonRows columns={7} rows={itemsPerPage} />}
                {!isLoading && paginatedData.length === 0 && (
                  <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                    <TableCell
                      colSpan={7}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data barang keluar pada periode ini.
                    </TableCell>
                  </TableRow>
                )}
                {paginatedData.map((row) => (
                  <TableRow
                    key={row.id ?? row.no_referensi}
                    className="h-16 border-b border-border/40 hover:bg-muted/30"
                  >
                    <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                      {formatDate(row.tanggal)}
                    </TableCell>
                    <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-foreground">
                      {row.no_referensi ?? "-"}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.customer_nama ?? "-"}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.gudang_nama ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <ColoredBadge
                        color={
                          row.status === "delivered"
                            ? "green"
                            : row.status === "rejected"
                              ? "red"
                              : row.status === "partial"
                                ? "yellow"
                                : "gray"
                        }
                      >
                        {row.status_label ?? row.status}
                      </ColoredBadge>
                    </TableCell>
                    <TableCell className="pr-6 text-right font-sans text-sm font-semibold whitespace-nowrap">
                      {formatNumber(row.total_qty ?? 0)}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <button className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <BiChevronRight className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedData.length > 0 && paginatedData.length < 5 && (
                  <TableRow
                    style={{ height: `${300 - paginatedData.length * 64}px` }}
                    className="pointer-events-none border-none hover:bg-transparent"
                  >
                    <TableCell colSpan={7} className="border-none p-0" />
                  </TableRow>
                )}
              </TableBody>
            </table>
          </div>
          <div className="flex h-14 items-center justify-between border-t border-border/50 bg-card px-6 font-sans text-xs text-muted-foreground">
            <span>
              Menampilkan{" "}
              {filteredData.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}-
              {Math.min(currentPage * itemsPerPage, filteredData.length)} dari{" "}
              {filteredData.length} data
            </span>
            {renderPagination(
              currentPage,
              totalPages,
              setCurrentPage
            )}
            <span>{itemsPerPage} per halaman</span>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Laporan Barang Keluar"
        totalItemsCount={filteredData.length}
        totalItemsLabel="Total Transaksi"
        filterLabel="Filter Aktif"
        exportUrl={exportUrl}
        checkboxes={[
          {
            id: "tanggal",
            label: "Tanggal",
            defaultChecked: true,
          },
          {
            id: "noReferensi",
            label: "No. Referensi",
            defaultChecked: true,
          },
          {
            id: "customer",
            label: "Customer",
            defaultChecked: true,
          },
          {
            id: "gudang",
            label: "Gudang",
            defaultChecked: true,
          },
          {
            id: "status",
            label: "Status",
            defaultChecked: true,
          },
          {
            id: "qty",
            label: "Total Quantity",
            defaultChecked: true,
          },
        ]}
      />
    </>
  )
}
