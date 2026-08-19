"use client"

import { useMemo } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FormDrawer,
  FormField,
  FormDate,
  FormTextarea,
  FormSection,
  FormReferenceInput,
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
import { TableCell } from "@/components/ui/table"
import { BiTransfer } from "react-icons/bi"
import { toast } from "sonner"
import { generateReferenceNumber } from "@/lib/reference-number"
import { useApiCreate, useApiUpdate } from "@/hooks/use-api"
import { useOptions, toOptions, toBarangOptions } from "@/hooks/use-options"
import { getErrorMessage, handleApiValidationErrors } from "@/lib/api"
import type { Barang, Gudang, MutasiStok, MutasiStokPayload } from "@/types"
import { mutasiSchema, type MutasiFormValues } from "@/lib/validations/mutasi"

interface MutasiFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: MutasiStok | null
  onSuccess?: () => void
}

export function MutasiForm({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: MutasiFormProps) {
  const createMutation = useApiCreate<MutasiStok, MutasiStokPayload>(
    "mutasi",
    "/mutasi-stok"
  )
  const updateMutation = useApiUpdate<MutasiStok, MutasiStokPayload>(
    "mutasi",
    "/mutasi-stok"
  )

  const { items: gudangList } = useOptions<Gudang>("gudang", "/gudang")
  const { items: barangList } = useOptions<Barang>("barang", "/barang")

  const gudangOptions = useMemo(() => toOptions(gudangList), [gudangList])
  const barangOptions = useMemo(() => toBarangOptions(barangList), [barangList])

  const defaultValues = useMemo<MutasiFormValues>(() => {
    if (initialData) {
      return {
        noReferensi: initialData.no_referensi,
        tanggal: initialData.tanggal,
        gudangAsalId: String(initialData.gudang_asal_id),
        gudangTujuanId: String(initialData.gudang_tujuan_id),
        catatan: initialData.keterangan ?? "",
        items:
          initialData.details && initialData.details.length > 0
            ? initialData.details.map((d) => ({
                barangId: String(d.barang_id),
                jumlah: d.qty,
              }))
            : initialData.barang_id
              ? [
                  {
                    barangId: String(initialData.barang_id),
                    jumlah: initialData.qty ?? 1,
                  },
                ]
              : [{ barangId: "", jumlah: 1 }],
      }
    }
    const today = new Date().toISOString().slice(0, 10)
    return {
      noReferensi: generateReferenceNumber("MS", { date: today }),
      tanggal: today,
      gudangAsalId: "",
      gudangTujuanId: "",
      catatan: "",
      items: [{ barangId: "", jumlah: 1 }],
    }
  }, [initialData])

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MutasiFormValues>({
    resolver: zodResolver(mutasiSchema),
    values: defaultValues,
  })

  const handleRegenerateRef = () => {
    const currentDate = getValues("tanggal") || new Date()
    const currentRef = getValues("noReferensi")
    const newRef = generateReferenceNumber("MS", {
      date: currentDate,
      currentRef,
    })
    setValue("noReferensi", newRef, { shouldValidate: true })
    clearErrors("noReferensi")
  }

  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  const watchItems = watch("items")

  const totalSku = watchItems?.filter((i) => i.barangId).length ?? 0
  const totalItem =
    watchItems?.reduce((sum, i) => sum + (i.jumlah || 0), 0) ?? 0
  const getBarang = (id: string) => barangList.find((b) => String(b.id) === id)

  const onSubmit = async (data: MutasiFormValues) => {
    const payload: MutasiStokPayload = {
      no_referensi: data.noReferensi.trim(),
      gudang_asal_id: Number(data.gudangAsalId),
      gudang_tujuan_id: Number(data.gudangTujuanId),
      tanggal: data.tanggal,
      keterangan: data.catatan || undefined,
      details: data.items
        .filter((i) => i.barangId)
        .map((i) => ({
          barang_id: Number(i.barangId),
          qty: Number(i.jumlah) || 0,
        })),
    }

    try {
      if (initialData) {
        const response = await updateMutation.mutateAsync({
          id: initialData.id,
          data: payload,
        })
        toast.success(response.message)
      } else {
        const response = await createMutation.mutateAsync(payload)
        toast.success(response.message)
      }
      reset(defaultValues)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      handleApiValidationErrors(err, setError)
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Ubah Mutasi Antar Gudang" : "Mutasi Antar Gudang"}
      description="Pindahkan stok barang antar lokasi gudang."
      icon={BiTransfer}
    >
      <FormDrawer.Body>
        <form
          id="mutasi-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <FormReferenceInput
              label="No. referensi"
              required
              error={errors.noReferensi}
              disabled={!!initialData}
              onRegenerate={!initialData ? handleRegenerateRef : undefined}
              placeholder="contoh: MS-20260818-001"
              {...register("noReferensi")}
            />

            <FormField label="Tanggal" error={errors.tanggal}>
              <FormDate {...register("tanggal")} />
            </FormField>

            <FormField label="Gudang asal" error={errors.gudangAsalId}>
              <Controller
                control={control}
                name="gudangAsalId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 min-h-10 w-full rounded-xl border-border bg-card px-3.5">
                      <SelectValue placeholder="Pilih gudang asal" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover">
                      {gudangOptions.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Gudang tujuan" error={errors.gudangTujuanId}>
              <Controller
                control={control}
                name="gudangTujuanId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 min-h-10 w-full rounded-xl border-border bg-card px-3.5">
                      <SelectValue placeholder="Pilih gudang tujuan" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover">
                      {gudangOptions.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
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
          </div>

          <FormSection title="Daftar Item">
            <ItemTable
              headers={[
                "SKU / Nama Barang",
                { label: "Stok Tersedia", className: "w-28 text-right" },
                { label: "Jumlah Keluar", className: "w-32 text-right" },
                { label: "Satuan", className: "w-20" },
              ]}
              onAdd={() => append({ barangId: "", jumlah: 1 })}
              error={errors.items?.message || errors.items?.root?.message}
            >
              {fields.map((field, index) => {
                const selectedBarang = getBarang(
                  watchItems?.[index]?.barangId ?? ""
                )
                return (
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
                              {barangOptions.map((b) => (
                                <SelectItem key={b.value} value={b.value}>
                                  {b.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-right text-sm text-foreground tabular-nums">
                      {selectedBarang ? "-" : "—"}
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
                    <TableCell className="text-sm text-[#4c4546]">
                      {selectedBarang?.satuan?.nama ?? "—"}
                    </TableCell>
                  </ItemTableRow>
                )
              })}
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
          form="mutasi-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
