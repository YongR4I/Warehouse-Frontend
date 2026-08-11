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
  rakSchema,
  type RakFormValues,
} from "@/lib/validations/gudang"

const mockGudang = [
  { value: "1", label: "Gudang Utama (Pusat)" },
  { value: "2", label: "Gudang Transit" },
  { value: "3", label: "Gudang Area Timur" },
]

const mockStatusRak = [
  { value: "aktif", label: "Aktif / Boleh Diisi" },
  { value: "penuh", label: "Penuh" },
  { value: "maintenance", label: "Maintenance / Rusak" },
]

interface RakFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RakForm({ open, onOpenChange }: RakFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RakFormValues>({
    resolver: zodResolver(rakSchema),
    defaultValues: {
      gudangId: "",
      kodeRak: "",
      lorong: "",
      level: "",
      status: "aktif",
      keterangan: "",
    },
  })

  const onSubmit = (data: RakFormValues) => {
    console.log("Submitted Rak:", data)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      reset()
      onOpenChange(false)
    }, 1500)
  }

  const handleDraft = () => {
    console.log("Draft Rak:", { ...getValues(), status: "draft" })
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
          id="rak-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Controller
              control={control}
              name="gudangId"
              render={({ field }) => (
                <div className="col-span-2 space-y-1">
                  <FormSelect
                    label="Pilih Gudang *"
                    value={field.value}
                    onValueChange={(val) => field.onChange(val || "")}
                    placeholder="Pilih gudang lokasi rak"
                    options={mockGudang}
                    error={errors.gudangId}
                  />
                  <p className="text-xs text-[#857f78]">
                    Rak akan terikat pada gudang yang dipilih.
                  </p>
                </div>
              )}
            />

            <div className="space-y-1">
              <FormInput
                label="Kode Rak / Bin *"
                placeholder="Contoh: RAK-A1-01"
                error={errors.kodeRak}
                {...register("kodeRak")}
              />
              <p className="text-xs text-[#857f78]">
                Gunakan format standar acuan lokasi.
              </p>
            </div>

            <FormInput
              label="Lorong / Aisle"
              placeholder="Contoh: Lorong A11"
              error={errors.lorong}
              {...register("lorong")}
            />

            <FormInput
              label="Tingkat / Level Rak"
              placeholder="Contoh: Level 1 (Bawah)"
              error={errors.level}
              {...register("level")}
            />

            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <FormSelect
                  label="Status Rak"
                  value={field.value}
                  onValueChange={(val) => field.onChange(val || "")}
                  placeholder="Pilih status rak"
                  options={mockStatusRak}
                  error={errors.status}
                />
              )}
            />

            <FormTextarea
              label="Keterangan & Peruntukan Area"
              placeholder="Contoh: Digunakan khusus untuk penyimpanan material berat seperti semen dan besi..."
              className="col-span-2"
              error={errors.keterangan}
              {...register("keterangan")}
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
          form="rak-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting || submitted}
        >
          {submitted ? "Tersimpan!" : "Simpan Rak"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
