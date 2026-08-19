"use client"

import { useEffect, useState } from "react"
import {
  useForm,
  useFieldArray,
  Controller,
  type Resolver,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FormDrawer,
  FormField,
  FormDate,
  FormTextarea,
  FormSection,
} from "@/components/forms"
import { ItemTable, ItemTableRow } from "@/components/item-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { UploadInput } from "@/components/input/upload"
import { TableCell } from "@/components/ui/table"
import { BiUpArrowCircle, BiSearch } from "react-icons/bi"
import { toast } from "sonner"
import { barangKeluarSchema } from "@/lib/validations/barang-keluar"
import { useApiCreate, useApiUpdate } from "@/hooks/use-api"
import { useOptions } from "@/hooks/use-options"
import { getErrorMessage, uploadFile } from "@/lib/api"
import type {
  Barang,
  BarangKeluar,
  BarangKeluarPayload,
  Customer,
  Gudang,
  LokasiRak,
} from "@/types"

interface BarangKeluarItemFormValues {
  barangId: string
  jumlah: number
  harga: number | null
  lokasiRakId: string
}

interface BarangKeluarFormValues {
  noReferensi: string
  nomorSuratJalan: string
  tanggal: string
  gudangId: string
  customer: string
  catatan: string
  dokumen: File[]
  items: BarangKeluarItemFormValues[]
}

const defaultValues: BarangKeluarFormValues = {
  noReferensi: "",
  nomorSuratJalan: "",
  tanggal: new Date().toISOString().split("T")[0],
  gudangId: "",
  customer: "",
  catatan: "",
  dokumen: [],
  items: [{ barangId: "", jumlah: 1, harga: null, lokasiRakId: "" }],
}

interface BarangKeluarFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: BarangKeluar | null
  onSuccess?: () => void
}

export function BarangKeluarForm({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: BarangKeluarFormProps) {
  const [isUploading, setIsUploading] = useState(false)

  const { items: gudangItems } = useOptions<Gudang>("gudang-options", "/gudang")
  const { items: customerItems } = useOptions<Customer>(
    "customer-options",
    "/customer"
  )
  const { items: barangItems } = useOptions<Barang>("barang-options", "/barang")
  const { items: rakItems } = useOptions<LokasiRak>(
    "lokasi-rak-options",
    "/lokasi-rak"
  )

  const createMutation = useApiCreate<BarangKeluar, BarangKeluarPayload>(
    "barang-keluar",
    "/barang-keluar"
  )
  const updateMutation = useApiUpdate<BarangKeluar, BarangKeluarPayload>(
    "barang-keluar",
    "/barang-keluar"
  )

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BarangKeluarFormValues>({
    resolver: zodResolver(
      barangKeluarSchema
    ) as unknown as Resolver<BarangKeluarFormValues>,
    defaultValues,
  })

  useEffect(() => {
    if (!open) return
    if (initialData) {
      const detailItems = initialData.details ?? []
      reset({
        noReferensi: initialData.no_referensi,
        nomorSuratJalan: initialData.nomor_surat_jalan ?? "",
        tanggal: initialData.tanggal?.slice(0, 10) ?? defaultValues.tanggal,
        gudangId: String(initialData.gudang_id),
        customer: String(initialData.customer_id),
        catatan: initialData.keterangan ?? "",
        dokumen: [],
        items: detailItems.length
          ? detailItems.map((d) => ({
              barangId: String(d.barang_id),
              jumlah: d.qty,
              harga: d.harga_satuan ?? null,
              lokasiRakId: d.lokasi_rak_id ? String(d.lokasi_rak_id) : "",
            }))
          : defaultValues.items,
      })
    } else {
      reset(defaultValues)
    }
  }, [open, initialData, reset])

  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  const watchItems = watch("items")

  const totalSku = watchItems?.filter((i) => i.barangId).length ?? 0
  const totalItem =
    watchItems?.reduce((sum, i) => sum + (i.jumlah || 0), 0) ?? 0

  const isSaving =
    createMutation.isPending || updateMutation.isPending || isUploading

  const onSubmit = async () => {
    const values = getValues()
    if (!values.noReferensi.trim()) {
      setError("noReferensi", {
        type: "manual",
        message: "No. referensi wajib diisi",
      })
      return
    }
    setIsUploading(true)
    try {
      let dokumenUrl: string | undefined
      if (values.dokumen?.length) {
        const uploaded = await Promise.all(
          values.dokumen.map((file) => uploadFile(file))
        )
        dokumenUrl = uploaded.map((u) => u.url).join(",")
      }
      const payload: BarangKeluarPayload = {
        no_referensi: values.noReferensi.trim(),
        nomor_surat_jalan: values.nomorSuratJalan.trim() || undefined,
        gudang_id: Number(values.gudangId),
        customer_id: Number(values.customer),
        tanggal: values.tanggal,
        keterangan: values.catatan || undefined,
        dokumen: dokumenUrl,
        details: values.items.map((item) => ({
          barang_id: Number(item.barangId),
          lokasi_rak_id: item.lokasiRakId
            ? Number(item.lokasiRakId)
            : undefined,
          qty: item.jumlah,
          harga_satuan: item.harga ?? undefined,
        })),
      }
      if (initialData) {
        const res = await updateMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        })
        toast.success(res.message)
      } else {
        const res = await createMutation.mutateAsync(payload)
        toast.success(res.message)
      }
      onSuccess?.()
      onOpenChange(false)
      reset(defaultValues)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Ubah Barang Keluar" : "Keluarkan Barang Baru"}
      description="Catat pengeluaran stok barang keluar ke customer."
      icon={BiUpArrowCircle}
    >
      <FormDrawer.Body>
        <form
          id="barang-keluar-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <FormField
              label="No. Referensi"
              required
              error={errors.noReferensi}
            >
              <input
                type="text"
                placeholder="cth. BK-20260818-001"
                {...register("noReferensi")}
                onChange={(e) => {
                  register("noReferensi").onChange(e)
                  clearErrors("noReferensi")
                }}
                className="h-10 min-h-10 w-full rounded-xl border border-border bg-card px-3.5 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            </FormField>

            <FormField label="No. Surat Jalan (Opsional)">
              <input
                type="text"
                placeholder="cth. SJ-GDN-001"
                {...register("nomorSuratJalan")}
                className="h-10 min-h-10 w-full rounded-xl border border-border bg-card px-3.5 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            </FormField>

            <FormDate
              label="Tanggal Transaksi"
              error={errors.tanggal}
              {...register("tanggal")}
            />

            <FormField label="Gudang Asal" error={errors.gudangId}>
              <Controller
                control={control}
                name="gudangId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 min-h-10 w-full rounded-xl border-border bg-card px-3.5">
                      <SelectValue placeholder="Pilih gudang" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover">
                      {gudangItems.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              label="Customer / Tujuan"
              className="col-span-2"
              error={errors.customer}
            >
              <Controller
                control={control}
                name="customer"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 min-h-10 w-full rounded-xl border-border bg-card px-3.5">
                      <BiSearch className="mr-2 size-4 text-muted-foreground" />
                      <SelectValue placeholder="Cari atau pilih customer..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover">
                      {customerItems.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormTextarea
              label="Catatan (Opsional)"
              className="col-span-2"
              placeholder="Tambahkan keterangan tambahan..."
              {...register("catatan")}
            />

            <FormField
              label="Upload Dokumen Pendukung (Opsional)"
              className="col-span-2"
            >
              <Controller
                control={control}
                name="dokumen"
                render={({ field }) => (
                  <UploadInput
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    value={field.value}
                    onChange={(files) => field.onChange(files)}
                    className="rounded-xl"
                  />
                )}
              />
            </FormField>
          </div>

          <FormSection title="Daftar Item">
            <ItemTable
              headers={[
                "SKU / Nama Barang",
                { label: "Lokasi Rak", className: "w-36" },
                { label: "Harga Satuan", className: "w-32 text-right" },
                { label: "Jumlah Keluar", className: "w-28 text-right" },
              ]}
              onAdd={() =>
                append({
                  barangId: "",
                  jumlah: 1,
                  harga: null,
                  lokasiRakId: "",
                })
              }
              error={errors.items?.message || errors.items?.root?.message}
            >
              {fields.map((field, index) => (
                <ItemTableRow
                  key={field.id}
                  index={index}
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                >
                  <TableCell>
                    <Controller
                      control={control}
                      name={`items.${index}.barangId`}
                      render={({ field: selectField }) => (
                        <Select
                          value={selectField.value}
                          onValueChange={selectField.onChange}
                        >
                          <SelectTrigger className="h-8 w-full rounded-lg border-border bg-white px-3 text-sm">
                            <SelectValue placeholder="Pilih barang..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-popover">
                            {barangItems.map((b) => (
                              <SelectItem key={b.id} value={String(b.id)}>
                                <span className="font-medium">{b.sku}</span>
                                <span className="ml-2 text-muted-foreground">
                                  {b.nama}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      control={control}
                      name={`items.${index}.lokasiRakId`}
                      render={({ field: selectField }) => (
                        <Select
                          value={selectField.value}
                          onValueChange={selectField.onChange}
                        >
                          <SelectTrigger className="h-8 w-full rounded-lg border-border bg-white px-3 text-sm">
                            <SelectValue placeholder="Pilih rak (opsional)" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-popover">
                            {rakItems.map((r) => (
                              <SelectItem key={r.id} value={String(r.id)}>
                                {r.kode_rak}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      {...register(`items.${index}.harga`, {
                        setValueAs: (v) => (v === "" ? null : Number(v)),
                      })}
                      className="h-8 w-full rounded-lg border border-border bg-white px-2 text-right text-sm text-foreground tabular-nums transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      min={1}
                      {...register(`items.${index}.jumlah`, {
                        valueAsNumber: true,
                      })}
                      className="h-8 w-full rounded-lg border border-border bg-white px-2 text-right text-sm text-foreground tabular-nums transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                    />
                  </TableCell>
                </ItemTableRow>
              ))}
            </ItemTable>
          </FormSection>
        </form>
      </FormDrawer.Body>

      <FormDrawer.Footer
        summary={
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs font-semibold text-[#7e7576]">Total SKU</p>
              <p className="text-lg font-semibold text-foreground tabular-nums">
                {totalSku}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#7e7576]">
                Total Item Keluar
              </p>
              <p className="text-lg font-semibold text-foreground tabular-nums">
                {totalItem}
              </p>
            </div>
          </div>
        }
      >
        <Button
          type="submit"
          form="barang-keluar-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSaving || isSubmitting}
        >
          {isSaving
            ? "Menyimpan..."
            : initialData
              ? "Simpan Perubahan"
              : "Simpan Transaksi"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
