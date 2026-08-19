"use client"

import { useState } from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { BiChevronRight, BiFilterAlt } from "react-icons/bi"

interface LogItem {
  id: string
  waktu: string
  kategori: "Masuk" | "Keluar" | "Mutasi" | "Opname"
  petugas: string
  role: string
  gudang: string
  detail: string
  referensi: string
  status: "selesai" | "pending" | "revisi"
}

const dummyLogs: LogItem[] = [
  {
    id: "LOG-1092",
    waktu: "15:10:04",
    kategori: "Masuk",
    petugas: "Budi Santoso",
    role: "Kepala Gudang",
    gudang: "Utama Jakarta",
    detail: "Penerimaan 480 pcs Semen Tiga Roda 50kg dari PT Jaya Material",
    referensi: "PO-2026-0881",
    status: "selesai",
  },
  {
    id: "LOG-1091",
    waktu: "14:45:22",
    kategori: "Keluar",
    petugas: "Sari Dewi",
    role: "Staff Administrasi",
    gudang: "Cabang Bekasi",
    detail: "Pengeluaran 120 pcs Besi Beton 10mm ke CV Berkah Konstruksi",
    referensi: "SO-2026-1102",
    status: "selesai",
  },
  {
    id: "LOG-1090",
    waktu: "14:12:18",
    kategori: "Mutasi",
    petugas: "Roni Prasetyo",
    role: "Petugas Lapangan",
    gudang: "Utama Jakarta",
    detail: "Transfer 50 sak Cat Tembok Putih 5kg ke Gudang Cabang Bekasi",
    referensi: "TRF-2026-0041",
    status: "pending",
  },
  {
    id: "LOG-1089",
    waktu: "13:30:05",
    kategori: "Opname",
    petugas: "Wahyu Nugroho",
    role: "Supervisor QC",
    gudang: "Cabang Tangerang",
    detail: "Stock Opname Rak B3 — Ditemukan selisih fisik -2 pcs Pipa PVC",
    referensi: "OPN-2026-0012",
    status: "revisi",
  },
  {
    id: "LOG-1088",
    waktu: "12:05:40",
    kategori: "Masuk",
    petugas: "Hendra Kusuma",
    role: "Kepala Gudang",
    gudang: "Cabang Tangerang",
    detail: "Penerimaan 200 roll Bubble Wrap 1.25m x 50m dari Supplier A",
    referensi: "PO-2026-0882",
    status: "selesai",
  },
  {
    id: "LOG-1087",
    waktu: "11:22:15",
    kategori: "Keluar",
    petugas: "Lia Rahmawati",
    role: "Staff Logistik",
    gudang: "Cabang Bekasi",
    detail: "Pengeluaran 40 pcs Pallet Plastik Heavy Duty ke PT Aman Logistics",
    referensi: "SO-2026-1098",
    status: "selesai",
  },
]

export function DashboardLogTable() {
  const [filterKat, setFilterKat] = useState<string>("all")

  const filteredData = dummyLogs.filter((log) => {
    if (filterKat === "all") return true
    return log.kategori.toLowerCase() === filterKat.toLowerCase()
  })

  return (
    <div className="space-y-3">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            Sampled Operational Logs
          </h3>
          <p className="text-xs text-muted-foreground">
            Jejak transaksi real-time pergerakan barang dan audit trail
            operasional gudang.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="flex items-center gap-1 font-medium text-muted-foreground">
            <BiFilterAlt className="size-3.5" /> Filter:
          </span>
          {["all", "masuk", "keluar", "mutasi", "opname"].map((kat) => (
            <button
              key={kat}
              type="button"
              onClick={() => setFilterKat(kat)}
              className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize transition-colors ${
                filterKat === kat
                  ? "bg-foreground text-background"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* Cloudflare Style Compact Table */}
      <div className="overflow-x-auto rounded-md border border-border/60 bg-background">
        <Table>
          <TableHeader className="border-b border-border/60 bg-muted/30">
            <TableRow className="h-10 hover:bg-transparent">
              <TableHead className="w-4 pl-3" />
              <TableHead className="text-xs font-semibold text-foreground">
                Waktu
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Jenis
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Petugas / Role
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Lokasi Gudang
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Detail Transaksi
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Referensi
              </TableHead>
              <TableHead className="pr-4 text-right text-xs font-semibold text-foreground">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.map((row) => (
              <TableRow
                key={row.id}
                className="h-11 border-b border-border/40 text-xs transition-colors hover:bg-muted/40"
              >
                <TableCell className="pr-0 pl-3 text-muted-foreground">
                  <BiChevronRight className="size-4" />
                </TableCell>

                <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                  {row.waktu}
                </TableCell>

                <TableCell>
                  <ColoredBadge
                    color={
                      row.kategori === "Masuk"
                        ? "green"
                        : row.kategori === "Keluar"
                          ? "blue"
                          : row.kategori === "Mutasi"
                            ? "yellow"
                            : "purple"
                    }
                    className="px-1.5 py-0 text-[10px] font-medium"
                  >
                    {row.kategori}
                  </ColoredBadge>
                </TableCell>

                <TableCell className="font-medium whitespace-nowrap text-foreground">
                  <div>{row.petugas}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {row.role}
                  </div>
                </TableCell>

                <TableCell className="text-[11px] whitespace-nowrap text-muted-foreground">
                  {row.gudang}
                </TableCell>

                <TableCell className="max-w-md truncate font-sans text-foreground">
                  {row.detail}
                </TableCell>

                <TableCell className="text-[11px] whitespace-nowrap text-muted-foreground tabular-nums">
                  {row.referensi}
                </TableCell>

                <TableCell className="pr-4 text-right">
                  <ColoredBadge
                    color={
                      row.status === "selesai"
                        ? "green"
                        : row.status === "pending"
                          ? "yellow"
                          : "red"
                    }
                    className="px-1.5 py-0 text-[10px] uppercase"
                  >
                    {row.status}
                  </ColoredBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
