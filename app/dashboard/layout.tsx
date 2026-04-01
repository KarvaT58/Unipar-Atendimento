import { AppSidebar } from "@/components/app-sidebar"
import { AtendimentoTaskProvider } from "@/components/atendimento-task-provider"
import { CreateAtendimentoProvider } from "@/components/create-atendimento-provider"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider
      className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500 h-svh max-h-svh min-h-0 overflow-hidden"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <CreateAtendimentoProvider>
        <AtendimentoTaskProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          {/* Divisória do cabeçalho das abas/seções do dashboard */}
          <div className="h-px w-full bg-border" />
          <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
            {children}
          </div>
        </SidebarInset>
        </AtendimentoTaskProvider>
      </CreateAtendimentoProvider>
    </SidebarProvider>
  )
}
