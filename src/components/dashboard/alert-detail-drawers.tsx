"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import type {
  StokKritisItem,
  PendingApprovalItem,
  SelisihOpnameItem,
  IzinPendingItem,
} from "@/hooks/use-dashboard-data"
import {
  BiError,
  BiCheckCircle,
  BiXCircle,
  BiPlusCircle,
  BiTimeFive,
  BiCheckShield,
  BiCalendarCheck,
  BiUser,
} from "react-icons/bi"

interface AlertDetailDrawersProps {
  activeDrawer: "stok" | "approval" | "opname" | "izin" | null
  onClose: () => void
  stokKritisList: StokKritisItem[]
  approvalsList: PendingApprovalItem[]
  opnameList: SelisihOpnameItem[]
  izinList: IzinPendingItem[]
  onApproveApproval: (id: string) => void
  onRejectApproval: (id: string, reason: string) => void
  onApproveIzin: (id: string) => void
  onRejectIzin: (id: string) => void
}

export function AlertDetailDrawers({
  activeDrawer,
  onClose,
  stokKritisList,
  approvalsList,
  opnameList,
  izinList,
  onApproveApproval,
  onRejectApproval,
  onApproveIzin,
  onRejectIzin,
}: AlertDetailDrawersProps) {
  const [rejectingApprovalId, setRejectingApprovalId] = useState<string | null>(
    null
  )
  const [rejectReason, setRejectReason] = useState("")

  const [poCreatedSku, setPoCreatedSku] = useState<string | null>(null)

  const handleConfirmReject = () => {
    if (rejectingApprovalId && rejectReason.trim()) {
      onRejectApproval(rejectingApprovalId, rejectReason.trim())
      setRejectingApprovalId(null)
      setRejectReason("")
    }
  }

  const handleCreatePO = (sku: string) => {
    setPoCreatedSku(sku)
    setTimeout(() => {
      setPoCreatedSku(null)
    }, 3000)
  }

  return (
    <>
      {/* 1. STOK KRITIS DRAWER (WIDE EXPANDED VIEW) */}
      <Sheet
        open={activeDrawer === "stok"}
        onOpenChange={(open) => !open && onClose()}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col border-l border-border bg-background p-0 text-foreground sm:max-w-3xl! lg:max-w-4xl!"
        >
          <SheetHeader className="border-b border-border/60 bg-muted/30 p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-600 dark:text-rose-400">
                <BiError className="size-5" />
              </span>
              <div>
                <SheetTitle className="font-heading text-lg font-medium text-foreground">
                  Control Center — Daftar Barang Stok Kritis
                </SheetTitle>
                <SheetDescription className="mt-0.5 text-xs text-muted-foreground">
                  {stokKritisList.length} SKU barang dengan posisi stok di bawah
                  batas min_stok. Memerlukan tindakan Purchase Order (PO).
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {poCreatedSku && (
              <div className="flex animate-in items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 font-mono text-xs text-emerald-700 fade-in-50 dark:text-emerald-300">
                <BiCheckCircle className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Draft PO untuk SKU <strong>{poCreatedSku}</strong> telah
                  dibuat & masuk ke antrean restok!
                </span>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28 font-mono">SKU</TableHead>
                  <TableHead className="min-w-[200px]">
                    Nama Barang & Satuan
                  </TableHead>
                  <TableHead>Lokasi Gudang</TableHead>
                  <TableHead className="w-36 text-center">
                    Stok vs Min
                  </TableHead>
                  <TableHead>Supplier Terakhir</TableHead>
                  <TableHead className="text-right">Harga Unit (Rp)</TableHead>
                  <TableHead className="w-32 text-right">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stokKritisList.map((item) => {
                  const stockPercent = Math.min(
                    100,
                    Math.round((item.stokSaatIni / item.minStok) * 100)
                  )
                  return (
                    <TableRow
                      key={item.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        {item.sku}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold break-words whitespace-normal text-foreground">
                          {item.nama}
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Satuan: {item.satuan}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <ColoredBadge
                          color="gray"
                          className="font-mono text-[10px]"
                        >
                          {item.gudangNama.replace("Gudang ", "")}
                        </ColoredBadge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-mono text-xs font-bold text-rose-600 tabular-nums dark:text-rose-400">
                          {item.stokSaatIni}{" "}
                          <span className="text-[10px] font-normal text-muted-foreground">
                            / {item.minStok}
                          </span>
                        </div>
                        <div className="mx-auto mt-1 w-24">
                          <Progress
                            value={stockPercent}
                            indicatorClassName="bg-rose-500"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs break-words whitespace-normal text-muted-foreground">
                        {item.supplierTerakhir}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-foreground tabular-nums">
                        Rp {item.hargaBeli.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="xs"
                          variant="default"
                          onClick={() => handleCreatePO(item.sku)}
                          className="gap-1 bg-rose-600 font-medium text-white shadow-xs hover:bg-rose-700 active:scale-[0.98]"
                        >
                          <BiPlusCircle className="size-3" />
                          <span>Buat PO</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </SheetContent>
      </Sheet>

      {/* 2. APPROVAL PENDING DRAWER (WIDE EXPANDED VIEW) */}
      <Sheet
        open={activeDrawer === "approval"}
        onOpenChange={(open) => !open && onClose()}
      >
        <SheetContent
          side="right"
          className="flex w-full min-w-xl flex-col border-l border-border bg-background p-0 text-foreground sm:max-w-3xl lg:max-w-4xl"
        >
          <SheetHeader className="border-b border-border/60 bg-muted/30 p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
                <BiTimeFive className="size-5" />
              </span>
              <div>
                <SheetTitle className="font-heading text-lg font-medium text-foreground">
                  Approval Transaksi Operasional Menunggu
                </SheetTitle>
                <SheetDescription className="mt-0.5 text-xs text-muted-foreground">
                  {approvalsList.length} pengajuan transaksi barang masuk,
                  keluar, atau mutasi yang memerlukan persetujuan Owner.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {approvalsList.map((app) => (
              <div
                key={app.id}
                className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-border"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ColoredBadge
                        color={
                          app.tipe === "Barang Masuk"
                            ? "green"
                            : app.tipe === "Barang Keluar"
                              ? "yellow"
                              : "blue"
                        }
                        className="text-[10px]"
                      >
                        {app.tipe}
                      </ColoredBadge>
                      <span className="font-mono text-sm font-bold text-foreground">
                        {app.kodeTransaksi}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        • {app.tanggal}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Gudang:{" "}
                      <strong className="text-foreground">
                        {app.gudangNama}
                      </strong>{" "}
                      &nbsp;|&nbsp; Requester:{" "}
                      <strong className="text-foreground">
                        {app.requester}
                      </strong>
                    </p>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <div className="font-mono text-base font-bold text-foreground tabular-nums">
                      Rp {app.nilaiTotal.toLocaleString("id-ID")}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {app.totalItems} Total Unit
                    </div>
                  </div>
                </div>

                {app.catatan && (
                  <p className="rounded-xl border border-border/40 bg-muted/40 p-3 font-mono text-xs text-muted-foreground italic">
                    &ldquo;{app.catatan}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-end gap-2.5 border-t border-border/40 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectingApprovalId(app.id)}
                    className="border-rose-500/30 text-rose-600 hover:bg-rose-500/10 active:scale-[0.98]"
                  >
                    <BiXCircle className="size-4" />
                    <span>Tolak Transaksi</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onApproveApproval(app.id)}
                    className="bg-emerald-600 font-medium text-white hover:bg-emerald-700 active:scale-[0.98]"
                  >
                    <BiCheckCircle className="size-4" />
                    <span>Setujui (Approve)</span>
                  </Button>
                </div>
              </div>
            ))}

            {approvalsList.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                <BiCheckCircle className="size-10 text-emerald-500" />
                <p className="text-sm font-semibold text-foreground">
                  Tidak ada approval transaksi yang tertunda!
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* 3. SELISIH OPNAME DRAWER (WIDE EXPANDED VIEW) */}
      <Sheet
        open={activeDrawer === "opname"}
        onOpenChange={(open) => !open && onClose()}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col border-l border-border bg-background p-0 text-foreground sm:max-w-4xl lg:max-w-4xl!"
        >
          <SheetHeader className="border-b border-border/60 bg-muted/30 p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
                <BiCheckShield className="size-5" />
              </span>
              <div>
                <SheetTitle className="font-heading text-lg font-medium text-foreground">
                  Audit Discrepancy — Laporan Selisih Stok Opname
                </SheetTitle>
                <SheetDescription className="mt-0.5 text-xs text-muted-foreground">
                  Perbandingan stok fisik vs stok sistem hasil audit opname
                  terbaru.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32 font-mono">Kode Opname</TableHead>
                  <TableHead className="min-w-[200px]">
                    SKU & Nama Barang
                  </TableHead>
                  <TableHead>Gudang</TableHead>
                  <TableHead className="w-32">Auditor</TableHead>
                  <TableHead className="w-36 text-center">
                    Sistem vs Fisik
                  </TableHead>
                  <TableHead className="w-28 text-center">
                    Selisih Unit
                  </TableHead>
                  <TableHead className="w-36 text-right">
                    Nilai Selisih (Rp)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opnameList.map((op) => (
                  <TableRow
                    key={op.id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {op.kodeOpname}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold break-words whitespace-normal text-foreground">
                        {op.namaBarang}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                        SKU: {op.sku}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <ColoredBadge
                        color="gray"
                        className="font-mono text-[10px]"
                      >
                        {op.gudangNama.replace("Gudang ", "")}
                      </ColoredBadge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BiUser className="size-3 text-muted-foreground" />
                        <span>{op.petugas}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs tabular-nums">
                      <span className="text-muted-foreground">
                        {op.stokSistem}
                      </span>{" "}
                      vs{" "}
                      <strong className="text-foreground">
                        {op.stokFisik}
                      </strong>
                    </TableCell>
                    <TableCell className="text-center">
                      <ColoredBadge
                        color={op.selisih < 0 ? "red" : "yellow"}
                        className="font-mono text-[10px]"
                      >
                        {op.selisih > 0 ? `+${op.selisih}` : op.selisih}{" "}
                        {op.satuan}
                      </ColoredBadge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold tabular-nums">
                      <span
                        className={
                          op.nilaiSelisih < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-amber-600 dark:text-amber-400"
                        }
                      >
                        Rp {op.nilaiSelisih.toLocaleString("id-ID")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SheetContent>
      </Sheet>

      {/* 4. IZIN / CUTI STAFF DRAWER */}
      <Sheet
        open={activeDrawer === "izin"}
        onOpenChange={(open) => !open && onClose()}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col border-l border-border bg-background p-0 text-foreground sm:max-w-2xl lg:max-w-3xl"
        >
          <SheetHeader className="border-b border-border/60 bg-muted/30 p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                <BiCalendarCheck className="size-5" />
              </span>
              <div>
                <SheetTitle className="font-heading text-lg font-medium text-foreground">
                  Pengajuan Izin & Cuti Staff Gudang
                </SheetTitle>
                <SheetDescription className="mt-0.5 text-xs text-muted-foreground">
                  Permohonan ketidakhadiran petugas yang memerlukan pertimbangan
                  Owner.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {izinList.map((iz) => (
              <div
                key={iz.id}
                className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <ColoredBadge color="blue" className="text-[10px]">
                      {iz.tipe}
                    </ColoredBadge>
                    <span className="text-sm font-bold text-foreground">
                      {iz.namaPetugas}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      ({iz.nip})
                    </span>
                  </div>
                  <ColoredBadge color="gray" className="font-mono text-[10px]">
                    {iz.gudangNama}
                  </ColoredBadge>
                </div>

                <div className="font-mono text-xs text-muted-foreground">
                  Periode:{" "}
                  <strong className="text-foreground">{iz.tanggalMulai}</strong>{" "}
                  s/d{" "}
                  <strong className="text-foreground">
                    {iz.tanggalSelesai}
                  </strong>
                </div>

                <p className="rounded-xl border border-border/40 bg-muted/40 p-3 font-mono text-xs text-muted-foreground italic">
                  Alasan: &ldquo;{iz.alasan}&rdquo;
                </p>

                <div className="flex items-center justify-end gap-2.5 border-t border-border/40 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRejectIzin(iz.id)}
                    className="border-rose-500/30 text-rose-600 hover:bg-rose-500/10 active:scale-[0.98]"
                  >
                    Tolak Pengajuan
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onApproveIzin(iz.id)}
                    className="bg-blue-600 font-medium text-white hover:bg-blue-700 active:scale-[0.98]"
                  >
                    Setujui Pengajuan
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* REJECTION REASON DIALOG MODAL */}
      <Dialog
        open={!!rejectingApprovalId}
        onOpenChange={(open) => !open && setRejectingApprovalId(null)}
      >
        <DialogContent className="border border-border/80 bg-card text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-medium text-foreground">
              Tolak Transaksi
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Harap berikan alasan penolakan agar petugas gudang terkait dapat
              melakukan perbaikan.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Input
              placeholder="Contoh: Jumlah barang tidak sesuai PO, harga satuan melebihi anggaran..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="border-border bg-background text-xs text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectingApprovalId(null)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!rejectReason.trim()}
              onClick={handleConfirmReject}
              className="active:scale-[0.98]"
            >
              Konfirmasi Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
