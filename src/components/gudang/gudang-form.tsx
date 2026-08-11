"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FormDrawer,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/forms"
import { Button } from "@/components/ui/button"
import { BiBuildings } from "react-icons/bi"
import {
  gudangSchema,
  type GudangFormValues,
} from "@/lib/validations/gudang"

const mockStatus = [
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
]

interface GudangFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GudangForm({ open, onOpenChange }: GudangFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GudangFormValues>({
    resolver: zodResolver(gudangSchema),
    defaultValues: {
      kode: "",
      nama: "",
      pic: "",
      status: "aktif",
      alamat: "",
      catatan: "",
    },
  })

  const onSubmit = (data: GudangFormValues) => {
    console.log("Submitted Gudang:", data)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      reset()
      onOpenChange(false)
    }, 1500)
  }

  const handleDraft = () => {
    console.log("Draft Gudang:", { ...getValues(), status: "draft" })
    onOpenChange(false)
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Daftar Gudang & Rak"
      description="Kelola data gudang dan lokasi rak."
      icon={BiBuildings}
    >
      <FormDrawer.Body>
        <form
          id="gudang-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <FormInput
              label="Kode Gudang *"
              placeholder="Contoh: GDG-005"
              error={errors.kode}
              {...register("kode")}
            />

            <FormInput
              label="Nama Gudang *"
              placeholder="Contoh: Gudang Cabang Bandung"
              error={errors.nama}
              {...register("nama")}
            />

            <FormInput
              label="Penanggung Jawab (PIC) *"
              placeholder="Masukkan nama penanggung jawab..."
              error={errors.pic}
              {...register("pic")}
            />

            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <FormSelect
                  label="Status Gudang"
                  value={field.value}
                  onValueChange={(val) => field.onChange(val || "")}
                  placeholder="Pilih status"
                  options={mockStatus}
                  error={errors.status}
                />
              )}
            />

            <FormTextarea
              label="Alamat Lengkap Lokasi *"
              placeholder="Jl. Raya Industri No. 12, Kawasan Industri..."
              className="col-span-2"
              error={errors.alamat}
              {...register("alamat")}
            />

            <FormTextarea
              label="Catatan Operasional"
              placeholder="Kapasitas maksimum, jam operasional, atau instruksi akses..."
              className="col-span-2"
              error={errors.catatan}
              {...register("catatan")}
            />
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
          form="gudang-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting || submitted}
        >
          {submitted ? "Tersimpan!" : "Simpan Gudang"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
