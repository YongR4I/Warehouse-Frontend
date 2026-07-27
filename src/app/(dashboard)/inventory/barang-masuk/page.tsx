import { PageHeader } from "@/components/page-header"
import { BiPackage } from "react-icons/bi"

export default function BarangMasukPage() {
  return (
    <div className="p-6">
      <PageHeader
        items={[
          { label: "Transaksi" },
          { label: "Terima Barang (in)" }
        ]}
        title="Terima Barang (in)"
        icon={BiPackage}
        description="Catat penerimaan stok barang masuk ke gudang."
      />
    </div>
  )
}