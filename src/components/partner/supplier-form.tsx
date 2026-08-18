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
import { BiUser } from "react-icons/bi"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api"
import { useApiCreate, useApiUpdate } from "@/hooks/use-api"
import type { Supplier, SupplierPayload } from "@/types"
import {
  supplierSchema,
  type SupplierFormValues,
} from "@/lib/validations/partner"

interface SupplierFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Supplier | null
  onSuccess?: () => void
}

export function SupplierForm({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: SupplierFormProps) {
  const create = useApiCreate<Supplier, SupplierPayload>("supplier", "/supplier")
  const update = useApiUpdate<Supplier, SupplierPayload>("supplier", "/supplier")

  const formValues = useMemo(
    () => ({
      kode: initialData?.kode ?? "",
      nama: initialData?.nama ?? "",
      pic: initialData?.kontak ?? "",
      telepon: initialData?.telepon ?? "",
      email: initialData?.email ?? "",
      alamat: initialData?.alamat ?? "",
      catatan: "",
    }),
    [initialData]
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    values: formValues,
  })

  const onSubmit = async (data: SupplierFormValues) => {
    const payload: SupplierPayload = {
      kode: data.kode,
      tipe: initialData?.tipe ?? "supplier",
      nama: data.nama,
      kontak: data.pic || undefined,
      telepon: data.telepon,
      email: data.email || undefined,
      alamat: data.alamat,
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
      title={initialData ? "Ubah Supplier" : "Tambah Supplier Baru"}
      description="Isi formulir berikut untuk mendaftarkan mitra pemasok barang baru ke dalam sistem."
      icon={BiUser}
    >
      <FormDrawer.Body>
        <form
          id="supplier-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1">
              <FormInput
                label="Kode Supplier *"
                placeholder="SUP-004"
                error={errors.kode}
                {...register("kode")}
              />
              <p className="text-xs text-[#857f78]">
                Kode unik identifikasi supplier (otomatis/manual).
              </p>
            </div>

            <FormInput
              label="Nama Perusahaan / Toko *"
              placeholder="Contoh: PT Semen Nusantara"
              error={errors.nama}
              {...register("nama")}
            />

            <FormInput
              label="Nama Penanggung Jawab (PIC)"
              placeholder="Contoh: Bambang Setyono"
              className="col-span-2"
              error={errors.pic}
              {...register("pic")}
            />

            <FormInput
              label="Nomor Telepon / WhatsApp *"
              placeholder="0812-3456-7890"
              error={errors.telepon}
              {...register("telepon")}
            />

            <FormInput
              label="Alamat Email"
              placeholder="sales@perusahaan.co.id"
              error={errors.email}
              {...register("email")}
            />

            <FormTextarea
              label="Alamat Lengkap Kantor / Gudang *"
              placeholder="Jl. Raya Industri No. 45, Kecamatan, Kota, Provinsi"
              className="col-span-2"
              error={errors.alamat}
              {...register("alamat")}
            />

            <FormTextarea
              label="Catatan / Keterangan Tambahan"
              placeholder="Syarat pembayaran, termin, atau informasi penting lainnya.."
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
          form="supplier-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting}
        >
          {initialData ? "Simpan Perubahan" : "Simpan Supplier"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}