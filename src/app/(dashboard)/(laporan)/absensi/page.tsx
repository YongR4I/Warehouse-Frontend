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
import { formatDate } from "@/lib/status"
import type { Gudang, User } from "@/types"
import {
  BiSolidReport,
  BiUserCheck,
  BiChevronRight,
} from "react-icons/bi"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

interface AbsensiLaporanRow extends Record<string, unknown> {
  id?: number
  tanggal?: string
  jam_masuk?: string | null
  jam_pulang?: string | null
  status?: string
  keterangan?: string | null
  user_name?: string
  gudang_nama?: string
  shift_nama?: string
  status_label?: string
}

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

export default function LaporanAbsensiPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [gudangFilter, setGudangFilter] = useState<string | null>(null)
  const [userFilter, setUserFilter] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState(() =>
    toDateParam(addDays(new Date(), -30))
  )
  const [toDate, setToDate] = useState(() => toDateParam(new Date()))
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const deferredSearch = useDeferredValue(searchQuery)
  const gudangOptions = useOptions<Gudang>("gudang", "/gudang")
  const userOptions = useOptions<User>("user", "/user")

  const gudangId =
    gudangFilter && gudangFilter !== "all" ? gudangFilter : undefined
  const userId = userFilter && userFilter !== "all" ? userFilter : undefined

  const laporanParams = useMemo(
    () => ({
      gudang_id: gudangId,
      user_id: userId,
      from: fromDate,
      to: toDate,
      per_page: itemsPerPage,
    }),
    [gudangId, userId, fromDate, toDate]
  )

  const query = useApiList<AbsensiLaporanRow>({
    key: "laporan-absensi",
    url: "/laporan/absensi",
    params: laporanParams,
  })

  const rawLaporan = unwrapRows<AbsensiLaporanRow>(query.data)

  const filteredData = useMemo(() => {
    const queryStr = deferredSearch.toLowerCase().trim()
    if (!queryStr) return rawLaporan
    return rawLaporan.filter((row) => {
      return (
        ((row.user_name ?? "") as string).toLowerCase().includes(queryStr) ||
        ((row.gudang_nama ?? "") as string).toLowerCase().includes(queryStr) ||
        ((row.shift_nama ?? "") as string).toLowerCase().includes(queryStr)
      )
    })
  }, [rawLaporan, deferredSearch])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredData.slice(start, start + itemsPerPage)
  }, [filteredData, currentPage])

  const summaryStats = useMemo(() => {
    const hadir = rawLaporan.filter((r) => (r.status as string | undefined) === "hadir").length
    const terlambat = rawLaporan.filter((r) => (r.status as string | undefined) === "terlambat").length
    const sakit = rawLaporan.filter((r) => (r.status as string | undefined) === "sakit").length
    const izin = rawLaporan.filter((r) => (r.status as string | undefined) === "izin").length
    const alpha = rawLaporan.filter((r) => (r.status as string | undefined) === "alpha").length
    const cuti = rawLaporan.filter((r) => (r.status as string | undefined) === "cuti").length

    return { hadir, terlambat, sakit, izin, alpha, cuti }
  }, [rawLaporan])

  const isLoading = query.isLoading

  const exportUrl = `/laporan/absensi?format=excel&from=${fromDate}&to=${toDate}${
    gudangId ? `&gudang_id=${gudangId}` : ""
  }${userId ? `&user_id=${userId}` : ""}`

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hadir":
        return "green"
      case "terlambat":
        return "yellow"
      case "sakit":
        return "sky"
      case "izin":
        return "purple"
      case "cuti":
        return "blue"
      case "alpha":
        return "red"
      default:
        return "gray"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "hadir":
        return "Hadir"
      case "terlambat":
        return "Terlambat"
      case "sakit":
        return "Sakit"
      case "izin":
        return "Izin"
      case "cuti":
        return "Cuti"
      case "alpha":
        return "Alpha"
      default:
        return status
    }
  }

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
              { label: "Absensi Petugas" },
            ]}
            title="Laporan Absensi Petugas"
            icon={BiUserCheck}
            description="Laporan kehadiran petugas dengan detail jam masuk/pulang dan status."
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
          <StatGridSkeleton count={4} />
        </div>
      ) : (
        <div className="wrapper mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            {/* Card 1: Hadir */}
            <Card className="min-h-[90px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-full flex-col justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-emerald-100 p-1 dark:bg-emerald-900">
                    <BiUserCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Hadir
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-foreground">
                    {summaryStats.hadir}
                  </span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    / {rawLaporan.length}
                  </span>
                </div>
              </div>
            </Card>

            {/* Card 2: Terlambat */}
            <Card className="min-h-[90px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-full flex-col justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-amber-100 p-1 dark:bg-amber-900">
                    <BiChevronRight className="size-3 rotate-90 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Terlambat
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-foreground">
                    {summaryStats.terlambat}
                  </span>
                </div>
              </div>
            </Card>

            {/* Card 3: Sakit */}
            <Card className="min-h-[90px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-full flex-col justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-sky-100 p-1 dark:bg-sky-900">
                    <BiUserCheck className="size-3 text-sky-600 dark:text-sky-400" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Sakit
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-foreground">
                    {summaryStats.sakit}
                  </span>
                </div>
              </div>
            </Card>

            {/* Card 4: Izin */}
            <Card className="min-h-[90px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-full flex-col justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-purple-100 p-1 dark:bg-purple-900">
                    <BiUserCheck className="size-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Izin
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-foreground">
                    {summaryStats.izin}
                  </span>
                </div>
              </div>
            </Card>

            {/* Card 5: Cuti */}
            <Card className="min-h-[90px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-full flex-col justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-blue-100 p-1 dark:bg-blue-900">
                    <BiUserCheck className="size-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Cuti
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-foreground">
                    {summaryStats.cuti}
                  </span>
                </div>
              </div>
            </Card>

            {/* Card 6: Alpha */}
            <Card className="min-h-[90px] w-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-full flex-col justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-red-100 p-1 dark:bg-red-900">
                    <BiUserCheck className="size-3 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Alpha
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-foreground">
                    {summaryStats.alpha}
                  </span>
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
            placeholder="Cari nama petugas, gudang, atau shift..."
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
            placeholder="Semua Petugas"
            value={userFilter ?? ""}
            onValueChange={(val) => {
              setUserFilter(val || null)
              setCurrentPage(1)
            }}
            options={[
              { value: "all", label: "Semua Petugas" },
              ...userOptions.items.map((u) => ({
                value: String(u.id),
                label: u.name,
              })),
            ]}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="wrapper mt-[25px] w-full min-w-0">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1600px] table-fixed caption-bottom text-sm">
              <TableHeader className="border-b border-border/60 bg-card">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="w-[100px] pl-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Tanggal
                  </TableHead>
                  <TableHead className="w-[200px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Petugas
                  </TableHead>
                  <TableHead className="w-[150px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Shift
                  </TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Gudang
                  </TableHead>
                  <TableHead className="w-[120px] text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Jam Masuk
                  </TableHead>
                  <TableHead className="w-[120px] text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Jam Pulang
                  </TableHead>
                  <TableHead className="w-[120px] text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Status
                  </TableHead>
                  <TableHead className="w-[200px] pr-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Keterangan
                  </TableHead>
                  <TableHead className="w-[56px] pr-6 text-right text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="min-h-[300px]">
                {isLoading && <TableSkeletonRows columns={9} rows={itemsPerPage} />}
                {!isLoading && paginatedData.length === 0 && (
                  <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                    <TableCell
                      colSpan={9}
                      className="text-center text-sm text-muted-foreground"
                    >
                      Tidak ada data absensi pada periode ini.
                    </TableCell>
                  </TableRow>
                )}
                {paginatedData.map((row, idx) => (
                  <TableRow
                    key={String((row as Record<string, unknown>).id ?? (row as Record<string, unknown>).tanggal ?? idx)}
                    className="h-16 border-b border-border/40 hover:bg-muted/30"
                  >
                    <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                      {formatDate(row.tanggal)}
                    </TableCell>
                    <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-foreground">
                      {(row.user_name ?? "-")}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                      {(row.shift_nama ?? "-") as string}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {(row.gudang_nama ?? "-") as string}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                      {(row.jam_masuk
                        ? `${new Date(row.jam_masuk).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "-") as string}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap text-foreground">
                      {(row.jam_pulang
                        ? `${new Date(row.jam_pulang).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "-") as string}
                    </TableCell>
                    <TableCell className="text-center">
                      <ColoredBadge color={getStatusColor((row.status as string | undefined) || "")}>
                        {getStatusLabel((row.status as string) || "")}
                      </ColoredBadge>
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-muted-foreground">
                      {(row.keterangan ?? "-")}
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
                    <TableCell colSpan={9} className="border-none p-0" />
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
        title="Ekspor Laporan Absensi"
        totalItemsCount={filteredData.length}
        totalItemsLabel="Total Absensi"
        filterLabel="Filter Aktif"
        exportUrl={exportUrl}
        checkboxes={[
          {
            id: "tanggal",
            label: "Tanggal",
            defaultChecked: true,
          },
          {
            id: "petugas",
            label: "Nama Petugas",
            defaultChecked: true,
          },
          {
            id: "shift",
            label: "Shift",
            defaultChecked: true,
          },
          {
            id: "gudang",
            label: "Gudang",
            defaultChecked: true,
          },
          {
            id: "jamMasuk",
            label: "Jam Masuk",
            defaultChecked: true,
          },
          {
            id: "jamPulang",
            label: "Jam Pulang",
            defaultChecked: true,
          },
          {
            id: "status",
            label: "Status Kehadiran",
            defaultChecked: true,
          },
          {
            id: "keterangan",
            label: "Keterangan",
            defaultChecked: false,
          },
        ]}
      />
    </>
  )
}
