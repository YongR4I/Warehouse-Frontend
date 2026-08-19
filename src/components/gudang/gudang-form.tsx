"use client"

import { useMemo } from "react"
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
import { toast } from "sonner"
import { getErrorMessage, handleApiValidationErrors } from "@/lib/api"
import { useApiCreate, useApiUpdate } from "@/hooks/use-api"
import type { Gudang, GudangPayload } from "@/types"
import { gudangSchema, type GudangFormValues } from "@/lib/validations/gudang"

const statusOptions = [
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
]

interface GudangFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Gudang | null
  onSuccess?: () => void
}

export function GudangForm({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: GudangFormProps) {
  const create = useApiCreate<Gudang, GudangPayload>("gudang", "/gudang")
  const update = useApiUpdate<Gudang, GudangPayload>("gudang", "/gudang")

  const formValues = useMemo(
    () => ({
      kode: initialData?.kode ?? "",
      nama: initialData?.nama ?? "",
      pic: initialData?.pic ?? "",
      status: initialData?.status ?? "aktif",
      alamat: initialData?.alamat ?? "",
      catatan: "",
    }),
    [initialData]
  )

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GudangFormValues>({
    resolver: zodResolver(gudangSchema),
    values: formValues,
  })

  const onSubmit = async (data: GudangFormValues) => {
    const payload: GudangPayload = {
      kode: data.kode,
      nama: data.nama,
      alamat: data.alamat,
      pic: data.pic,
      status: data.status,
    }
    try {
      if (initialData) {
        const response = await update.mutateAsync({
          id: initialData.id,
          data: payload,
        })
        toast.success(response.message)
      } else {
        const response = await create.mutateAsync(payload)
        toast.success(response.message)
      }
      reset(formValues)
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      handleApiValidationErrors(error, setError)
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Ubah Gudang" : "Tambah Gudang Baru"}
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
                  options={statusOptions}
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
          type="submit"
          form="gudang-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting}
        >
          {initialData ? "Simpan Perubahan" : "Simpan Gudang"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
