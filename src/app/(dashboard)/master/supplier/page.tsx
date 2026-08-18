"use client"

import { ExportModal } from "@/components/export-modal"
import { useState, useDeferredValue } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { InputSearch } from "@/components/input"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/api"
import { useApiList, useApiDelete } from "@/hooks/use-api"
import type { Supplier, Customer } from "@/types"
import {
  BiUser,
  BiDotsVerticalRounded,
  BiSolidReport,
  BiEditAlt,
  BiTrash,
} from "react-icons/bi"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table"
import { ColoredBadge } from "@/components/ui/colored-badge"
import { SupplierForm } from "@/components/partner/supplier-form"
import { CustomerForm } from "@/components/partner/customer-form"

const PER_PAGE = 15

export default function SupplierPage() {
  const [exportOpen, setExportOpen] = useState(false)
  const [supplierDrawerOpen, setSupplierDrawerOpen] = useState(false)
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [supplierPage, setSupplierPage] = useState(1)
  const [customerPage, setCustomerPage] = useState(1)

  const { data: supplierData, isLoading: supplierLoading } = useApiList<Supplier>({
    key: "supplier",
    url: "/supplier",
    params: { page: supplierPage, per_page: PER_PAGE, search: deferredSearch || undefined },
  })
  const { data: customerData, isLoading: customerLoading } = useApiList<Customer>({
    key: "customer",
    url: "/customer",
    params: { page: customerPage, per_page: PER_PAGE, search: deferredSearch || undefined },
  })

  const deleteSupplier = useApiDelete("supplier", "/supplier")
  const deleteCustomer = useApiDelete("customer", "/customer")

  const suppliers = supplierData?.data ?? []
  const supplierMeta = supplierData?.meta
  const customers = customerData?.data ?? []
  const customerMeta = customerData?.meta

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (!window.confirm(`Yakin ingin menghapus supplier "${supplier.nama}"?`)) return
    try {
      const response = await deleteSupplier.mutateAsync(supplier.id)
      toast.success(response.message)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!window.confirm(`Yakin ingin menghapus customer "${customer.nama}"?`)) return
    try {
      const response = await deleteCustomer.mutateAsync(customer.id)
      toast.success(response.message)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const renderPagination = (
    currentPage: number,
    lastPage: number,
    onPageChange: (page: number) => void
  ) => {
    if (lastPage <= 1) return null
    const buttons = []
    for (let i = 1; i <= lastPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 font-medium transition-colors last:border-r-0 ${
            currentPage === i
              ? "bg-muted/60 text-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {i}
        </button>
      )
    }
    return (
      <div className="flex items-center">
        <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-background">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-8 w-8 cursor-pointer items-center justify-center border-r border-border/80 text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            &lt;
          </button>
          {buttons}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= lastPage}
            className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            &gt;
          </button>
        </div>
      </div>
    )
  }

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
            <Button variant="outline-black" onClick={() => setExportOpen(true)}>
              <BiSolidReport className="mr-2" />
              Export Excel/Pdf
            </Button>
          </div>
        </div>
      </div>

      <div className="wrapper mt-[35px]">
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={() => setSupplierDrawerOpen(true)}>
            + Tambah Supplier
          </Button>
          <InputSearch
            placeholder="Cari nama atau kode supplier / customer..."
            className="flex-1"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSupplierPage(1)
              setCustomerPage(1)
            }}
          />
        </div>
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
            {supplierLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-16 border-b border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-sans text-sm text-foreground">
                    {row.kode}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{row.nama}</span>
                      {row.tipe && (
                        <ColoredBadge color="gray">{row.tipe}</ColoredBadge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.kontak ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.telepon ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm">
                    {row.email ? (
                      <span className="cursor-pointer font-medium text-[#3B82F6] transition-colors hover:text-[#2563EB] hover:underline">
                        {row.email}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground/80">
                    {row.alamat ?? "-"}
                  </TableCell>
                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted outline-none">
                          <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Aksi Supplier</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSupplier(row)
                              setSupplierDrawerOpen(true)
                            }}
                          >
                            <BiEditAlt />
                            <span>Ubah Data</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteSupplier(row)}
                          >
                            <BiTrash />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between gap-4 bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Total Pemasok: {supplierMeta?.total ?? 0} Perusahaan Pemasok / Supplier
                  </span>
                  {renderPagination(supplierPage, supplierMeta?.last_page ?? 1, setSupplierPage)}
                  <span>{PER_PAGE} per halaman</span>
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
            {customerLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              customers.map((row) => (
                <TableRow
                  key={row.id}
                  className="h-16 border-b border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-sans text-sm text-foreground">
                    {row.kode}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{row.nama}</span>
                      {row.tipe && (
                        <ColoredBadge color="gray">{row.tipe}</ColoredBadge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.kontak ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground">
                    {row.telepon ?? "-"}
                  </TableCell>
                  <TableCell className="font-sans text-sm">
                    {row.email ? (
                      <span className="cursor-pointer font-medium text-[#3B82F6] transition-colors hover:text-[#2563EB] hover:underline">
                        {row.email}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="font-sans text-sm text-foreground/80">
                    {row.alamat ?? "-"}
                  </TableCell>
                  <TableCell className="pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 transition-colors hover:bg-muted outline-none">
                          <BiDotsVerticalRounded className="size-4 text-foreground/75" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Aksi Customer</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCustomer(row)
                              setCustomerDrawerOpen(true)
                            }}
                          >
                            <BiEditAlt />
                            <span>Ubah Data</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteCustomer(row)}
                          >
                            <BiTrash />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter className="border-t border-border/50 bg-white">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="p-0 align-middle">
                <div className="flex h-14 items-center justify-between gap-4 bg-white px-6 font-sans text-xs text-muted-foreground">
                  <span>
                    Total Pelanggan: {customerMeta?.total ?? 0} Data Pelanggan / Customer
                  </span>
                  {renderPagination(customerPage, customerMeta?.last_page ?? 1, setCustomerPage)}
                  <span>{PER_PAGE} per halaman</span>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <SupplierForm
        open={supplierDrawerOpen}
        onOpenChange={(open) => {
          setSupplierDrawerOpen(open)
          if (!open) setSelectedSupplier(null)
        }}
        initialData={selectedSupplier}
      />
      <CustomerForm
        open={customerDrawerOpen}
        onOpenChange={(open) => {
          setCustomerDrawerOpen(open)
          if (!open) setSelectedCustomer(null)
        }}
        initialData={selectedCustomer}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Ekspor Daftar Supplier"
        totalItemsCount={supplierMeta?.total ?? 0}
        totalItemsLabel="Total Supplier"
        filterLabel="Filter Aktif"
        checkboxes={[
          {
            id: "nama",
            label: "Nama Supplier",
            defaultChecked: true,
          },
          {
            id: "kontak",
            label: "No. Telp / Email",
            defaultChecked: true,
          },
          {
            id: "alamat",
            label: "Alamat Perusahaan",
            defaultChecked: true,
          },
        ]}
      />
    </>
  )
}