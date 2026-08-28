"use client"

import { useMemo, useState } from "react"
import { useForm, Controller, type FieldError } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FormDrawer,
  FormInput,
  FormSelect,
  FormTextarea,
  FormField,
} from "@/components/forms"
import { Button } from "@/components/ui/button"
import { UploadInput } from "@/components/input/upload"
import { BiPackage } from "react-icons/bi"
import { toast } from "sonner"
import {
  getErrorMessage,
  handleApiValidationErrors,
  uploadFile,
} from "@/lib/api"
import { useApiCreate, useApiUpdate } from "@/hooks/use-api"
import { useOptions, toOptions } from "@/hooks/use-options"
import type { Barang, BarangPayload, Kategori, Satuan } from "@/types"
import { barangSchema, type BarangFormValues } from "@/lib/validations/barang"

const statusOptions = [
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
]

interface BarangFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Barang | null
  onSuccess?: () => void
}

export function BarangForm({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: BarangFormProps) {
  const create = useApiCreate<Barang, BarangPayload>("barang", "/barang")
  const update = useApiUpdate<Barang, BarangPayload>("barang", "/barang")

  const { items: kategoris } = useOptions<Kategori>("kategori", "/kategori")
  const { items: satuans } = useOptions<Satuan>("satuan", "/satuan")
  const kategoriOptions = toOptions(kategoris)
  const satuanOptions = toOptions(satuans)

  const [prevId, setPrevId] = useState<number | undefined>(initialData?.id)
  const [fotoRemoved, setFotoRemoved] = useState(false)
  if (initialData?.id !== prevId) {
    setPrevId(initialData?.id)
    setFotoRemoved(false)
  }
  const existingFoto = fotoRemoved ? null : (initialData?.foto ?? null)

  const formValues = useMemo(
    () => ({
      nama: initialData?.nama ?? "",
      sku: initialData?.sku ?? "",
      barcode: initialData?.barcode ?? "",
      kategoriId:
        initialData?.kategori_id != null ? String(initialData.kategori_id) : "",
      satuan:
        initialData?.satuan_id != null ? String(initialData.satuan_id) : "",
      stokMin: initialData?.min_stok ?? 0,
      status: initialData?.status ?? "aktif",
      foto: [],
      deskripsi: initialData?.deskripsi ?? "",
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
  } = useForm<BarangFormValues>({
    resolver: zodResolver(barangSchema),
    values: formValues,
  })

  const onSubmit = async (data: BarangFormValues) => {
    try {
      let foto: string | undefined = existingFoto ?? undefined
      if (data.foto && data.foto.length > 0) {
        const uploadRes = await uploadFile(data.foto[0])
        foto = uploadRes.url
      }
      const payload: BarangPayload = {
        nama: data.nama,
        sku: data.sku,
        barcode: data.barcode || undefined,
        kategori_id: Number(data.kategoriId),
        satuan_id: Number(data.satuan),
        min_stok: Number(data.stokMin),
        status: data.status,
        foto,
        deskripsi: data.deskripsi || undefined,
      }
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
      title={initialData ? "Ubah Barang" : "Tambah Barang Baru"}
      description="Kelola data induk barang, SKU, dan spesifikasi produk."
      icon={BiPackage}
    >
      <FormDrawer.Body>
        <form
          id="barang-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <FormInput
              label="Nama Barang *"
              placeholder="Contoh: Semen Tiga Roda 50kg"
              className="col-span-2"
              error={errors.nama}
              {...register("nama")}
            />

            <FormInput
              label="Kode SKU *"
              placeholder="Contoh: BRG-0123"
              error={errors.sku}
              {...register("sku")}
            />

            <FormInput
              label="Barcode / EAN"
              placeholder="masukan nomer barcode.."
              error={errors.barcode}
              {...register("barcode")}
            />

            <Controller
              control={control}
              name="kategoriId"
              render={({ field }) => (
                <FormSelect
                  label="Kategori *"
                  value={field.value}
                  onValueChange={(val) => field.onChange(val || "")}
                  placeholder="Pilih kategori"
                  options={kategoriOptions}
                  error={errors.kategoriId}
                />
              )}
            />

            <Controller
              control={control}
              name="satuan"
              render={({ field }) => (
                <FormSelect
                  label="Satuan Satuan / UOM *"
                  value={field.value}
                  onValueChange={(val) => field.onChange(val || "")}
                  placeholder="Pilih satuan"
                  options={satuanOptions}
                  error={errors.satuan}
                />
              )}
            />

            <FormInput
              label="Stok Minimum *"
              type="number"
              placeholder="0"
              error={errors.stokMin}
              {...register("stokMin", { valueAsNumber: true })}
            />

            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <FormSelect
                  label="Status Induk"
                  value={field.value}
                  onValueChange={(val) => field.onChange(val || "")}
                  placeholder="Pilih status"
                  options={statusOptions}
                  error={errors.status}
                />
              )}
            />

            <FormField
              label="Foto Produk"
              className="col-span-2"
              error={errors.foto as unknown as FieldError}
            >
              <Controller
                control={control}
                name="foto"
                render={({ field }) => (
                  <UploadInput
                    accept=".jpg,.jpeg,.png,.webp"
                    value={field.value}
                    initialUrl={existingFoto}
                    onChange={(files) => field.onChange(files)}
                    onRemove={() => {
                      field.onChange([])
                      setFotoRemoved(true)
                    }}
                    className="rounded-xl"
                  >
                    Klik atau seret foto produk ke sini
                  </UploadInput>
                )}
              />
            </FormField>

            <FormTextarea
              label="Deskripsi & Catatan"
              placeholder="Spesifikasi tambahan, instruksi penyimpanan, dll..."
              className="col-span-2"
              error={errors.deskripsi}
              {...register("deskripsi")}
            />
          </div>
        </form>
      </FormDrawer.Body>

      <FormDrawer.Footer>
        <Button
          type="submit"
          form="barang-form"
          className="rounded-xl bg-foreground px-6 text-background hover:bg-foreground/90"
          disabled={isSubmitting}
        >
          {initialData ? "Simpan Perubahan" : "Simpan Barang"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}