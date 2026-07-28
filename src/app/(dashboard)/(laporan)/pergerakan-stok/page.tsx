import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { BiSolidReport, BiBarChartAlt2 } from "react-icons/bi"

export default function LaporanPage() {
  return (
    <>
      <div className="wrapper flex items-end justify-between">
        <PageHeader
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Pergerakan Stok" },
          ]}
          title="Laporan Pergerakan Stok"
          icon={BiBarChartAlt2}
          description="Laporan arus keluar-masuk stok barang."
        />
        <Button variant="default" className="mt-4">
          <BiSolidReport className="mr-2" />
          Generate Report
        </Button> 
      </div>  
    </>
  )
}
