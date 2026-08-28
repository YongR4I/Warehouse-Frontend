"use client"

import { useState } from "react"
import { Input, InputSearch } from "@/components/input"
import { FormUpload } from "@/components/forms"
import { Opsion } from "@/components/opsion"
import { ColoredBadge } from "@/components/ui/colored-badge"

export default function TestInputPage() {
  const [singleImage, setSingleImage] = useState<File[]>([])
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    "/LoginImage.webp"
  )
  const [multiDocs, setMultiDocs] = useState<File[]>([])

  return (
    <div className="flex max-w-xl flex-col gap-8 pb-12">
      <h1 className="font-heading text-2xl font-bold">Test Input Components</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Status Badge</h2>
        <div className="flex flex-wrap items-center gap-3">
          <ColoredBadge color="green">Disetujui</ColoredBadge>
          <ColoredBadge color="yellow">Menunggu Approval</ColoredBadge>
          <ColoredBadge color="red">Ditolak</ColoredBadge>
          <ColoredBadge color="gray">Draft</ColoredBadge>
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
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Image Upload Form Components</h2>

        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6">
          {/* 1. Single Image Upload with Instant Preview */}
          <FormUpload
            label="Upload Foto Baru (Single Image Preview)"
            accept="image/*"
            value={singleImage}
            onChange={(files) => setSingleImage(files)}
            onRemove={() => setSingleImage([])}
            helperText="Pilih atau seret gambar (JPG, PNG, WEBP hingga 10MB)"
          >
            Pilih Foto Produk
          </FormUpload>

          {/* 2. Image Upload with Existing URL */}
          <FormUpload
            label="Edit Foto Produk (Existing URL Preview)"
            accept="image/*"
            initialUrl={existingImageUrl}
            onRemove={() => setExistingImageUrl(null)}
            onChange={(files) => {
              setSingleImage(files)
              setExistingImageUrl(null)
            }}
          >
            Ganti Foto Produk
          </FormUpload>

          {/* 3. Multi-file Document Upload */}
          <FormUpload
            label="Upload Dokumen / Lampiran (Multi-file Cards)"
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            multiple
            value={multiDocs}
            onChange={(files) => setMultiDocs(files)}
            onRemove={(idx) =>
              setMultiDocs((prev) => prev.filter((_, i) => i !== idx))
            }
            helperText="PDF, DOCX, atau Gambar hingga 10MB"
          >
            Upload Dokumen Pendukung
          </FormUpload>
        </div>
      </section>
    </div>
  )
}