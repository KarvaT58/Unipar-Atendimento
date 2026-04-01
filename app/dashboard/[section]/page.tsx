import { notFound } from "next/navigation"

import { AppointmentsTasksPage } from "@/components/appointments-tasks-page"
import { appointmentsRoute, isDashboardSectionSlug } from "@/lib/dashboard-routes"

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params

  if (!isDashboardSectionSlug(section)) {
    notFound()
  }

  if (section === appointmentsRoute.slug) {
    return (
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
        <AppointmentsTasksPage />
      </div>
    )
  }

  return <div className="flex flex-1" />
}
