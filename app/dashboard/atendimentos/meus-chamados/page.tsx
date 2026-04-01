import { AppointmentsTasksPage } from "@/components/appointments-tasks-page"

export default function MeusChamadosPage() {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <AppointmentsTasksPage
        showCreateAtendimentoButton
        meusChamadosPage
      />
    </div>
  )
}
