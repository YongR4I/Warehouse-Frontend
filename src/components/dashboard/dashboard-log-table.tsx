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
import type { DashboardActivityLog } from "@/types"

interface DashboardLogTableProps {
  logs?: DashboardActivityLog[]
}

export function DashboardLogTable({ logs = [] }: DashboardLogTableProps) {
  const [filterKat, setFilterKat] = useState<string>("all")

  const filteredData = logs.filter((log) => {
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
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  {logs.length === 0
                    ? "Belum ada data aktivitas"
                    : "Tidak ada data yang cocok dengan filter"}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
