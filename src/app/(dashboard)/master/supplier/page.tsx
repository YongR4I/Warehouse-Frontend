"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  BiUser,
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
  TableFooter,
} from "@/components/ui/table"
import { SupplierForm } from "@/components/partner/supplier-form"
import { CustomerForm } from "@/components/partner/customer-form"

interface SupplierItem {
  kode: string
  namaPerusahaan: string
  namaPic: string
  nomorTelepon: string
  email: string
  alamat: string
}

interface CustomerItem {
  kode: string
  namaCustomer: string
  namaPic: string
  nomorTelepon: string
  email: string
  alamatPengiriman: string
}

const supplierData: SupplierItem[] = [
  {
    kode: "SUP-001",
    namaPerusahaan: "PT Semen Nusantara",
    namaPic: "Bambang Setyono",
    nomorTelepon: "0812-8899-1001",
    email: "sales@semennusantara.co.id",
    alamat: "Jl. Raya Industri No. 45, Jakarta South",
  },
  {
    kode: "SUP-002",
    namaPerusahaan: "CV Kayu Lestari",
    namaPic: "Dewi Lestari",
    nomorTelepon: "0813-7711-2233",
    email: "info@kayulestari.com",
    alamat: "Jl. Veteran No. 12, Jepara",
  },
  {
    kode: "SUP-003",
    namaPerusahaan: "PT Baja Perkasa",
    namaPic: "Agus Susanto",
    nomorTelepon: "0856-4433-2211",
    email: "baja.perkasa@gmail.com",
    alamat: "Kawasan Industri Cilegon Banten",
  },
]

const customerData: CustomerItem[] = [
  {
    kode: "CUST-001",
    namaCustomer: "PT Wijaya Kontraktor",
    namaPic: "Hendra Wijaya",
    nomorTelepon: "0815-0909-3080",
    email: "logistik@wijayakontraktor.com",
    alamatPengiriman: "Jl. Margonda Raya No. 102, Depok",
  },
  {
    kode: "CUST-002",
    namaCustomer: "Toko Bangunan Maju Jaya",
    namaPic: "Siti Aminah",
    nomorTelepon: "0878-1122-3344",
    email: "majujaya.tb@yahoo.com",
    alamatPengiriman: "Jl. Ahmad Yani No. 88, Bekasi",
  },
  {
    kode: "CUST-003",
    namaCustomer: "Dinas Pekerjaan Umum",
    namaPic: "Rahmat Hidayat",
    nomorTelepon: "0811-9988-7788",
    email: "pengadaan@pu.go.id",
    alamatPengiriman: "Gedung Kebayoran Baru, Jakarta",
  },
]

export default function SupplierPage() {
  const [supplierDrawerOpen, setSupplierDrawerOpen] = useState(false)
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false)

  const totalSupplier = supplierData.length
  const totalCustomer = customerData.length

  return (
    <>
      <div className="wrapper">
        <div className="flex items-end justify-between">
          <PageHeader
            items={[{ label: "Data Master" }, { label: "Supplier & Customer" }]}
            title="Supplier & Customer"
            icon={BiUser}
            description="Kelola data pemasok dan pelanggan."
          />
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline-black">
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[35px]">
        <Button variant="default" onClick={() => setSupplierDrawerOpen(true)}>
          + Tambah Supplier
        </Button>
      </div>

      <div className="wrapper mt-[15px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Kode
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Nama Perusahaan
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Nama PIC
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Nomor Telepon
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Email
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Alamat
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supplierData.map((row) => (
              <TableRow
                key={row.kode}
                className="h-16 border-b border-border/40 hover:bg-muted/30"
              >
                <TableCell className="pl-6 font-sans text-sm text-foreground">
                  {row.kode}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.namaPerusahaan}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.namaPic}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.nomorTelepon}
                </TableCell>
                <TableCell className="font-sans text-sm">
                  <span className="cursor-pointer font-medium text-[#3B82F6] transition-colors hover:text-[#2563EB] hover:underline">
                    {row.email}
                  </span>
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground/80">
                  {row.alamat}
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
              <TableCell colSpan={7} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Total Pemasok: {totalSupplier} Perusahaan Pemasok / Supplier
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="wrapper mt-[40px]">
        <Button variant="default" onClick={() => setCustomerDrawerOpen(true)}>
          + Tambah Customer
        </Button>
      </div>

      <div className="wrapper mt-[15px]">
        <Table>
          <TableHeader className="border-b border-border/60 bg-white">
            <TableRow className="h-14 hover:bg-transparent">
              <TableHead className="pl-6 text-xs font-semibold tracking-normal text-foreground normal-case">
                Kode
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Nama Customer
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Nama PIC
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Nomor Telepon
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Email
              </TableHead>
              <TableHead className="text-xs font-semibold tracking-normal text-foreground normal-case">
                Alamat Pengiriman
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold tracking-normal text-foreground normal-case">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customerData.map((row) => (
              <TableRow
                key={row.kode}
                className="h-16 border-b border-border/40 hover:bg-muted/30"
              >
                <TableCell className="pl-6 font-sans text-sm text-foreground">
                  {row.kode}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.namaCustomer}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.namaPic}
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground">
                  {row.nomorTelepon}
                </TableCell>
                <TableCell className="font-sans text-sm">
                  <span className="cursor-pointer font-medium text-[#3B82F6] transition-colors hover:text-[#2563EB] hover:underline">
                    {row.email}
                  </span>
                </TableCell>
                <TableCell className="font-sans text-sm text-foreground/80">
                  {row.alamatPengiriman}
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
              <TableCell colSpan={7} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Total Pelanggan: {totalCustomer} Data Pelanggan / Customer
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <SupplierForm open={supplierDrawerOpen} onOpenChange={setSupplierDrawerOpen} />
      <CustomerForm open={customerDrawerOpen} onOpenChange={setCustomerDrawerOpen} />
    </>
  )
}
