"use client"

import { useRef, useCallback, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QRCodeSVG } from "qrcode.react"
import { toPng } from "html-to-image"
import { toast } from "sonner"
import {
  BiDownload,
  BiUser,
  BiQr,
  BiRefresh,
  BiErrorCircle,
  BiBuildings,
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

export interface QrCardPetugasSubject {
  id: number
  nama: string
  kode?: string | null
  jabatan?: string | null
}

interface QrCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  petugas?: QrCardPetugasSubject | null
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
  const subjectId = isPetugasMode ? petugas!.id : (user?.id ?? null)

  const qrQuery = useQuery({
    queryKey: ["qr-issue", isPetugasMode ? "petugas" : "user", subjectId],
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

  const displayName = isPetugasMode ? petugas!.nama : (user?.name ?? "")
  const displayKode = (isPetugasMode ? petugas?.kode : user?.no_pegawai) ?? null
  const displayJabatan = isPetugasMode
    ? (petugas?.jabatan ?? "Karyawan Gudang")
    : null
  const footerKode = isPetugasMode
    ? (displayKode ?? `PID-${String(subjectId).padStart(4, "0")}`)
    : (displayKode ?? `UID-${String(subjectId).padStart(4, "0")}`)

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
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

  if (!subjectId) return null

  const qrData = qrQuery.data
  const loading = qrQuery.isFetching || regenerating
  const error = qrQuery.error ? getErrorMessage(qrQuery.error) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px] gap-0 overflow-hidden rounded-[24px] border border-border/60 bg-background p-0 shadow-2xl sm:max-w-[380px]">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BiQr className="size-4" />
            </span>
            QR Card Petugas
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            Kartu identitas digital dengan QR bertanda tangan server untuk presensi masuk / pulang.
          </DialogDescription>
        </DialogHeader>

        {/* Card preview — fixed white, print-friendly */}
        <div className="flex justify-center bg-muted/20 px-6 py-6 dark:bg-muted/10">
          <div
            ref={cardRef}
            style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
            className="relative w-[296px] overflow-hidden rounded-[20px] bg-white shadow-xl"
          >
            {/* Top white section with brand */}
            <div className="relative flex h-[92px] flex-col items-center justify-center bg-white px-6">
              <div className="flex items-center gap-1.5 text-[#0F2340]">
                <BiBuildings className="size-3.5 text-[#0F2340]" />
                <span className="text-[11px] font-bold tracking-[0.18em] text-[#0F2340]">
                  SABIRU WAREHOUSE
                </span>
              </div>
              <p className="mt-0.5 text-[10px] font-medium tracking-widest text-[#7A7B83]/60">
                ID CARD • PETUGAS GUDANG
              </p>
              {/* curved transition */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
                <div className="h-12 w-[120%] rounded-[50%] bg-[#0F2340]" />
              </div>
            </div>

            {/* Avatar — overlaps curve */}
            <div className="absolute left-1/2 top-[52px] z-10 -translate-x-1/2">
              <div className="flex size-[84px] items-center justify-center overflow-hidden rounded-full border-[4px] border-white bg-slate-100 shadow-lg">
                {!isPetugasMode && user?.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.foto}
                    alt={user.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <BiUser className="size-9 text-slate-400" />
                )}
              </div>
            </div>

            {/* Bottom navy section */}
            <div className="bg-[#0F2340] px-6 pb-6 pt-12">
              <div className="flex flex-col items-center text-center">
                <h3 className="text-[15px] font-bold uppercase tracking-wide text-white">
                  {displayName}
                </h3>
                <p className="mt-1 text-[11px] font-semibold tracking-widest text-white/60 uppercase">
                  {displayJabatan}
                </p>

                {/* QR white box */}
                <div className="mt-5 flex h-[152px] w-[152px] items-center justify-center rounded-2xl bg-white p-3 shadow-lg">
                  {loading && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#0F2340]" />
                      <p className="text-[10px] font-medium text-slate-500">
                        Menerbitkan token...
                      </p>
                    </div>
                  )}
                  {!loading && error && (
                    <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                      <BiErrorCircle className="size-6 text-red-500" />
                      <p className="text-[10px] leading-tight text-slate-500">
                        {error}
                      </p>
                    </div>
                  )}
                  {!loading && !error && qrData && (
                    <QRCodeSVG
                      value={qrData.payload}
                      size={128}
                      level="M"
                      includeMargin={false}
                    />
                  )}
                  {!loading && !error && !qrData && (
                    <div className="size-[128px] rounded-lg bg-slate-50" />
                  )}
                </div>

                <p className="mt-3 font-mono text-[10px] tracking-widest text-white/50">
                  {footerKode}
                  {qrData ? ` • v${qrData.version}` : ""}
                </p>
                <p className="mt-1 text-center text-[10px] leading-tight text-white/40">
                  Scan QR untuk presensi masuk / pulang
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions — remove Print, keep 2 buttons */}
        <div className="flex gap-2 border-t border-border/60 bg-card px-6 py-4">
          <Button
            variant="outline"
            className="h-10 flex-1 rounded-xl border-border bg-card text-sm"
            onClick={() => void handleRegenerate()}
            disabled={loading}
          >
            <BiRefresh className="mr-1.5 size-4" />
            Terbitkan Ulang
          </Button>
          <Button
            className="h-10 flex-1 rounded-xl bg-foreground text-background hover:bg-foreground/90 dark:bg-white dark:text-[#0F2340] dark:hover:bg-white/90"
            onClick={() => void handleDownload()}
            disabled={!qrData || loading}
          >
            <BiDownload className="mr-1.5 size-4" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
