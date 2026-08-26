"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FormDrawer,
  FormInput,
  FormSelect,
  FormReferenceInput,
} from "@/components/forms"
import { Button } from "@/components/ui/button"
import { BiUser } from "react-icons/bi"
import { toast } from "sonner"
import { generateReferenceNumber } from "@/lib/reference-number"
import { useApiCreate, useApiUpdate } from "@/hooks/use-api"
import { getErrorMessage } from "@/lib/api"
import {
  petugasSchema,
  type PetugasFormValues,
} from "@/lib/validations/petugas"
import type { Petugas, PetugasPayload, PetugasStatusOperasional } from "@/types"

export const JABATAN_OPTIONS = [
  { value: "operator-forklift", label: "Operator Forklift" },
  { value: "admin-inbound", label: "Admin Inbound" },
  { value: "packer-outbound", label: "Packer Outbound" },
  { value: "staff-qc", label: "Staff Quality Control" },
  { value: "supervisor", label: "Supervisor Gudang" },
  { value: "staff-administrasi", label: "Staff Administrasi" },
]

export const STATUS_OPERASIONAL_OPTIONS: {
  value: PetugasStatusOperasional
  label: string
}[] = [
  { value: "Aktif", label: "Aktif" },
  { value: "Cuti", label: "Cuti" },
  { value: "Non-Aktif", label: "Non-Aktif" },
]

interface PetugasFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Petugas | null
  existingKodes?: string[]
  onSaved?: () => void
}

function toFormValues(
  petugas: Petugas | null,
  fallbackKode: string
): PetugasFormValues {
  return {
    namaLengkap: petugas?.nama ?? "",
    kode: petugas?.kode ?? fallbackKode,
    nomorTelepon: petugas?.telepon ?? "",
    peran: petugas?.jabatan ?? "",
    areaKerja: petugas?.area_kerja ?? "",
    tanggalBergabung: petugas?.tanggal_bergabung ?? "",
    status: petugas?.status_operasional ?? "Aktif",
  }
}

// Petugas = master karyawan gudang. Tidak terikat akun login —
// akses ke sistem WMS adalah urusan terpisah (kelola akun di Pengaturan).
export function PetugasForm({
  open,
  onOpenChange,
  editing,
  existingKodes = [],
  onSaved,
}: PetugasFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PetugasFormValues>({
    resolver: zodResolver(petugasSchema),
    defaultValues: toFormValues(
      editing,
      generateReferenceNumber("PG", { existingRefs: existingKodes })
    ),
  })

  useEffect(() => {
    if (open) {
      reset(
        toFormValues(
          editing,
          generateReferenceNumber("PG", { existingRefs: existingKodes })
        )
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, reset])

  const createMutation = useApiCreate<Petugas, PetugasPayload>(
    "petugas",
    "/petugas"
  )
  const updateMutation = useApiUpdate<Petugas, Partial<PetugasPayload>>(
    "petugas",
    "/petugas"
  )

  const handleRegenerateKode = () => {
    const nextKode = generateReferenceNumber("PG", {
      existingRefs: existingKodes,
    })
    setValue("kode", nextKode, { shouldValidate: true })
    clearErrors("kode")
  }

  const onSubmit = async (data: PetugasFormValues) => {
    const payload: PetugasPayload = {
      nama: data.namaLengkap.trim(),
      kode: data.kode.trim(),
      telepon: data.nomorTelepon.trim(),
      jabatan: data.peran,
      area_kerja: data.areaKerja.trim(),
      tanggal_bergabung: data.tanggalBergabung,
      status_operasional: data.status,
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload })
        toast.success("Data petugas berhasil diperbarui")
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Petugas berhasil ditambahkan")
      }
      onSaved?.()
      onOpenChange(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Ubah Data Karyawan" : "Tambah Karyawan"}
      description="Data karyawan gudang. Akses login ke sistem WMS dikelola terpisah di Pengaturan."
      icon={BiUser}
    >
      <FormDrawer.Body>
        <form
          id="petugas-form"
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          className="space-y-6"
        >
          {/* Section 1: Identitas Karyawan */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-foreground">
              1. Identitas Karyawan
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <FormInput
                label="Nama Lengkap *"
                placeholder="Nama persis sesuai KTP"
                className="col-span-2"
                error={errors.namaLengkap}
                {...register("namaLengkap")}
              />

              <FormReferenceInput
                label="Kode Unik Pegawai *"
                placeholder="Contoh : PG-005"
                error={errors.kode}
                disabled={!!editing}
                onRegenerate={!editing ? handleRegenerateKode : undefined}
                {...register("kode")}
              />

              <FormInput
                label="Nomor Telepon *"
                placeholder="0812-1212-12"
                error={errors.nomorTelepon}
                {...register("nomorTelepon")}
              />
            </div>
          </div>

          {/* Section 2: Penempatan & Status */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-foreground">
              2. Penempatan &amp; Status
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Controller
                control={control}
                name="peran"
                render={({ field }) => (
                  <FormSelect
                    label="Tanggung Jawab / Peran *"
                    value={field.value}
                    onValueChange={(val) => field.onChange(val || "")}
                    placeholder="Pilih peran...."
                    options={JABATAN_OPTIONS}
                    error={errors.peran}
                  />
                )}
              />

              <FormInput
                label="Area Kerja Penempatan *"
                placeholder="Contoh: Area Inbound - Rak A"
                error={errors.areaKerja}
                {...register("areaKerja")}
              />

              <FormInput
                label="Tanggal Bergabung *"
                placeholder="dd/mm/yy"
                type="date"
                error={errors.tanggalBergabung}
                {...register("tanggalBergabung")}
              />

              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <FormSelect
                    label="Status Operasional *"
                    value={field.value}
                    onValueChange={(val) => field.onChange(val || "Aktif")}
                    placeholder="Pilih status"
                    options={STATUS_OPERASIONAL_OPTIONS}
                    error={errors.status}
                  />
                )}
              />
            </div>
          </div>
        </form>
      </FormDrawer.Body>

      <FormDrawer.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="rounded-xl"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="petugas-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Menyimpan..."
            : editing
              ? "Simpan Perubahan"
              : "Simpan Petugas"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
