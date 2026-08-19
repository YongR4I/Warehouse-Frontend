"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDrawer, FormInput, FormSelect } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { BiUser } from "react-icons/bi"
import {
  petugasSchema,
  type PetugasFormValues,
} from "@/lib/validations/petugas"

const mockPeran = [
  { value: "operator-forklift", label: "Operator Forklift" },
  { value: "admin-inbound", label: "Admin Inbound" },
  { value: "packer-outbound", label: "Packer Outbound" },
  { value: "staff-qc", label: "Staff Quality Control" },
  { value: "supervisor", label: "Supervisor Gudang" },
  { value: "staff-administrasi", label: "Staff Administrasi" },
]

const mockStatus = [
  { value: "Aktif", label: "Aktif" },
  { value: "Cuti", label: "Cuti" },
  { value: "Non-Aktif", label: "Non-Aktif" },
]

interface PetugasFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PetugasForm({ open, onOpenChange }: PetugasFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PetugasFormValues>({
    resolver: zodResolver(petugasSchema),
    defaultValues: {
      kode: "",
      namaLengkap: "",
      nomorTelepon: "",
      peran: "",
      areaKerja: "",
      tanggalBergabung: "",
      status: "Aktif",
    },
  })

  const onSubmit = (data: PetugasFormValues) => {
    console.log("Submitted Petugas:", data)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      reset()
      onOpenChange(false)
    }, 1500)
  }

  const handleDraft = () => {
    console.log("Draft Petugas:", { ...getValues(), isDraft: true })
    onOpenChange(false)
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Tambah Petugas Gudang"
      description="Kelola data karyawan dan status operasional."
      icon={BiUser}
    >
      <FormDrawer.Body>
        <form
          id="petugas-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Section 1: Identitas Karyawan */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-foreground">
              1. Identitas Karyawan
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <FormInput
                label="Kode Unik Pegawai *"
                placeholder="Contoh : PG-005"
                className="col-span-2"
                error={errors.kode}
                {...register("kode")}
              />

              <FormInput
                label="Nama Lengkap *"
                placeholder="Nama persis sesuai ktp"
                error={errors.namaLengkap}
                {...register("namaLengkap")}
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
                    options={mockPeran}
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
                    onValueChange={(val) => field.onChange(val || "")}
                    placeholder="Pilih status"
                    options={mockStatus}
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
          onClick={handleDraft}
          className="rounded-xl"
        >
          Draft
        </Button>
        <Button
          type="submit"
          form="petugas-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting || submitted}
        >
          {submitted ? "Tersimpan!" : "Simpan Shift"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
