import { notFound } from "next/navigation"

import { isDashboardSectionSlug } from "@/lib/dashboard-routes"

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params

  if (!isDashboardSectionSlug(section)) {
    notFound()
  }

  return <div className="flex flex-1" />
}
