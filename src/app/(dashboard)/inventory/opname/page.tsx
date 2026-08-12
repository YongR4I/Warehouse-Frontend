"use client"

import { ExportModal } from "@/components/export-modal"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useOpnameStore, type OpnameSession } from "@/store"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import {
  BiClipboard,
  BiSolidReport,
  BiCheckCircle,
  BiTimeFive,
  BiShow,
  BiPlay,
  BiPlusCircle,
} from "react-icons/bi"
import {
  FormModal,
  FormInput,
  FormDate,
  FormSelect,
  FormTextarea,
} from "@/components/forms"
import {
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ColoredBadge } from "@/components/ui/colored-badge"


export default function OpnamePage() {
  const [exportOpen, setExportOpen] = useState(false)
  const router = useRouter()
  const { sessions: data, addSession, startAudit } = useOpnameStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [gudangFilter, setGudangFilter] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newNoDokumen, setNewNoDokumen] = useState("")
  const [newTanggal, setNewTanggal] = useState("")
  const [newLokasi, setNewLokasi] = useState("")
  const [newPetugas, setNewPetugas] = useState("")
  const [newScopeType, setNewScopeType] = useState<"full" | "partial">("full")
  const [newScopePartialText, setNewScopePartialText] = useState("")
  const [newCatatan, setNewCatatan] = useState("")

  const handleOpenModal = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const date = String(now.getDate()).padStart(2, "0")
    const prefix = `SO-${year}${month}-`
    const matchingDocs = data.filter((d) => d.noDokumen.startsWith(prefix))
    const nextNum = matchingDocs.length + 1
    const nextNoDoc = `${prefix}${String(nextNum).padStart(3, "0")}`

    setNewNoDokumen(nextNoDoc)
    setNewTanggal(`${year}-${month}-${date}`)
    setNewLokasi("Gudang Utama (GDG-01)")
    setNewPetugas("Budi Santoso (Lead Auditor)")
    setNewScopeType("full")
    setNewScopePartialText("")
    setNewCatatan("")
    setIsModalOpen(true)
  }

  const handleCreateOpname = (e: React.FormEvent) => {
    e.preventDefault()

    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ]
    const dateObj = new Date(newTanggal)
    const day = dateObj.getDate()
    const monthIndex = dateObj.getMonth()
    const year = dateObj.getFullYear()
    const tanggalLabel = `${String(day).padStart(2, "0")} ${months[monthIndex]} ${year}`

    const petugasName = newPetugas.replace(/\s*\(.*\)/, "")

    const newOpname: OpnameSession = {
      id: String(data.length + 1),
      noDokumen: newNoDokumen,
      tanggal: tanggalLabel,
      tanggalLabel: tanggalLabel + " (Plan)",
      lokasi: newLokasi,
      scope: newScopeType === "full" ? "Semua Item" : (newScopePartialText || "Parsial"),
      totalSku: "3 SKU", // seeded details count
      varianceVal: "Belum Audit",
      varianceType: "none",
      petugas: petugasName,
      status: "Draft",
      aksiType: "mulai"
    }

    addSession(newOpname)
    setIsModalOpen(false)
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleStatusChange = (val: string | null) => {
    setStatusFilter(val)
    setCurrentPage(1)
  }

  const handleGudangChange = (val: string | null) => {
    setGudangFilter(val)
    setCurrentPage(1)
  }

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        row.noDokumen.toLowerCase().includes(query) ||
        row.lokasi.toLowerCase().includes(query) ||
        row.petugas.toLowerCase().includes(query) ||
        row.scope.toLowerCase().includes(query)

      const matchesStatus =
        !statusFilter || statusFilter === "all" || row.status === statusFilter

      const matchesGudang =
        !gudangFilter ||
        gudangFilter === "all" ||
        row.lokasi.toLowerCase().includes(gudangFilter.toLowerCase())

      return matchesSearch && matchesStatus && matchesGudang
    })
  }, [data, searchQuery, statusFilter, gudangFilter])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredData.slice(start, end)
  }, [filteredData, currentPage])

  const renderStatusBadge = (status: "Dalam Proses" | "Selesai" | "Draft") => {
    switch (status) {
      case "Dalam Proses":
        return <ColoredBadge color="yellow">Dalam Proses</ColoredBadge>
      case "Selesai":
        return <ColoredBadge color="green">Selesai</ColoredBadge>
      case "Draft":
        return <ColoredBadge color="gray">Draft</ColoredBadge>
      default:
        return null
    }
  }

  const renderVarianceBadge = (
    val: string,
    type: "red" | "green" | "orange" | "none"
  ) => {
    switch (type) {
      case "red":
        return <ColoredBadge color="red">{val}</ColoredBadge>
      case "green":
        return <ColoredBadge color="green">{val}</ColoredBadge>
      case "orange":
        return <ColoredBadge color="yellow">{val}</ColoredBadge>
      case "none":
      default:
        return (
          <span className="font-sans text-sm whitespace-nowrap text-muted-foreground">
            {val}
          </span>
        )
    }
  }

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const renderPaginationButtons = () => {
    const buttons = []
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 font-medium transition-colors last:border-r-0",
            currentPage === i
              ? "bg-muted/60 text-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {i}
        </button>
      )
    }
    return buttons
  }

  return (
    <>
      {/* ─── HEADER ─── */}
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[{ label: "Aktivitas Gudang" }, { label: "Stok Opname" }]}
            title="Stok Opname"
            icon={BiClipboard}
            description="Cocokkan stok sistem dengan stok fisik aktual."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export (.excel/.pdf)
            </Button>
            <Button variant="default" onClick={handleOpenModal}>+ Opname Baru</Button>
          </div>
        </div>
      </div>

      {/* ─── STATS CARDS ─── */}
      <div className="wrapper mt-[35px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Sesi Bulan Ini */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <BiClipboard className="size-4 text-slate-500" />
            <span>Total Sesi Bulan Ini</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              12
            </span>
            <span className="text-xs font-semibold text-slate-400">Sesi</span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-400">
            Audit rutin & insidental
          </div>
        </div>

        {/* Card 2: Dalam Proses Audit */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <BiTimeFive className="size-4 text-amber-600" />
            <span>Dalam Proses Audit</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#D97706]">
              2
            </span>
            <span className="text-xs font-semibold text-[#D97706]/85">
              Sesi
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-400">
            Sedang dihitung auditor
          </div>
        </div>

        {/* Card 3: Selesai (Completed) */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <BiCheckCircle className="size-4 text-emerald-600" />
            <span>Selesai (Completed)</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#1E824C]">
              9
            </span>
            <span className="text-xs font-semibold text-[#1E824C]/85">
              Sesi
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-400">
            Sudah diapprove & diadjust
          </div>
        </div>

        {/* Card 4: Akurasi Stok Rata-rata */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <BiClipboard className="size-4 text-blue-600" />
            <span>Akurasi Stok Rata-rata</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              98.4%
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-emerald-600">
            +0.6% dari bulan lalu
          </div>
        </div>
      </div>

      {/* ─── FILTER ─── */}
      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-3">
          <InputSearch
            placeholder="Cari no. dokumen, lokasi, atau petugas..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1"
          />
          <Opsion
            placeholder="Semua Status Selisih"
            value={statusFilter || ""}
            onValueChange={handleStatusChange}
            className="w-[245px]"
            options={[
              { value: "all", label: "Semua Status Selisih" },
              { value: "Dalam Proses", label: "Dalam Proses" },
              { value: "Selesai", label: "Selesai" },
              { value: "Draft", label: "Draft" },
            ]}
          />
          <Opsion
            placeholder="Semua Gudang"
            value={gudangFilter || ""}
            onValueChange={handleGudangChange}
            className="w-[245px]"
            options={[
              { value: "all", label: "Semua Gudang" },
              { value: "GDG-01", label: "Gudang Utama (GDG-01)" },
              { value: "GDG-02", label: "Gudang Bahan Baku (GDG-02)" },
              { value: "GDG-03", label: "Gudang Transit (GDG-03)" },
            ]}
          />
        </div>
      </div>

      {/* ─── TABLE ─── */}
      <div className="wrapper mt-[25px]">
        <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-card">
          <div className="w-full overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <TableHeader className="border-b border-border/60 bg-white">
                <TableRow className="h-14 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    No. Dokumen Audit
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Tanggal Audit
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Lokasi Gudang
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Cakupan (Scope)
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Total SKU
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Variance (Selisih)
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Petugas Audit
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Status
                  </TableHead>
                  <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal whitespace-nowrap text-foreground normal-case">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="min-h-[300px]">
                {paginatedData.map((row) => (
                  <TableRow
                    key={row.id}
                    className="h-16 border-b border-border/40 hover:bg-muted/30"
                  >
                    <TableCell className="pl-6 font-sans text-sm whitespace-nowrap text-foreground">
                      {row.noDokumen}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.tanggalLabel}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.lokasi}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap">
                      <ColoredBadge color="gray">{row.scope}</ColoredBadge>
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.totalSku}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                      {renderVarianceBadge(row.varianceVal, row.varianceType)}
                    </TableCell>
                    <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                      {row.petugas}
                    </TableCell>
                    <TableCell className="text-center font-sans text-sm whitespace-nowrap">
                      {renderStatusBadge(row.status)}
                    </TableCell>
                    <TableCell className="pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        {row.aksiType === "lanjutkan" && (
                          <button
                            onClick={() => router.push(`/inventory/opname/${row.noDokumen}?mode=edit`)}
                            className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] bg-[#18181B] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-black/90"
                          >
                            <span>Lanjutkan</span>
                            <span className="text-sm font-light">→</span>
                          </button>
                        )}
                        {row.aksiType === "detail" && (
                          <button
                            onClick={() => router.push(`/inventory/opname/${row.noDokumen}?mode=view`)}
                            className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] border border-border bg-card px-3.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <BiShow className="size-4 text-muted-foreground/90" />
                            <span>Detail</span>
                          </button>
                        )}
                        {row.aksiType === "mulai" && (
                          <button
                            onClick={() => {
                              startAudit(row.noDokumen)
                              router.push(`/inventory/opname/${row.noDokumen}?mode=edit`)
                            }}
                            className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] border border-border bg-card px-3.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <BiPlay className="size-4 text-muted-foreground/90" />
                            <span>Mulai Audit</span>
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedData.length < 6 && (
                  <TableRow
                    style={{ height: `${(6 - paginatedData.length) * 64}px` }}
                    className="pointer-events-none border-none hover:bg-transparent"
                  >
                    <TableCell colSpan={9} className="border-none p-0" />
                  </TableRow>
                )}
              </TableBody>
            </table>
          </div>

          {/* Pagination outside of scrollable table wrapper */}
          <div className="flex h-14 items-center justify-between border-t border-border/50 bg-white px-6 font-sans text-xs text-muted-foreground select-none">
            <span>
              Menampilkan{" "}
              {filteredData.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}
              -{Math.min(currentPage * itemsPerPage, filteredData.length)} dari{" "}
              {filteredData.length} data
            </span>
            <div className="flex items-center">
              <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  &lt;
                </button>
                {renderPaginationButtons()}
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                  &gt;
                </button>
              </div>
            </div>
            <span>10 per halaman</span>
          </div>
        </div>
      </div>

      {/* Modal Buat Sesi Opname Baru */}
      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Buat Sesi Opname Baru"
        description="Inisiasi jadwal audit fisik barang di gudang"
        icon={BiPlusCircle}
      >
        <form onSubmit={handleCreateOpname}>
          <FormModal.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Nomor Referensi (Auto)"
                value={newNoDokumen}
                disabled
                className="opacity-75 cursor-not-allowed bg-slate-50"
              />
              <FormDate
                label="Tanggal Audit"
                required
                value={newTanggal}
                onChange={(e) => setNewTanggal(e.target.value)}
              />
              <FormSelect
                label="Lokasi Gudang"
                required
                value={newLokasi}
                onValueChange={(val) => setNewLokasi(val || "")}
                options={[
                  { value: "Gudang Utama (GDG-01)", label: "Gudang Utama (GDG-01)" },
                  { value: "Gudang Bahan Baku (GDG-02)", label: "Gudang Bahan Baku (GDG-02)" },
                  { value: "Gudang Transit (GDG-03)", label: "Gudang Transit (GDG-03)" },
                ]}
              />
              <FormSelect
                label="Petugas Auditor"
                required
                value={newPetugas}
                onValueChange={(val) => setNewPetugas(val || "")}
                options={[
                  { value: "Budi Santoso (Lead Auditor)", label: "Budi Santoso (Lead Auditor)" },
                  { value: "Ahmad Dahlan (Auditor)", label: "Ahmad Dahlan (Auditor)" },
                  { value: "Rina Wijaya (Auditor)", label: "Rina Wijaya (Auditor)" },
                  { value: "Siti Rahma (Auditor)", label: "Siti Rahma (Auditor)" },
                ]}
              />
              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#4c4546] after:ml-0.5 after:text-rose-500 after:content-['*']">
                  Cakupan (Scope) Audit
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Semua Item Card */}
                  <button
                    type="button"
                    onClick={() => setNewScopeType("full")}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer",
                      newScopeType === "full"
                        ? "border-blue-500 bg-blue-50/5 ring-1 ring-blue-500"
                        : "border-border hover:bg-muted/30"
                    )}
                  >
                    <div className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border border-slate-300">
                      {newScopeType === "full" && (
                        <div className="size-2.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">Semua Item (Full Audit)</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Audit seluruh barang di gudang</div>
                    </div>
                  </button>
                  {/* Parsial Card */}
                  <button
                    type="button"
                    onClick={() => setNewScopeType("partial")}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer",
                      newScopeType === "partial"
                        ? "border-blue-500 bg-blue-50/5 ring-1 ring-blue-500"
                        : "border-border hover:bg-muted/30"
                    )}
                  >
                    <div className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border border-slate-300">
                      {newScopeType === "partial" && (
                        <div className="size-2.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">Parsial (Kategori/Rak)</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Pilih rak atau kategori tertentu</div>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Conditional Partial Input */}
              {newScopeType === "partial" && (
                <FormInput
                  label="Detail Cakupan (Kategori/Rak)"
                  required
                  placeholder="Contoh: Rak C1 - C4, Kategori Semen"
                  value={newScopePartialText}
                  onChange={(e) => setNewScopePartialText(e.target.value)}
                  className="col-span-1 md:col-span-2"
                />
              )}

              <FormTextarea
                label="Catatan / Instruksi Audit"
                placeholder="Masukkan catatan khusus untuk petugas lapangan..."
                value={newCatatan}
                onChange={(e) => setNewCatatan(e.target.value)}
                className="col-span-1 md:col-span-2"
                rows={3}
              />
            </div>
          </FormModal.Body>
          <FormModal.Footer>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="h-10 min-h-10 px-6 font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="default"
              className="h-10 min-h-10 px-6 font-semibold flex items-center gap-1.5"
            >
              <BiPlay className="size-4" />
              <span>Buat & Mulai Audit</span>
            </Button>
          </FormModal.Footer>
        </form>
      </FormModal>
    
      
    
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Laporan Opname"
        totalItemsCount={data.length}
        totalItemsLabel="Total Opname"
        filterLabel="Filter Aktif"
        checkboxes={[
        {
          "id": "noOpname",
          "label": "No. Opname",
          "defaultChecked": true
        },
        {
          "id": "gudang",
          "label": "Lokasi Gudang",
          "defaultChecked": true
        },
        {
          "id": "barang",
          "label": "Detail Barang & SKU",
          "defaultChecked": true
        },
        {
          "id": "status",
          "label": "Status Opname",
          "defaultChecked": true
        }
      ]}
      />
    </>
  )
}
