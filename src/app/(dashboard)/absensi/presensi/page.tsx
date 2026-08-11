import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import {
  BiUserCheck,
  BiChevronRight,
  BiDotsVerticalRounded,
  BiSolidReport,
  BiCalendar,
} from "react-icons/bi"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { ColoredBadge } from "@/components/ui/colored-badge"

interface AttendanceItem {
  id: string
  kodePegawai: string
  namaLengkap: string
  tanggungJawab: string
  shiftKerja: string
  jamMasuk: string
  jamKeluar: string
  keterangan: string
}

const dummyData: AttendanceItem[] = [
  {
    id: "1",
    kodePegawai: "PG-001",
    namaLengkap: "Ahmad Fauzi",
    tanggungJawab: "Operator Forklift",
    shiftKerja: "Pagi (07:00 - 15:00)",
    jamMasuk: "06:52",
    jamKeluar: "15:05",
    keterangan: "Tepat Waktu",
  },
  {
    id: "2",
    kodePegawai: "PG-002",
    namaLengkap: "Budi Santoso",
    tanggungJawab: "Admin Inbound",
    shiftKerja: "Pagi (07:00 - 15:00)",
    jamMasuk: "07:14",
    jamKeluar: "15:02",
    keterangan: "Terlambat (14m)",
  },
  {
    id: "3",
    kodePegawai: "PG-003",
    namaLengkap: "Dedi Kurniawan",
    tanggungJawab: "Packer Outbound",
    shiftKerja: "Siang (15:00 - 23:00)",
    jamMasuk: "-",
    jamKeluar: "-",
    keterangan: "Izin (Sakit)",
  },
  {
    id: "4",
    kodePegawai: "PG-004",
    namaLengkap: "Eko Prasetyo",
    tanggungJawab: "Staff Quality Control",
    shiftKerja: "Malam (23:00 - 07:00)",
    jamMasuk: "-",
    jamKeluar: "-",
    keterangan: "Tanpa Keterangan",
  },
]

export default function PresensiPage() {
  const renderShiftBadge = (shift: string) => {
    if (shift.startsWith("Pagi")) {
      return <ColoredBadge color="sky">{shift}</ColoredBadge>
    }
    if (shift.startsWith("Siang")) {
      return <ColoredBadge color="yellow">{shift}</ColoredBadge>
    }
    return <ColoredBadge color="purple">{shift}</ColoredBadge>
  }

  const renderKeteranganBadge = (keterangan: string) => {
    if (keterangan === "Tepat Waktu") {
      return <ColoredBadge color="green">Tepat Waktu</ColoredBadge>
    }
    if (keterangan.startsWith("Terlambat")) {
      return <ColoredBadge color="yellow">{keterangan}</ColoredBadge>
    }
    if (keterangan.startsWith("Izin")) {
      return <ColoredBadge color="purple">{keterangan}</ColoredBadge>
    }
    return <ColoredBadge color="red">Tanpa Keterangan</ColoredBadge>
  }

  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[{ label: "SDM & Kehadiran" }, { label: "Presensi Harian" }]}
            title="Presensi Harian"
            icon={BiUserCheck}
            description="Rekam kehadiran harian petugas via absensi."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black">
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
            <Button variant="default">
              <BiUserCheck className="mr-2" />
              Catat Absensi
            </Button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[50px]">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari NIK, nama, atau nomor HP..."
            className="flex-1"
          />
          <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/80 bg-card px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-foreground/80">
            <span>02 Agu 2026</span>
            <BiCalendar className="size-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="wrapper mt-[25px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Kode Pegawai
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Nama Lengkap
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Tanggung Jawab
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Shift Kerja
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Jam Masuk
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Jam Keluar
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Keterangan Kehadiran
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyData.map((row) => (
              <TableRow
                key={row.id}
                className="h-16 border-b border-border/40 hover:bg-muted/30"
              >
                <TableCell className="pl-6 font-sans text-sm text-foreground">
                  {row.kodePegawai}
                </TableCell>
                <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                  {row.namaLengkap}
                </TableCell>
                <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                  {row.tanggungJawab}
                </TableCell>
                <TableCell className="font-sans text-sm">
                  {renderShiftBadge(row.shiftKerja)}
                </TableCell>
                <TableCell className="text-center font-sans text-sm text-foreground">
                  {row.jamMasuk}
                </TableCell>
                <TableCell className="text-center font-sans text-sm text-foreground">
                  {row.jamKeluar}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  {renderKeteranganBadge(row.keterangan)}
                </TableCell>
                <TableCell className="pr-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1 text-muted-foreground">
                    <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                      <BiChevronRight className="size-4 text-foreground/75" />
                    </button>
                    <button className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted">
                      <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
