"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FormDrawer,
  FormInput,
  FormTextarea,
} from "@/components/forms"
import { Button } from "@/components/ui/button"
import { BiTag } from "react-icons/bi"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api"
import { useApiCreate, useApiUpdate } from "@/hooks/use-api"
import type { Satuan, SatuanPayload } from "@/types"
import {
  satuanSchema,
  type SatuanFormValues,
} from "@/lib/validations/kategori"

interface SatuanFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Satuan | null
  onSuccess?: () => void
}

export function SatuanForm({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: SatuanFormProps) {
  const create = useApiCreate<Satuan, SatuanPayload>("satuan", "/satuan")
  const update = useApiUpdate<Satuan, SatuanPayload>("satuan", "/satuan")

  const formValues = useMemo(
    () => ({
      kode: initialData?.singkatan ?? "",
      nama: initialData?.nama ?? "",
      keterangan: "",
    }),
    [initialData]
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SatuanFormValues>({
    resolver: zodResolver(satuanSchema),
    values: formValues,
  })

  const onSubmit = async (data: SatuanFormValues) => {
    const payload: SatuanPayload = {
      nama: data.nama,
      singkatan: data.kode,
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
      title={initialData ? "Ubah Satuan Unit (UOM)" : "Tambah Satuan Unit (UOM) Baru"}
      description="Atur kategori barang dan satuan ukurnya."
      icon={BiTag}
    >
      <FormDrawer.Body>
        <form
          id="satuan-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-5">
            <FormInput
              label="Kode Satuan / UOM *"
              placeholder="Contoh: SAK, BTG, PCS, GLN"
              error={errors.kode}
              {...register("kode")}
            />

            <FormInput
              label="Nama Satuan Lengkap *"
              placeholder="Contoh: Sak / Kantong 50kg"
              error={errors.nama}
              {...register("nama")}
            />

            <FormTextarea
              label="Keterangan Penggunaan"
              placeholder="Catatan atau acuan standar penggunaan satuan ini..."
              error={errors.keterangan}
              {...register("keterangan")}
            />
          </div>
        </form>
      </FormDrawer.Body>

      <FormDrawer.Footer>
        <Button
          type="submit"
          form="satuan-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting}
        >
          {initialData ? "Simpan Perubahan" : "Simpan Satuan"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}