"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormDrawer, FormInput, FormTextarea } from "@/components/forms"
import { Button } from "@/components/ui/button"
import { BiTag } from "react-icons/bi"
import { toast } from "sonner"
import { getErrorMessage, handleApiValidationErrors } from "@/lib/api"
import { useApiCreate, useApiUpdate } from "@/hooks/use-api"
import type { Kategori, KategoriPayload } from "@/types"
import {
  kategoriSchema,
  type KategoriFormValues,
} from "@/lib/validations/kategori"

interface KategoriFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Kategori | null
  onSuccess?: () => void
}

export function KategoriForm({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: KategoriFormProps) {
  const create = useApiCreate<Kategori, KategoriPayload>(
    "kategori",
    "/kategori"
  )
  const update = useApiUpdate<Kategori, KategoriPayload>(
    "kategori",
    "/kategori"
  )

  const formValues = useMemo(
    () => ({
      nama: initialData?.nama ?? "",
      prefix: "",
      deskripsi: initialData?.deskripsi ?? "",
    }),
    [initialData]
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<KategoriFormValues>({
    resolver: zodResolver(kategoriSchema),
    values: formValues,
  })

  const onSubmit = async (data: KategoriFormValues) => {
    const payload: KategoriPayload = {
      nama: data.nama,
      deskripsi: data.deskripsi || undefined,
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
      title={initialData ? "Ubah Kategori" : "Tambah Kategori Baru"}
      description="Atur kategori barang dan satuan ukurnya."
      icon={BiTag}
    >
      <FormDrawer.Body>
        <form
          id="kategori-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-5">
            <FormInput
              label="Nama Kategori *"
              placeholder="Contoh: Material Konstruksi"
              error={errors.nama}
              {...register("nama")}
            />

            <FormInput
              label="Kode / Prefix Kategori *"
              placeholder="Contoh: MAT, BSI, CAT (Opsional)"
              error={errors.prefix}
              {...register("prefix")}
            />

            <FormTextarea
              label="Deskripsi & Keterangan"
              placeholder="Penjelasan singkat mengenai jenis barang yang termasuk dalam kategori ini..."
              error={errors.deskripsi}
              {...register("deskripsi")}
            />
          </div>
        </form>
      </FormDrawer.Body>

      <FormDrawer.Footer>
        <Button
          type="submit"
          form="kategori-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting}
        >
          {initialData ? "Simpan Perubahan" : "Simpan Kategori"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
