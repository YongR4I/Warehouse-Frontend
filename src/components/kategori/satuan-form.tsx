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
import { BiTag } from "react-icons/bi"
import {
  satuanSchema,
  type SatuanFormValues,
} from "@/lib/validations/kategori"

interface SatuanFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SatuanForm({ open, onOpenChange }: SatuanFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SatuanFormValues>({
    resolver: zodResolver(satuanSchema),
    defaultValues: {
      kode: "",
      nama: "",
      keterangan: "",
    },
  })

  const onSubmit = (data: SatuanFormValues) => {
    console.log("Submitted Satuan:", data)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      reset()
      onOpenChange(false)
    }, 1500)
  }

  const handleDraft = () => {
    console.log("Draft Satuan:", { ...getValues(), status: "draft" })
    onOpenChange(false)
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Tambah Satuan Unit (UOM) Baru"
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
          type="button"
          variant="outline"
          onClick={handleDraft}
          className="rounded-xl"
        >
          Draft
        </Button>
        <Button
          type="submit"
          form="satuan-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting || submitted}
        >
          {submitted ? "Tersimpan!" : "Simpan Satuan"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
