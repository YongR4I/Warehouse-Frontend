"use client"

import { useDeferredValue, useState } from "react"
import { useRouter } from "next/navigation"
import { ExportModal } from "@/components/export-modal"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { useApiList } from "@/hooks/use-api"
import { useOptions, toOptions } from "@/hooks/use-options"
import { formatDateTime } from "@/lib/status"
import type { Gudang, KartuStok } from "@/types"
import { BiPackage, BiSolidReport } from "react-icons/bi"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { cn } from "@/lib/utils"

const TIPE_CONFIG: Record<
  string,
  {
    label: string
    color: "green" | "yellow" | "purple" | "blue"
    href: (id: number) => string
  }
> = {
  in: {
    label: "Terima Barang",
    color: "green",
    href: (id) => `/inventory/barang-masuk/detail/${id}`,
  },
  out: {
    label: "Keluar Barang",
    color: "yellow",
    href: (id) => `/inventory/stok/keluar-barang/${id}`,
  },
  mutasi_in: {
    label: "Mutasi Masuk",
    color: "purple",
    href: (id) => `/inventory/mutasi/detail/${id}`,
  },
  mutasi_out: {
    label: "Mutasi Keluar",
    color: "purple",
    href: (id) => `/inventory/mutasi/detail/${id}`,
  },
  opname: {
    label: "Stok Opname",
    color: "blue",
    href: (id) => `/inventory/opname/${id}`,
  },
}

function getTipeConfig(tipe: string) {
  return (
    TIPE_CONFIG[tipe] ?? {
      label: tipe,
      color: "gray" as const,
      href: () => `/inventory/stok`,
    }
  )
}

export default function StokPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const router = useRouter()
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [gudang, setGudang] = useState<string | null>(null)
  const [tipe, setTipe] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useApiList<KartuStok>({
    key: "kartu-stok",
    url: "/kartu-stok",
    params: {
      page,
      per_page: 15,
      search: deferredSearch || undefined,
      gudang_id: gudang && gudang !== "all" ? Number(gudang) : undefined,
      tipe: tipe && tipe !== "all" ? tipe : undefined,
    },
  })

  const { items: gudangList } = useOptions<Gudang>("gudang", "/gudang")
  const gudangOptions = [
    { value: "all", label: "Semua Gudang" },
    ...toOptions(gudangList),
  ]

  const rows = data?.data ?? []
  const meta = data?.meta
  const totalPages = Math.max(1, meta?.last_page ?? 1)

  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Aktivitas Gudang" },
              { label: "Kartu Stok & Riwayat" },
            ]}
            title="Kartu Stok & Riwayat"
            icon={BiPackage}
            description="Lihat riwayat pergerakan stok tiap barang"
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari barang..."
            className="flex-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <Opsion
            placeholder="Semua Gudang"
            value={gudang || ""}
            onValueChange={(val) => {
              setGudang(val)
              setPage(1)
            }}
            options={gudangOptions}
          />
          <Opsion
            placeholder="Semua Tipe"
            value={tipe || ""}
            onValueChange={(val) => {
              setTipe(val)
              setPage(1)
            }}
            options={[
              { value: "all", label: "Semua Tipe" },
              { value: "in", label: "Terima Barang" },
              { value: "out", label: "Keluar Barang" },
              { value: "mutasi_in", label: "Mutasi Masuk" },
              { value: "mutasi_out", label: "Mutasi Keluar" },
              { value: "opname", label: "Stok Opname" },
            ]}
          />
        </div>
      </div>

      <div className="wrapper mt-[25px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Tanggal & Waktu
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Tipe Transaksi
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Barang
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Referensi
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Lokasi Gudang
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Pergerakan Qty
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Saldo Akhir
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="min-h-[300px]">
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-48 text-center text-sm text-muted-foreground"
                >
                  Memuat data...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-48 text-center text-sm text-muted-foreground"
                >
                  Tidak ada data kartu stok.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => {
              const tipeConfig = getTipeConfig(row.tipe)
              return (
                <TableRow
                  key={row.id}
                  className="h-16 cursor-pointer border-b border-border/40 hover:bg-muted/30"
                  onClick={() =>
                    row.referensi_id
                      ? router.push(tipeConfig.href(row.referensi_id))
                      : undefined
                  }
                >
                  <TableCell className="pl-6 font-sans text-sm text-foreground">
                    {formatDateTime(row.created_at)}
                  </TableCell>
                  <TableCell className="font-sans text-sm">
                    <ColoredBadge color={tipeConfig.color}>
                      {tipeConfig.label}
                    </ColoredBadge>
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.barang?.nama ?? `Barang #${row.barang_id}`}
                  </TableCell>
                  <TableCell className="font-sans text-sm font-medium text-[#3B82F6]">
                    {row.referensi_type
                      ? `${row.referensi_type}-${row.referensi_id}`
                      : "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.gudang?.nama ?? "-"}
                  </TableCell>
                  <TableCell className="text-center font-sans text-sm font-semibold">
                    {row.qty > 0 ? (
                      <span className="text-[#10B981]">{`+${row.qty}`}</span>
                    ) : row.qty < 0 ? (
                      <span className="text-[#F97316]">{row.qty}</span>
                    ) : (
                      <span className="text-muted-foreground">{row.qty}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-sans text-sm">
                    {`${row.saldo_sesudah} ${row.barang?.satuan?.nama ?? ""}`.trim()}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Menampilkan{" "}
                    {meta?.total ? (page - 1) * (meta.per_page || 15) + 1 : 0}-
                    {Math.min(page * (meta?.per_page || 15), meta?.total ?? 0)}{" "}
                    dari {meta?.total ?? 0} data
                  </span>
                  <div className="flex items-center">
                    <div className="flex items-center gap-1.5">
                      <button
                        className={cn(
                          "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border border-border/70 text-muted-foreground transition-colors hover:bg-muted",
                          page === 1 && "pointer-events-none opacity-40"
                        )}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        &lt;
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={cn(
                              "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] font-medium transition-colors hover:bg-muted",
                              page === p
                                ? "bg-foreground text-background"
                                : "border border-border/70 text-muted-foreground"
                            )}
                          >
                            {p}
                          </button>
                        )
                      )}
                      <button
                        className={cn(
                          "flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] border border-border/70 text-muted-foreground transition-colors hover:bg-muted",
                          page === totalPages &&
                            "pointer-events-none opacity-40"
                        )}
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                  <span>{meta?.per_page ?? 15} per halaman</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Ringkasan Stok Barang"
        totalItemsCount={meta?.total ?? 0}
        totalItemsLabel="Total Stok"
        filterLabel="Filter Aktif"
        checkboxes={[
          { id: "sku", label: "Kode SKU & Barcode", defaultChecked: true },
          { id: "kategori", label: "Kategori & Unit", defaultChecked: true },
          { id: "stok", label: "Rincian Stok Min/Max", defaultChecked: true },
        ]}
      />
    </>
  )
}
