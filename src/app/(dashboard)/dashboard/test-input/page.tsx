"use client"

import { Input, InputSearch } from "@/components/input"
import { Opsion } from "@/components/opsion"
import { StatusBadge } from "@/components/badge"

export default function TestInputPage() {
  return (
    <div className="flex max-w-xl flex-col gap-8">
      <h1 className="font-heading text-2xl font-bold">Test Input Components</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Status Badge</h2>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status="disetujui" />
          <StatusBadge status="menunggu_approval" />
          <StatusBadge status="ditolak" />
          <StatusBadge status="draft" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Filter Bar (Search + Opsion)</h2>
        <div className="flex items-center gap-2">
          <InputSearch placeholder="Cari sesuatu..." />
          <Opsion
            options={[
              { value: "all", label: "Semua Gudang" },
              { value: "1", label: "Gudang A" },
              { value: "2", label: "Gudang B" },
            ]}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Opsion Standalone</h2>
        <Opsion
          options={[
            { value: "all", label: "Semua Gudang" },
            { value: "1", label: "Gudang A" },
            { value: "2", label: "Gudang B" },
          ]}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">InputSearch</h2>
        <InputSearch placeholder="Cari sesuatu..." />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Tanpa Label</h2>
        <Input type="text" placeholder="Nama barang" />
        <Input type="textarea" placeholder="Deskripsi" rows={3} />
        <Input type="date" />
        <Input
          type="select"
          options={[
            { value: "1", label: "Elektronik" },
            { value: "2", label: "Furniture" },
            { value: "3", label: "ATK" },
          ]}
          placeholder="Pilih kategori"
        />
        <Input type="search" placeholder="Cari barang..." />
        <Input type="upload" accept="image/*">
          Upload file
        </Input>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Dengan Label (Atas)</h2>
        <Input
          label="Nama Barang"
          type="text"
          required
          placeholder="Nama barang"
        />
        <Input
          label="Deskripsi"
          type="textarea"
          rows={3}
          placeholder="Deskripsi barang"
        />
        <Input label="Tanggal" type="date" />
        <Input
          label="Kategori"
          type="select"
          options={[
            { value: "1", label: "Elektronik" },
            { value: "2", label: "Furniture" },
            { value: "3", label: "ATK" },
          ]}
          placeholder="Pilih kategori"
        />
        <Input label="Cari" type="search" placeholder="Cari barang..." />
        <Input label="File" type="upload" accept="image/*">
          Upload gambar
        </Input>
      </section>
    </div>
  )
}
