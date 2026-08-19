"use client"

import { ExportModal } from "@/components/export-modal"
import { useDeferredValue, useMemo, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { useConfirmDialog } from "@/components/confirm-dialog"
import { toast } from "sonner"
import {
  BiUser,
  BiUserPlus,
  BiDownload,
  BiDotsVerticalRounded,
  BiChevronRight,
  BiEditAlt,
  BiTrash,
  BiToggleRight,
  BiToggleLeft,
} from "react-icons/bi"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { FormDrawer, FormInput, FormSelect } from "@/components/forms"
import {
  useApiList,
  useApiCreate,
  useApiUpdate,
  useApiDelete,
} from "@/hooks/use-api"
import { getErrorMessage } from "@/lib/api"
import { formatDate } from "@/lib/status"
import type { Role, User, UserPayload } from "@/types"

function unwrapRows<T>(data: unknown): T[] {
  const body = data as { data?: unknown } | T[] | null | undefined
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === "object" && Array.isArray(body.data)) {
    return body.data as T[]
  }
  return []
}

interface PetugasFormState {
  name: string
  email: string
  password: string
  noPegawai: string
  telepon: string
  roleName: string
}

const EMPTY_FORM: PetugasFormState = {
  name: "",
  email: "",
  password: "",
  noPegawai: "",
  telepon: "",
  roleName: "",
}

export default function DaftarPetugasPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<PetugasFormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const deferredSearch = useDeferredValue(searchQuery)

  const usersQuery = useApiList<User>({
    key: "users",
    url: "/user",
    params: {
      page: currentPage,
      per_page: 15,
      search: deferredSearch || undefined,
    },
  })

  const rolesQuery = useApiList<Role>({
    key: "roles",
    url: "/role",
    params: { per_page: 100 },
  })

  const items = usersQuery.data?.data ?? []
  const meta = usersQuery.data?.meta
  const total = meta?.total ?? items.length
  const totalPages = Math.max(1, meta?.last_page ?? 1)

  const roleOptions = useMemo(
    () =>
      unwrapRows<Role>(rolesQuery.data).map((role) => ({
        value: role.name,
        label: role.name,
      })),
    [rolesQuery.data]
  )

  const createMutation = useApiCreate<User, UserPayload>("users", "/user")
  const updateMutation = useApiUpdate<User, UserPayload>("users", "/user")
  const deleteMutation = useApiDelete("users", "/user")

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const renderStatusBadge = (isActive: boolean) => {
    if (isActive) return <ColoredBadge color="green">Aktif</ColoredBadge>
    return <ColoredBadge color="gray">Non-Aktif</ColoredBadge>
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const maxButtons = 5
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxButtons - 1)
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
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
    return buttons
  }

  const openCreate = () => {
    setEditingUser(null)
    setForm(EMPTY_FORM)
    setDrawerOpen(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      noPegawai: user.no_pegawai ?? "",
      telepon: user.telepon ?? "",
      roleName: user.roles?.[0]?.name ?? "",
    })
    setDrawerOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Nama lengkap dan email wajib diisi")
      return
    }
    if (!editingUser && !form.password.trim()) {
      toast.error("Password wajib diisi saat membuat petugas baru")
      return
    }
    setSubmitting(true)
    try {
      const payload: UserPayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        no_pegawai: form.noPegawai.trim() || undefined,
        telepon: form.telepon.trim() || undefined,
        roles: form.roleName ? [form.roleName] : undefined,
      }
      if (!editingUser) {
        payload.password = form.password
        await createMutation.mutateAsync(payload)
        toast.success("Petugas berhasil ditambahkan")
      } else {
        await updateMutation.mutateAsync({ id: editingUser.id, data: payload })
        toast.success("Data petugas berhasil diperbarui")
      }
      setDrawerOpen(false)
      setForm(EMPTY_FORM)
      setEditingUser(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (user: User) => {
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        data: {
          name: user.name,
          email: user.email,
          is_active: !user.is_active,
        },
      })
      toast.success(
        user.is_active ? "Petugas dinonaktifkan" : "Petugas diaktifkan"
      )
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const { confirm, ConfirmDialog } = useConfirmDialog()

  const handleDelete = (user: User) => {
    confirm({
      title: "Hapus Petugas",
      itemName: `${user.name} (${user.email})`,
      description:
        "Apakah Anda yakin ingin menghapus data petugas ini? Riwayat absensi dan aktivitas terkait akun ini akan terpengaruh.",
      confirmLabel: "Ya, Hapus Petugas",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(user.id)
          toast.success("Petugas berhasil dihapus")
        } catch (error) {
          toast.error(getErrorMessage(error))
        }
      },
    })
  }

  return (
    <>
      {ConfirmDialog}
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "SDM & Kehadiran" },
              { label: "Daftar Petugas Gudang" },
            ]}
            title="Daftar Petugas Gudang"
            icon={BiUser}
            description="Kelola data karyawan dan status operasional."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiDownload className="mr-2" />
              Export (.excel/.pdf)
            </Button>
            <Button variant="default" onClick={openCreate}>
              <BiUserPlus className="mr-2" />
              Tambah Petugas
            </Button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari nama, kode petugas, atau area..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="flex-1"
          />
        </div>
      </div>

      <div className="wrapper mt-[25px]">
        <div className="overflow-hidden rounded-[15px] border border-zinc-200 bg-white shadow-xs">
          <Table>
            <TableHeader className="border-b border-border/60 bg-white">
              <TableRow className="h-14 hover:bg-transparent">
                <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                  Kode Pegawai
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                  Tanggung Jawab
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                  Nama Lengkap
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                  Area Kerja
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                  Nomor Telepon
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                  Tanggal Bergabung
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                  Status Operasional
                </TableHead>
                <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersQuery.isLoading && (
                <TableRow className="h-16 border-b border-border/40 hover:bg-transparent">
                  <TableCell
                    colSpan={8}
                    className="text-center text-sm text-muted-foreground"
                  >
                    Memuat data...
                  </TableCell>
                </TableRow>
              )}
              {!usersQuery.isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    Tidak ada data petugas ditemukan.
                  </TableCell>
                </TableRow>
              )}
              {items.map((user) => (
                <TableRow
                  key={user.id}
                  className="h-16 border-b border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-sans text-sm text-foreground">
                    {user.no_pegawai ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm">
                    <ColoredBadge color="gray">
                      {user.roles?.map((role) => role.name).join(", ") || "-"}
                    </ColoredBadge>
                  </TableCell>
                  <TableCell className="font-sans text-sm font-medium whitespace-nowrap text-foreground">
                    {user.name}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {user.gudang?.nama ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {user.telepon ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell className="font-sans text-sm">
                    {renderStatusBadge(user.is_active)}
                  </TableCell>
                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <button
                        onClick={() => openEdit(user)}
                        className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted"
                      >
                        <BiChevronRight className="size-4 text-foreground/75" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors outline-none hover:bg-muted">
                          <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Aksi Petugas</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEdit(user)}>
                            <BiEditAlt />
                            <span>Ubah Profil</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.is_active ? (
                              <BiToggleLeft />
                            ) : (
                              <BiToggleRight />
                            )}
                            <span>
                              {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(user)}
                          >
                            <BiTrash />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="flex h-14 items-center justify-between border-t border-border/50 bg-white px-6 font-sans text-xs text-muted-foreground select-none">
            <span>
              Menampilkan {total > 0 ? (currentPage - 1) * 15 + 1 : 0}-
              {Math.min(currentPage * 15, total)} dari {total} data
            </span>
            {totalPages > 1 && (
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
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
            <span>15 per halaman</span>
          </div>
        </div>
      </div>

      <FormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={editingUser ? "Ubah Petugas Gudang" : "Tambah Petugas Gudang"}
        description="Kelola data karyawan dan status operasional."
        icon={BiUser}
      >
        <FormDrawer.Body>
          <form id="petugas-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-foreground">
                1. Identitas Karyawan
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <FormInput
                  label="Nama Lengkap *"
                  placeholder="Nama persis sesuai KTP"
                  className="col-span-2"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <FormInput
                  label="Email *"
                  type="email"
                  placeholder="contoh@sabiru.com"
                  className="col-span-2"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                {!editingUser && (
                  <FormInput
                    label="Password *"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    className="col-span-2"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />
                )}
                <FormInput
                  label="Kode Pegawai"
                  placeholder="Contoh : PG-005"
                  value={form.noPegawai}
                  onChange={(e) =>
                    setForm({ ...form, noPegawai: e.target.value })
                  }
                />
                <FormInput
                  label="Nomor Telepon"
                  placeholder="0812-1212-12"
                  value={form.telepon}
                  onChange={(e) =>
                    setForm({ ...form, telepon: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-semibold text-foreground">
                2. Hak Akses
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <FormSelect
                  label="Role Akses"
                  placeholder="Pilih role..."
                  value={form.roleName}
                  onValueChange={(val) =>
                    setForm({ ...form, roleName: val ?? "" })
                  }
                  options={roleOptions}
                />
              </div>
            </div>
          </form>
        </FormDrawer.Body>

        <FormDrawer.Footer>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDrawerOpen(false)}
            className="rounded-xl"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="petugas-form"
            className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
            disabled={submitting}
          >
            {submitting
              ? "Menyimpan..."
              : editingUser
                ? "Simpan Perubahan"
                : "Simpan Petugas"}
          </Button>
        </FormDrawer.Footer>
      </FormDrawer>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Daftar Petugas"
        totalItemsCount={total}
        totalItemsLabel="Total Petugas"
        filterLabel="Filter Aktif"
        checkboxes={[
          {
            id: "nama",
            label: "Nama & NIP",
            defaultChecked: true,
          },
          {
            id: "kontak",
            label: "Informasi Kontak",
            defaultChecked: true,
          },
          {
            id: "status",
            label: "Status Keaktifan",
            defaultChecked: true,
          },
        ]}
      />
    </>
  )
}
