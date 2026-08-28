import { BasicLayout } from "@/components/layout/basic-layout"

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <BasicLayout>{children}</BasicLayout>
}