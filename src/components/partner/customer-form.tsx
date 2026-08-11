"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FormDrawer,
  FormInput,
  FormTextarea,
} from "@/components/forms"
import { Button } from "@/components/ui/button"
import { BiUser } from "react-icons/bi"
import {
  customerSchema,
  type CustomerFormValues,
} from "@/lib/validations/partner"

interface CustomerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerForm({ open, onOpenChange }: CustomerFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      kode: "",
      nama: "",
      pic: "",
      telepon: "",
      email: "",
      alamatPengiriman: "",
      catatan: "",
    },
  })

  const onSubmit = (data: CustomerFormValues) => {
    console.log("Submitted Customer:", data)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      reset()
      onOpenChange(false)
    }, 1500)
  }

  const handleDraft = () => {
    console.log("Draft Customer:", { ...getValues(), status: "draft" })
    onOpenChange(false)
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Tambah Customer Baru"
      description="Isi formulir berikut untuk mendaftarkan mitra customer baru ke dalam sistem."
      icon={BiUser}
    >
      <FormDrawer.Body>
        <form
          id="customer-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1">
              <FormInput
                label="Kode Customer *"
                placeholder="CUST-004"
                error={errors.kode}
                {...register("kode")}
              />
              <p className="text-xs text-[#857f78]">
                Kode unik identifikasi customer (otomatis/manual).
              </p>
            </div>

            <FormInput
              label="Nama Perusahaan / Customer *"
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
              label="Alamat Pengiriman / Lokasi Proyek *"
              placeholder="Jl. Raya Industri No. 45, Kecamatan, Kota, Provinsi"
              className="col-span-2"
              error={errors.alamatPengiriman}
              {...register("alamatPengiriman")}
            />

            <FormTextarea
              label="Catatan / Keterangan Pengiriman"
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
          type="button"
          variant="outline"
          onClick={handleDraft}
          className="rounded-xl"
        >
          Draft
        </Button>
        <Button
          type="submit"
          form="customer-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting || submitted}
        >
          {submitted ? "Tersimpan!" : "Simpan Customer"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
