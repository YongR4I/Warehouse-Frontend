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
  kategoriSchema,
  type KategoriFormValues,
} from "@/lib/validations/kategori"

interface KategoriFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KategoriForm({ open, onOpenChange }: KategoriFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<KategoriFormValues>({
    resolver: zodResolver(kategoriSchema),
    defaultValues: {
      nama: "",
      prefix: "",
      deskripsi: "",
    },
  })

  const onSubmit = (data: KategoriFormValues) => {
    console.log("Submitted Category:", data)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      reset()
      onOpenChange(false)
    }, 1500)
  }

  const handleDraft = () => {
    console.log("Draft Category:", { ...getValues(), status: "draft" })
    onOpenChange(false)
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Tambah Kategori Baru"
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
          type="button"
          variant="outline"
          onClick={handleDraft}
          className="rounded-xl"
        >
          Draft
        </Button>
        <Button
          type="submit"
          form="kategori-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting || submitted}
        >
          {submitted ? "Tersimpan!" : "Simpan Kategori"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
