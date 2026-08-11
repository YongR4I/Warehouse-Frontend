"use client"

import { useState } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FormDrawer,
  FormField,
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
import { TableCell } from "@/components/ui/table"
import { BiTransfer } from "react-icons/bi"
import {
  mutasiSchema,
  type MutasiFormValues,
} from "@/lib/validations/mutasi"

// ── Mock data ───────────────────────────────────────────────────
const mockGudang = [
  { id: "1", nama: "Gudang Pusat" },
  { id: "2", nama: "Gudang Timur" },
  { id: "3", nama: "Gudang Selatan" },
]

const mockBarang = [
  {
    id: "1",
    kode: "SKU-A-001",
    nama: "Laptop ThinkPad T14",
    stok: 45,
    satuan: "Unit",
  },
  {
    id: "2",
    kode: "SKU-A-002",
    nama: "Monitor LG 27 inch",
    stok: 30,
    satuan: "Unit",
  },
  {
    id: "3",
    kode: "SKU-B-001",
    nama: "Keyboard Mechanical",
    stok: 120,
    satuan: "Pcs",
  },
  {
    id: "4",
    kode: "SKU-B-002",
    nama: "Mouse Wireless Logitech",
    stok: 85,
    satuan: "Pcs",
  },
  {
    id: "5",
    kode: "SKU-C-001",
    nama: "Kabel HDMI 2m",
    stok: 200,
    satuan: "Pcs",
  },
]

interface MutasiFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MutasiForm({ open, onOpenChange }: MutasiFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<MutasiFormValues>({
    resolver: zodResolver(mutasiSchema),
    defaultValues: {
      gudangAsalId: "",
      gudangTujuanId: "",
      catatan: "",
      items: [{ barangId: "", jumlah: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  const watchItems = watch("items")

  const totalSku = watchItems?.filter((i) => i.barangId).length ?? 0
  const totalItem =
    watchItems?.reduce((sum, i) => sum + (i.jumlah || 0), 0) ?? 0
  const getBarang = (id: string) => mockBarang.find((b) => b.id === id)

  const onSubmit = (data: MutasiFormValues) => {
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
      title="Mutasi Antar Gudang"
      description="Pindahkan stok barang antar lokasi gudang."
      icon={BiTransfer}
    >
      <FormDrawer.Body>
        <form
          id="mutasi-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Header Fields */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
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
                      {mockGudang.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.nama}
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
                      {mockGudang.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.nama}
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

          {/* Item Table Section */}
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
                                {mockBarang.map((b) => (
                                  <SelectItem key={b.id} value={b.id}>
                                    <span className="font-medium">{b.kode}</span>
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
                    <TableCell className="text-right text-sm text-foreground tabular-nums">
                      {selectedBarang?.stok ?? "—"}
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
                      {selectedBarang?.satuan ?? "—"}
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
          type="button"
          variant="outline"
          onClick={handleDraft}
          className="rounded-xl"
        >
          Draft
        </Button>
        <Button
          type="submit"
          form="mutasi-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting || submitted}
        >
          {submitted ? "Tersimpan!" : "Simpan Transaksi"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
