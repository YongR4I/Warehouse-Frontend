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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  const [rejectingApprovalId, setRejectingApprovalId] = useState<string | null>(null)
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
      <Sheet open={activeDrawer === "stok"} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="sm:max-w-3xl! lg:max-w-4xl! w-full p-0 flex flex-col bg-background border-l border-border text-foreground">
          <SheetHeader className="p-6 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <BiError className="size-5" />
              </span>
              <div>
                <SheetTitle className="text-lg font-medium text-foreground font-heading">
                  Control Center — Daftar Barang Stok Kritis
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-xs mt-0.5">
                  {stokKritisList.length} SKU barang dengan posisi stok di bawah batas min_stok. Memerlukan tindakan Purchase Order (PO).
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {poCreatedSku && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in-50 font-mono">
                <BiCheckCircle className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Draft PO untuk SKU <strong>{poCreatedSku}</strong> telah dibuat & masuk ke antrean restok!</span>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28 font-mono">SKU</TableHead>
                  <TableHead className="min-w-[200px]">Nama Barang & Satuan</TableHead>
                  <TableHead>Lokasi Gudang</TableHead>
                  <TableHead className="text-center w-36">Stok vs Min</TableHead>
                  <TableHead>Supplier Terakhir</TableHead>
                  <TableHead className="text-right">Harga Unit (Rp)</TableHead>
                  <TableHead className="text-right w-32">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stokKritisList.map((item) => {
                  const stockPercent = Math.min(100, Math.round((item.stokSaatIni / item.minStok) * 100))
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        {item.sku}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground whitespace-normal break-words">
                          {item.nama}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Satuan: {item.satuan}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {item.gudangNama.replace("Gudang ", "")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400 tabular-nums">
                          {item.stokSaatIni} <span className="text-[10px] text-muted-foreground font-normal">/ {item.minStok}</span>
                        </div>
                        <div className="w-24 mx-auto mt-1">
                          <Progress value={stockPercent} indicatorClassName="bg-rose-500" />
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-normal break-words">
                        {item.supplierTerakhir}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-xs tabular-nums text-foreground">
                        Rp {item.hargaBeli.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="xs"
                          variant="default"
                          onClick={() => handleCreatePO(item.sku)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-medium gap-1 active:scale-[0.98] shadow-xs"
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
      <Sheet open={activeDrawer === "approval"} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="sm:max-w-3xl lg:max-w-4xl min-w-xl w-full p-0 flex flex-col bg-background border-l border-border text-foreground">
          <SheetHeader className="p-6 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <BiTimeFive className="size-5" />
              </span>
              <div>
                <SheetTitle className="text-lg font-medium text-foreground font-heading">
                  Approval Transaksi Operasional Menunggu
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-xs mt-0.5">
                  {approvalsList.length} pengajuan transaksi barang masuk, keluar, atau mutasi yang memerlukan persetujuan Owner.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {approvalsList.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl border border-border/80 bg-card hover:border-border transition-all space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={
                          app.tipe === "Barang Masuk"
                            ? "success"
                            : app.tipe === "Barang Keluar"
                            ? "warning"
                            : "info"
                        }
                        className="text-[10px]"
                      >
                        {app.tipe}
                      </Badge>
                      <span className="font-mono text-sm font-bold text-foreground">
                        {app.kodeTransaksi}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">• {app.tanggal}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Gudang: <strong className="text-foreground">{app.gudangNama}</strong> &nbsp;|&nbsp; Requester: <strong className="text-foreground">{app.requester}</strong>
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <div className="font-bold text-base text-foreground font-mono tabular-nums">
                      Rp {app.nilaiTotal.toLocaleString("id-ID")}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{app.totalItems} Total Unit</div>
                  </div>
                </div>

                {app.catatan && (
                  <p className="text-xs italic bg-muted/40 p-3 rounded-xl text-muted-foreground border border-border/40 font-mono">
                    &ldquo;{app.catatan}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/40">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectingApprovalId(app.id)}
                    className="text-rose-600 border-rose-500/30 hover:bg-rose-500/10 active:scale-[0.98]"
                  >
                    <BiXCircle className="size-4" />
                    <span>Tolak Transaksi</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onApproveApproval(app.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium active:scale-[0.98]"
                  >
                    <BiCheckCircle className="size-4" />
                    <span>Setujui (Approve)</span>
                  </Button>
                </div>
              </div>
            ))}

            {approvalsList.length === 0 && (
              <div className="py-16 text-center text-muted-foreground flex flex-col items-center gap-2">
                <BiCheckCircle className="size-10 text-emerald-500" />
                <p className="font-semibold text-sm text-foreground">Tidak ada approval transaksi yang tertunda!</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* 3. SELISIH OPNAME DRAWER (WIDE EXPANDED VIEW) */}
      <Sheet open={activeDrawer === "opname"} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="sm:max-w-4xl lg:max-w-4xl! w-full p-0 flex flex-col bg-background border-l border-border text-foreground">
          <SheetHeader className="p-6 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <BiCheckShield className="size-5" />
              </span>
              <div>
                <SheetTitle className="text-lg font-medium text-foreground font-heading">
                  Audit Discrepancy — Laporan Selisih Stok Opname
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-xs mt-0.5">
                  Perbandingan stok fisik vs stok sistem hasil audit opname terbaru.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32 font-mono">Kode Opname</TableHead>
                  <TableHead className="min-w-[200px]">SKU & Nama Barang</TableHead>
                  <TableHead>Gudang</TableHead>
                  <TableHead className="w-32">Auditor</TableHead>
                  <TableHead className="text-center w-36">Sistem vs Fisik</TableHead>
                  <TableHead className="text-center w-28">Selisih Unit</TableHead>
                  <TableHead className="text-right w-36">Nilai Selisih (Rp)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opnameList.map((op) => (
                  <TableRow key={op.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {op.kodeOpname}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-foreground whitespace-normal break-words">
                        {op.namaBarang}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        SKU: {op.sku}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {op.gudangNama.replace("Gudang ", "")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1">
                        <BiUser className="size-3 text-muted-foreground" />
                        <span>{op.petugas}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs tabular-nums">
                      <span className="text-muted-foreground">{op.stokSistem}</span> vs <strong className="text-foreground">{op.stokFisik}</strong>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={op.selisih < 0 ? "critical" : "warning"}
                        className="text-[10px] font-mono"
                      >
                        {op.selisih > 0 ? `+${op.selisih}` : op.selisih} {op.satuan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs font-mono tabular-nums">
                      <span className={op.nilaiSelisih < 0 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}>
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
      <Sheet open={activeDrawer === "izin"} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="sm:max-w-2xl lg:max-w-3xl w-full p-0 flex flex-col bg-background border-l border-border text-foreground">
          <SheetHeader className="p-6 border-b border-border/60 bg-muted/30">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <BiCalendarCheck className="size-5" />
              </span>
              <div>
                <SheetTitle className="text-lg font-medium text-foreground font-heading">
                  Pengajuan Izin & Cuti Staff Gudang
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-xs mt-0.5">
                  Permohonan ketidakhadiran petugas yang memerlukan pertimbangan Owner.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {izinList.map((iz) => (
              <div key={iz.id} className="p-5 rounded-2xl border border-border/80 bg-card space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="info" className="text-[10px]">
                      {iz.tipe}
                    </Badge>
                    <span className="font-bold text-sm text-foreground">{iz.namaPetugas}</span>
                    <span className="text-xs text-muted-foreground font-mono">({iz.nip})</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {iz.gudangNama}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground font-mono">
                  Periode: <strong className="text-foreground">{iz.tanggalMulai}</strong> s/d <strong className="text-foreground">{iz.tanggalSelesai}</strong>
                </div>

                <p className="text-xs italic bg-muted/40 p-3 rounded-xl text-muted-foreground border border-border/40 font-mono">
                  Alasan: &ldquo;{iz.alasan}&rdquo;
                </p>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRejectIzin(iz.id)}
                    className="text-rose-600 border-rose-500/30 hover:bg-rose-500/10 active:scale-[0.98]"
                  >
                    Tolak Pengajuan
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onApproveIzin(iz.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium active:scale-[0.98]"
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
      <Dialog open={!!rejectingApprovalId} onOpenChange={(open) => !open && setRejectingApprovalId(null)}>
        <DialogContent className="sm:max-w-md bg-card border border-border/80 text-card-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground font-medium">Tolak Transaksi</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Harap berikan alasan penolakan agar petugas gudang terkait dapat melakukan perbaikan.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Input
              placeholder="Contoh: Jumlah barang tidak sesuai PO, harga satuan melebihi anggaran..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="text-xs bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setRejectingApprovalId(null)}>
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
