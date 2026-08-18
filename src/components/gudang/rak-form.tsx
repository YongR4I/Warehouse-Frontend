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
import { getErrorMessage } from "@/lib/api"
import { useApiCreate, useApiUpdate } from "@/hooks/use-api"
import { useOptions, toOptions } from "@/hooks/use-options"
import type { Gudang, LokasiRak, LokasiRakPayload } from "@/types"
import {
  rakSchema,
  type RakFormValues,
} from "@/lib/validations/gudang"

const statusOptions = [
  { value: "aktif", label: "Aktif / Boleh Diisi" },
  { value: "nonaktif", label: "Nonaktif / Tidak Dipakai" },
]

interface RakFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: LokasiRak | null
  onSuccess?: () => void
}

export function RakForm({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: RakFormProps) {
  const create = useApiCreate<LokasiRak, LokasiRakPayload>(
    "lokasi-rak",
    "/lokasi-rak"
  )
  const update = useApiUpdate<LokasiRak, LokasiRakPayload>(
    "lokasi-rak",
    "/lokasi-rak"
  )

  const { items: gudangs } = useOptions<Gudang>("gudang", "/gudang")
  const gudangOptions = toOptions(gudangs)

  const formValues = useMemo(
    () => ({
      gudangId:
        initialData?.gudang_id != null ? String(initialData.gudang_id) : "",
      kodeRak: initialData?.kode_rak ?? "",
      lorong: initialData?.zona ?? "",
      level: "",
      status: initialData?.status ?? "aktif",
      keterangan: initialData?.deskripsi ?? "",
    }),
    [initialData]
  )

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RakFormValues>({
    resolver: zodResolver(rakSchema),
    values: formValues,
  })

  const onSubmit = async (data: RakFormValues) => {
    const payload: LokasiRakPayload = {
      gudang_id: Number(data.gudangId),
      kode_rak: data.kodeRak,
      zona: data.lorong || undefined,
      deskripsi: data.keterangan || undefined,
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
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Ubah Rak / Bin" : "Tambah Rak / Bin Baru"}
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
                    options={gudangOptions}
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
                  options={statusOptions}
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
          type="submit"
          form="rak-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting}
        >
          {initialData ? "Simpan Perubahan" : "Simpan Rak"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}