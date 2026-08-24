"use client"

import { useRef, useCallback, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QRCodeSVG } from "qrcode.react"
import { toPng } from "html-to-image"
import { toast } from "sonner"
import {
  BiDownload,
  BiPrinter,
  BiUser,
  BiQr,
  BiRefresh,
  BiErrorCircle,
} from "react-icons/bi"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import api, { getErrorMessage } from "@/lib/api"
import type { QrIssueData, User } from "@/types"

// Dual-mode QR Card (kontrak v3, lihat Obsidian TODO-QR-PETUGAS):
// - petugas mode : POST /petugas/{id}/qr/issue — karyawan TANPA akun pun bisa
// - user mode    : POST /qr/issue — kartu lama atas akun login (backward-compat)

export interface QrCardPetugasSubject {
  id: number
  nama: string
  kode?: string | null
  jabatan?: string | null
}

interface QrCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Mode karyawan native — prioritas jika diisi. */
  petugas?: QrCardPetugasSubject | null
  /** Mode akun login (alur lama). */
  user?: User | null
}

export function QrCardDialog({
  open,
  onOpenChange,
  petugas,
  user,
}: QrCardDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const [regenerating, setRegenerating] = useState(false)

  const isPetugasMode = !!petugas
  const subjectId = isPetugasMode ? petugas!.id : user?.id ?? null

  const qrQuery = useQuery({
    queryKey: [
      "qr-issue",
      isPetugasMode ? "petugas" : "user",
      subjectId,
    ],
    queryFn: async () => {
      const res = isPetugasMode
        ? await api.post<{ data: QrIssueData }>(
            `/petugas/${petugas!.id}/qr/issue`
          )
        : await api.post<{ data: QrIssueData }>("/qr/issue", {
            user_id: user!.id,
          })
      return res.data.data
    },
    enabled: open && subjectId !== null,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  })

  const handleRegenerate = useCallback(async () => {
    if (!subjectId) return
    setRegenerating(true)
    try {
      // Satu panggilan: invalidate versi lama + terbitkan payload baru
      if (isPetugasMode) {
        await api.post(`/petugas/${petugas!.id}/qr/regenerate`)
      } else {
        await api.post(`/qr/${user!.id}/regenerate`)
      }
      await queryClient.invalidateQueries({
        queryKey: ["qr-issue", isPetugasMode ? "petugas" : "user", subjectId],
      })
      toast.success("Token QR diterbitkan ulang — kartu cetak lama tidak berlaku")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setRegenerating(false)
    }
  }, [isPetugasMode, petugas, user, subjectId, queryClient])

  const displayName = isPetugasMode ? petugas!.nama : user?.name ?? ""
  const displayKode =
    (isPetugasMode ? petugas?.kode : user?.no_pegawai) ?? null
  const displayJabatan = isPetugasMode
    ? (petugas?.jabatan ?? "Karyawan Gudang")
    : null
  const chipKode = displayKode ?? `#${subjectId}`
  const footerKode = isPetugasMode
    ? (displayKode ?? `PID-${String(subjectId).padStart(4, "0")}`)
    : (displayKode ?? `UID-${String(subjectId).padStart(4, "0")}`)

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !cardRef.current.innerHTML) return
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      })
      const link = document.createElement("a")
      link.download = `QR-Card-${footerKode}.png`
      link.href = dataUrl
      link.click()
      toast.success("QR Card berhasil diunduh")
    } catch {
      toast.error("Gagal mengunduh QR Card")
    }
  }, [footerKode])

  const handlePrint = useCallback(() => {
    if (!cardRef.current || !cardRef.current.innerHTML) return
    const win = window.open("", "_blank")
    if (!win) return
    const html = cardRef.current.outerHTML
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Card - ${displayName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; font-family: sans-serif; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${html}<script>window.onload=()=>{window.print();window.close()}<\/script></body>
      </html>
    `)
    win.document.close()
  }, [displayName])

  if (!subjectId) return null

  const qrData = qrQuery.data
  const loading = qrQuery.isFetching || regenerating
  const error = qrQuery.error ? getErrorMessage(qrQuery.error) : null
  const gudangNama = user?.gudang?.nama ?? "—"
  const roleName = user?.roles?.map((r) => r.name).join(", ") || "Petugas"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 mb-2">
            <BiQr className="size-6" />
            QR Card Petugas
          </DialogTitle>
          <DialogDescription className="max-w-xs">
            Kartu identitas digital dengan QR code bertanda tangan server untuk
            presensi.
          </DialogDescription>
        </DialogHeader>

        {/* Card yang bisa di-download / print */}
        <div className="flex justify-center py-2">
          <div
            ref={cardRef}
            style={{ fontFamily: "sans-serif" }}
            className="relative w-72 overflow-hidden rounded-2xl border border-border/60 bg-white shadow-lg"
          >
            {/* Header strip */}
            <div className="bg-foreground px-5 py-4">
              <p className="text-[10px] font-bold tracking-widest text-background/60 uppercase">
                Sabiru Warehouse
              </p>
              <p className="mt-0.5 text-sm font-bold tracking-tight text-background">
                ID Card Petugas
              </p>
            </div>

            {/* Body */}
            <div className="flex flex-col items-center gap-4 px-5 py-5">
              {/* Avatar */}
              <div className="flex size-16 items-center justify-center rounded-full border-2 border-border/40 bg-muted">
                {!isPetugasMode && user?.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.foto}
                    alt={user.name}
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  <BiUser className="size-8 text-muted-foreground" />
                )}
              </div>

              {/* Info */}
              <div className="w-full text-center">
                <p className="text-base font-bold tracking-tight text-foreground">
                  {displayName}
                </p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  {isPetugasMode ? displayJabatan : roleName}
                </p>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                    {chipKode}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {gudangNama}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex h-[164px] w-[164px] items-center justify-center rounded-xl border border-border/40 bg-white p-3 shadow-xs">
                {loading && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
                    <p className="text-[10px] text-muted-foreground">
                      Menerbitkan token...
                    </p>
                  </div>
                )}
                {!loading && error && (
                  <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                    <BiErrorCircle className="size-6 text-red-500" />
                    <p className="text-[10px] leading-tight text-muted-foreground">
                      {error}
                    </p>
                  </div>
                )}
                {!loading && !error && qrData && (
                  <QRCodeSVG
                    value={qrData.payload}
                    size={140}
                    level="M"
                    includeMargin={false}
                  />
                )}
                {!loading && !error && !qrData && (
                  <div className="size-[140px]" />
                )}
              </div>

              <p className="text-center text-[10px] text-muted-foreground">
                Scan QR untuk presensi masuk / pulang
                {qrData ? ` · Versi kartu #${qrData.version}` : ""}
              </p>
            </div>

            {/* Footer strip */}
            <div className="border-t border-border/30 bg-muted/40 px-5 py-2 text-center">
              <p className="font-mono text-[10px] text-muted-foreground">
                {footerKode}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => void handleRegenerate()}
            disabled={loading}
            title="Cabut token lama dan terbitkan token baru — kartu cetak lama tidak akan berlaku"
          >
            <BiRefresh className="mr-2 size-4" />
            Terbitkan Ulang
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={handlePrint}
            disabled={!qrData}
          >
            <BiPrinter className="mr-2 size-4" />
            Print
          </Button>
          <Button
            className="flex-1 rounded-xl bg-foreground text-background hover:bg-foreground/90"
            onClick={() => void handleDownload()}
            disabled={!qrData}
          >
            <BiDownload className="mr-2 size-4" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
