import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  BiCalendar,
  BiChevronRight,
  BiDotsVerticalRounded,
  BiSolidReport,
  } from "react-icons/bi"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

interface ShiftSchedule {
  id: string
  nama: string
  tanggungJawab: string
  jadwal: {
    sen: string
    sel: string
    rab: string
    kam: string
    jum: string
    sab: string
    min: string
  }
}

const dummyData: ShiftSchedule[] = [
  {
    id: "1",
    nama: "Ahmad Fauzi",
    tanggungJawab: "Operator Forklift",
    jadwal: {
      sen: "Shift 1",
      sel: "Shift 1",
      rab: "Shift 1",
      kam: "Shift 1",
      jum: "Shift 1",
      sab: "OFF",
      min: "OFF",
    },
  },
  {
    id: "2",
    nama: "Budi Santoso",
    tanggungJawab: "Admin Inbound",
    jadwal: {
      sen: "Shift 2",
      sel: "Shift 2",
      rab: "Shift 2",
      kam: "Shift 2",
      jum: "OFF",
      sab: "Shift 2",
      min: "OFF",
    },
  },
  {
    id: "3",
    nama: "Dedi Kurniawan",
    tanggungJawab: "Packer Outbound",
    jadwal: {
      sen: "Shift 3",
      sel: "Shift 3",
      rab: "Shift 3",
      kam: "OFF",
      jum: "Shift 3",
      sab: "Shift 3",
      min: "OFF",
    },
  },
  {
    id: "4",
    nama: "Eko Prasetyo",
    tanggungJawab: "Staff Quality Control",
    jadwal: {
      sen: "Shift 1",
      sel: "Shift 1",
      rab: "OFF",
      kam: "Shift 1",
      jum: "Shift 1",
      sab: "Shift 1",
      min: "OFF",
    },
  },
]

export default function JadwalShiftPage() {
  const renderShiftBadge = (shift: string) => {
    if (shift === "Shift 1") {
      return (
        <span className="inline-flex min-w-[55px] items-center justify-center rounded-[6px] bg-[#E0F2FE] px-2.5 py-1 text-[11px] font-semibold text-[#0284C7]">
          Shift 1
        </span>
      )
    }
    if (shift === "Shift 2") {
      return (
        <span className="inline-flex min-w-[55px] items-center justify-center rounded-[6px] bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-semibold text-[#D97706]">
          Shift 2
        </span>
      )
    }
    if (shift === "Shift 3") {
      return (
        <span className="inline-flex min-w-[55px] items-center justify-center rounded-[6px] bg-[#F3E8FF] px-2.5 py-1 text-[11px] font-semibold text-[#9333EA]">
          Shift 3
        </span>
      )
    }
    return (
      <span className="inline-flex min-w-[55px] items-center justify-center rounded-[6px] bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-medium text-[#6B7280]">
        OFF
      </span>
    )
  }

  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[{ label: "SDM & Kehadiran" }, { label: "Jadwal Shift" }]}
            title="Jadwal Shift"
            icon={BiCalendar}
            description="Atur dan pantau pembagian jam kerja harian petugas operasional gudang."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black">
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
            <Button variant="default">
              <BiCalendar className="mr-2" />
              Atur Shift
            </Button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[35px]">
        <div className="flex w-fit items-center gap-1 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-semibold text-foreground/80 select-none">
          <button className="cursor-pointer pr-1 hover:text-foreground">
            &lt;
          </button>
          <span>27 Jul - 02 Agu 2026</span>
          <button className="cursor-pointer pl-1 hover:text-foreground">
            &gt;
          </button>
        </div>
      </div>

      <div className="wrapper mt-[25px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Nama Petugas
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Tanggung Jawab
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Sen (27)
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Sel (28)
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Rab (29)
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Kam (30)
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Jum (31)
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Sab (01)
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Min (02)
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
                  {row.nama}
                </TableCell>
                <TableCell className="font-sans text-sm whitespace-nowrap text-foreground">
                  <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-muted-foreground">
                    {row.tanggungJawab}
                  </span>
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  {renderShiftBadge(row.jadwal.sen)}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  {renderShiftBadge(row.jadwal.sel)}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  {renderShiftBadge(row.jadwal.rab)}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  {renderShiftBadge(row.jadwal.kam)}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  {renderShiftBadge(row.jadwal.jum)}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  {renderShiftBadge(row.jadwal.sab)}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  {renderShiftBadge(row.jadwal.min)}
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
