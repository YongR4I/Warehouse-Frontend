"use client"

import { Input } from "@/components/input"

export default function TestInputPage() {
  return (
    <div className="flex flex-col gap-8 p-6 max-w-xl">
      <h1 className="text-2xl font-bold font-heading">Test Input Components</h1>

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
        <Input label="Nama Barang" type="text" required placeholder="Nama barang" />
        <Input label="Deskripsi" type="textarea" rows={3} placeholder="Deskripsi barang" />
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
