import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { BiUser, BiChevronRight, BiDotsVerticalRounded } from "react-icons/bi"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table"

interface UserItem {
  id: string
  nama: string
  email: string
  role: string
  status: "aktif" | "nonaktif"
}

const dummyData: UserItem[] = [
  {
    id: "1",
    nama: "Andi Wijaya",
    email: "andi.wijaya@sabiru.com",
    role: "Warehouse Manager",
    status: "aktif",
  },
  {
    id: "2",
    nama: "Rina Sari",
    email: "rina.sari@sabiru.com",
    role: "Admin Inbound",
    status: "aktif",
  },
  {
    id: "3",
    nama: "Budi Hartono",
    email: "budi.hartono@sabiru.com",
    role: "Admin Outbound",
    status: "aktif",
  },
  {
    id: "4",
    nama: "Hendra Wijaya",
    email: "hendra.wijaya@sabiru.com",
    role: "Warehouse Staff",
    status: "nonaktif",
  },
]

export default function UsersPage() {
  const totalUser = dummyData.length

  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[
              { label: "Pengaturan Sistem" },
              { label: "Pengguna & Hak Akses" },
            ]}
            title="Pengguna & Hak Akses"
            icon={BiUser}
            description="Kelola data pengguna sistem dan hak akses (roles) mereka."
          />
        </div>
      </div>

      <div className="wrapper mt-[35px]">
        <Button variant="default">+ Tambah Pengguna</Button>
      </div>

      <div className="wrapper mt-[15px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Nama
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Email
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Role
              </TableHead>
              <TableHead className="text-center text-xs font-semibold tracking-normal text-foreground normal-case">
                Status
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
                <TableCell className="font-sans text-sm">
                  <span className="cursor-pointer font-medium text-[#3B82F6] transition-colors hover:text-[#2563EB] hover:underline">
                    {row.email}
                  </span>
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground/80">
                  {row.role}
                </TableCell>
                <TableCell className="text-center font-sans text-sm">
                  <span
                    className={`inline-flex items-center rounded-[6px] px-2.5 py-0.5 text-xs font-semibold ${
                      row.status === "aktif"
                        ? "bg-[#E2FBE9] text-[#1E824C]"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {row.status === "aktif" ? "Aktif" : "Nonaktif"}
                  </span>
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
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>Total Pengguna: {totalUser} Pengguna Sistem</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </>
  )
}
