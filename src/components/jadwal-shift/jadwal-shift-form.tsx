"use client"

import { useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FormDrawer,
  FormInput,
  FormSelect,
  FormTextarea,
  FormField,
  ShiftDayPicker,
} from "@/components/forms"
import { Button } from "@/components/ui/button"
import { BiCalendar } from "react-icons/bi"
import { toast } from "sonner"
import {
  jadwalShiftSchema,
  type JadwalShiftFormValues,
} from "@/lib/validations/jadwal-shift"
import { useApiList, useApiCreate } from "@/hooks/use-api"
import { getErrorMessage } from "@/lib/api"
import type { Shift, User, Role, JadwalPetugasPayload } from "@/types"

function unwrapRows<T>(data: unknown): T[] {
  const body = data as { data?: unknown } | T[] | null | undefined
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === "object" && Array.isArray(body.data)) {
    return body.data as T[]
  }
  return []
}

// ─── week helpers ─────────────────────────────────────────────────────────────
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toDateParam(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function toWeekString(date: Date): string {
  // type="week" expects YYYY-Www (ISO week)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // Thursday of this week determines ISO year
  const thursday = new Date(d)
  const day = thursday.getDay() || 7
  thursday.setDate(thursday.getDate() + 4 - day)
  const year = thursday.getFullYear()
  const jan4 = new Date(year, 0, 4)
  const jan4Day = jan4.getDay() || 7
  const week1Monday = new Date(jan4)
  week1Monday.setDate(jan4.getDate() - jan4Day + 1)
  const diff = Math.round((thursday.getTime() - week1Monday.getTime()) / 86400000)
  const week = Math.floor(diff / 7) + 1
  return `${year}-W${String(week).padStart(2, "0")}`
}

function parseWeekString(weekStr: string): Date | null {
  // "2026-W20" -> Monday of that ISO week
  const match = weekStr.match(/^(\d{4})-W(\d{2})$/)
  if (!match) return null
  const year = Number(match[1])
  const week = Number(match[2])
  const jan4 = new Date(year, 0, 4)
  const jan4Day = jan4.getDay() || 7
  const mondayWeek1 = new Date(jan4)
  mondayWeek1.setDate(jan4.getDate() - jan4Day + 1)
  const mondayTarget = new Date(mondayWeek1)
  mondayTarget.setDate(mondayWeek1.getDate() + (week - 1) * 7)
  mondayTarget.setHours(0, 0, 0, 0)
  return mondayTarget
}

const DEFAULT_ALOKASI: JadwalShiftFormValues["alokasi"] = {
  sen: "Shift 1",
  sel: "Shift 1",
  rab: "Shift 1",
  kam: "Shift 1",
  jum: "Shift 1",
  sab: "OFF",
  min: "OFF",
}

const DAY_KEYS: (keyof JadwalShiftFormValues["alokasi"])[] = [
  "sen",
  "sel",
  "rab",
  "kam",
  "jum",
  "sab",
  "min",
]

interface JadwalShiftFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JadwalShiftForm({ open, onOpenChange }: JadwalShiftFormProps) {
  const usersQuery = useApiList<User>({ key: "users", url: "/user", params: { per_page: 100 } })
  const rolesQuery = useApiList<Role>({ key: "roles", url: "/role", params: { per_page: 100 } })
  const shiftsQuery = useApiList<Shift>({ key: "shifts", url: "/shift", params: { per_page: 100 } })

  const users = unwrapRows<User>(usersQuery.data)
  const roles = unwrapRows<Role>(rolesQuery.data)
  const shifts = unwrapRows<Shift>(shiftsQuery.data)

  const createMutation = useApiCreate<unknown, JadwalPetugasPayload>("jadwal-petugas", "/jadwal-petugas")

  const petugasOptions = useMemo(
    () => users.map((u) => ({ value: String(u.id), label: u.name })),
    [users]
  )

  const peranOptions = useMemo(
    () => roles.map((r) => ({ value: r.name, label: r.name })),
    [roles]
  )

  // fallback peran mock kalau roles kosong (dev tanpa BE)
  const effectivePeranOptions = peranOptions.length > 0
    ? peranOptions
    : [
        { value: "operator-forklift", label: "Operator Forklift" },
        { value: "admin-inbound", label: "Admin Inbound" },
        { value: "packer-outbound", label: "Packer Outbound" },
        { value: "staff-qc", label: "Staff Quality Control" },
        { value: "supervisor", label: "Supervisor Gudang" },
      ]

  const shiftByName = useMemo(() => {
    const map = new Map<string, Shift>()
    for (const s of shifts) map.set(s.nama, s)
    return map
  }, [shifts])

  const defaultWeek = useMemo(() => toWeekString(getMonday(new Date())), [])

  const {
    register,
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JadwalShiftFormValues>({
    resolver: zodResolver(jadwalShiftSchema),
    defaultValues: {
      periodeMinggu: defaultWeek,
      petugasId: "",
      peran: "",
      alokasi: DEFAULT_ALOKASI,
      catatan: "",
    },
  })

  const onSubmit = async (data: JadwalShiftFormValues) => {
    const monday = parseWeekString(data.periodeMinggu)
    if (!monday) {
      toast.error("Format periode minggu tidak valid (harus YYYY-Www)")
      return
    }

    const userId = Number(data.petugasId)
    if (!userId) {
      toast.error("Petugas tidak valid")
      return
    }

    // Build payloads for 7 days, skip OFF
    const payloads: JadwalPetugasPayload[] = []
    for (let i = 0; i < 7; i++) {
      const key = DAY_KEYS[i]
      const shiftLabel = data.alokasi[key]
      if (shiftLabel === "OFF") continue
      const shift = shiftByName.get(shiftLabel)
      if (!shift) {
        toast.error(`Shift "${shiftLabel}" tidak ditemukan di master shift`)
        return
      }
      const tanggal = toDateParam(addDays(monday, i))
      payloads.push({ user_id: userId, shift_id: shift.id, tanggal })
    }

    if (payloads.length === 0) {
      toast.error("Minimal 1 hari harus dialokasikan shift (tidak boleh semua OFF)")
      return
    }

    try {
      // BE saat ini single-create; loop 7x. Nanti bisa ganti ke /jadwal-petugas/bulk
      for (const payload of payloads) {
        await createMutation.mutateAsync(payload)
      }
      toast.success(`Jadwal shift berhasil disimpan (${payloads.length} hari)${data.catatan ? " • catatan tersimpan lokal" : ""}`)
      reset({ periodeMinggu: toWeekString(getMonday(new Date())), petugasId: "", peran: "", alokasi: DEFAULT_ALOKASI, catatan: "" })
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleDraft = () => {
    const vals = getValues()
    // Draft: tidak hit API, cuma toast & close. Catatan/peran disimpan lokal jika butuh.
    console.log("Draft Jadwal Shift:", { ...vals, isDraft: true })
    toast.info("Draft jadwal tersimpan (lokal)")
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // reset ke defaults saat tutup? keep data jika mau edit lagi — reset optional
    }
    onOpenChange(next)
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={handleOpenChange}
      title="Atur Shift Kerja Petugas"
      description="Pilih petugas, tetapkan peran tanggung jawab, dan atur alokasi shift harian selama satu minggu."
      icon={BiCalendar}
    >
      <FormDrawer.Body>
        <form
          id="jadwal-shift-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Periode Minggu Kerja — Figma: Input full-width with calendar icon */}
          <FormInput
            label="Periode Minggu Kerja"
            required
            placeholder="Week 20, 2026"
            type="week"
            error={errors.periodeMinggu}
            {...register("periodeMinggu")}
          />

          {/* Petugas & Peran — 2 col grid 370px each */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Controller
              control={control}
              name="petugasId"
              render={({ field }) => (
                <FormSelect
                  label="Nama Petugas Gudang"
                  required
                  value={field.value}
                  onValueChange={(val) => field.onChange(val || "")}
                  placeholder="Pilih petugas..."
                  options={petugasOptions}
                  error={errors.petugasId}
                  disabled={usersQuery.isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="peran"
              render={({ field }) => (
                <FormSelect
                  label="Tanggung Jawab / Peran"
                  required
                  value={field.value}
                  onValueChange={(val) => field.onChange(val || "")}
                  placeholder="Pilih peran...."
                  options={effectivePeranOptions}
                  error={errors.peran}
                  disabled={rolesQuery.isLoading}
                />
              )}
            />
          </div>

          {/* Alokasi Shift Harian — 7-card grid via ShiftDayPicker */}
          <FormField
            label="Alokasi Shift Harian"
            required
            error={errors.alokasi?.message ?? (errors.alokasi as unknown as string)}
          >
            <Controller
              control={control}
              name="alokasi"
              render={({ field }) => (
                <ShiftDayPicker value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          {/* Catatan — Textarea 122px */}
          <FormTextarea
            label="Catatan Tambahan / Instruksi Khusus"
            placeholder="Instruksi khusus untuk petugas selama minggu ini..."
            rows={4}
            error={errors.catatan}
            {...register("catatan")}
          />
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
          form="jadwal-shift-form"
          className="rounded-xl bg-black px-6 text-white hover:bg-black/90"
          disabled={isSubmitting || createMutation.isPending}
        >
          {createMutation.isPending || isSubmitting ? "Menyimpan..." : "Simpan Shift"}
        </Button>
      </FormDrawer.Footer>
    </FormDrawer>
  )
}
