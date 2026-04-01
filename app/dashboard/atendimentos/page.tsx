import { redirect } from "next/navigation"

import { appointmentsMyAtendimentosRoute } from "@/lib/dashboard-routes"

export default function AtendimentosIndexPage() {
  redirect(appointmentsMyAtendimentosRoute.href)
}
