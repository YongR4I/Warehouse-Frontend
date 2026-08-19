"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FormDrawer,
  FormInput,
  FormSelect,
  FormTextarea,
  FormField,
  ShiftDayPicker,
} from "@/components/forms"
import { Button } from "@/components/ui/button"
import { BiCalendar } from "react-icons/bi"
import {
  jadwalShiftSchema,
  type JadwalShiftFormValues,
} from "@/lib/validations/jadwal-shift"

const mockPetugas = [
  { value: "pg-001", label: "Ahmad Fauzi" },
  { value: "pg-002", label: "Budi Santoso" },
  { value: "pg-003", label: "Dedi Kurniawan" },
  { value: "pg-004", label: "Eko Prasetyo" },
]

const mockPeran = [
  { value: "operator-forklift", label: "Operator Forklift" },
  { value: "admin-inbound", label: "Admin Inbound" },
  { value: "packer-outbound", label: "Packer Outbound" },
  { value: "staff-qc", label: "Staff Quality Control" },
  { value: "supervisor", label: "Supervisor Gudang" },
]

const DEFAULT_ALOKASI: JadwalShiftFormValues["alokasi"] = {
  sen: "Shift 1",
  sel: "Shift 1",
  rab: "Shift 1",
  kam: "Shift 1",
  jum: "Shift 1",
  sab: "OFF",
  min: "OFF",
}

interface JadwalShiftFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JadwalShiftForm({ open, onOpenChange }: JadwalShiftFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<JadwalShiftFormValues>({
    resolver: zodResolver(jadwalShiftSchema),
    defaultValues: {
      periodeMingggu: "",
      petugasId: "",
      peran: "",
      alokasi: DEFAULT_ALOKASI,
      catatan: "",
    },
  })

  const onSubmit = (data: JadwalShiftFormValues) => {
    console.log("Submitted Jadwal Shift:", data)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      reset()
      onOpenChange(false)
    }, 1500)
  }

  const handleDraft = () => {
    console.log("Draft Jadwal Shift:", { ...getValues(), isDraft: true })
    onOpenChange(false)
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Atur Shift Kerja Petugas"
      description="Pilih petugas, tetapkan peran tanggung jawab, dan atur alokasi shift harian selama satu minggu."
      icon={BiCalendar}
    >
      <FormDrawer.Body>
        <form
          id="jadwal-shift-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Periode Minggu Kerja */}
          <FormInput
            label="Periode Minggu Kerja *"
            placeholder="Week 20, 2026"
            type="week"
            error={errors.periodeMingggu}
            {...register("periodeMingggu")}
          />

          {/* Petugas & Peran */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Controller
              control={control}
              name="petugasId"
              render={({ field }) => (
                <FormSelect
                  label="Nama Petugas Gudang *"
                  value={field.value}
                  onValueChange={(val) => field.onChange(val || "")}
                  placeholder="Pilih petugas..."
                  options={mockPetugas}
                  error={errors.petugasId}
                />
              )}
            />

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
          </div>

          {/* Alokasi Shift Harian */}
          <FormField
            label="Alokasi Shift Harian *"
            error={errors.alokasi?.message}
          >
            <Controller
              control={control}
              name="alokasi"
              render={({ field }) => (
                <ShiftDayPicker value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          {/* Catatan */}
          <FormTextarea
            label="Catatan Tambahan / Instruksi Khusus"
            placeholder="Instruksi khusus untuk petugas selama minggu ini..."
            error={errors.catatan}
            {...register("catatan")}
          />
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
          form="jadwal-shift-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting || submitted}
        >
          {submitted ? "Tersimpan!" : "Simpan Shift"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
