"use client"

import { useState } from "react"
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
import {
  barangSchema,
  type BarangFormValues,
} from "@/lib/validations/barang"

const mockKategori = [
  { value: "1", label: "Material Bangunan" },
  { value: "2", label: "Cat & Pelapis" },
  { value: "3", label: "Plumbing" },
  { value: "4", label: "Elektrikal" },
]

const mockSatuan = [
  { value: "Sak", label: "Sak" },
  { value: "Batang", label: "Batang" },
  { value: "Kaleng", label: "Kaleng" },
  { value: "Pcs", label: "Pcs" },
]

const mockStatus = [
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
]

interface BarangFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BarangForm({ open, onOpenChange }: BarangFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BarangFormValues>({
    resolver: zodResolver(barangSchema),
    defaultValues: {
      nama: "",
      sku: "",
      barcode: "",
      kategoriId: "",
      satuan: "",
      stokMin: 0,
      status: "aktif",
      foto: [],
      dokumen: [],
      deskripsi: "",
    },
  })

  const onSubmit = (data: BarangFormValues) => {
    console.log("Submitted:", data)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      reset()
      onOpenChange(false)
    }, 1500)
  }

  const handleDraft = () => {
    console.log("Draft:", { ...getValues(), status: "draft" })
    onOpenChange(false)
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Tambah Barang Baru"
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
                  options={mockKategori}
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
                  options={mockSatuan}
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
                  options={mockStatus}
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
                    onChange={(e) => {
                      const files = e.target.files
                        ? Array.from(e.target.files)
                        : []
                      field.onChange(files)
                    }}
                    className="rounded-xl"
                  >
                    Klik atau seret foto ke area ini
                  </UploadInput>
                )}
              />
            </FormField>

            <FormField
              label="Dokumen Pendukung (Sertifikasi / Datasheet)"
              className="col-span-2"
              error={errors.dokumen as unknown as FieldError}
            >
              <Controller
                control={control}
                name="dokumen"
                render={({ field }) => (
                  <UploadInput
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files
                        ? Array.from(e.target.files)
                        : []
                      field.onChange(files)
                    }}
                    className="rounded-xl"
                  >
                    Klik atau seret foto / dokumen ke area ini
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
          type="button"
          variant="outline"
          onClick={handleDraft}
          className="rounded-xl"
        >
          Draft
        </Button>
        <Button
          type="submit"
          form="barang-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting || submitted}
        >
          {submitted ? "Tersimpan!" : "Simpan Barang"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
