export type DashboardRouteItem = {
  title: string
  href: string
  slug?: string
}

export const dashboardHomeRoute = {
  title: "Dashboard",
  href: "/dashboard",
} as const satisfies DashboardRouteItem

export const appointmentsRoute = {
  title: "Atendimentos",
  href: "/dashboard/atendimentos",
  slug: "atendimentos",
} as const satisfies DashboardRouteItem

export const announcementsEventsRoute = {
  title: "Anuncios/Eventos",
  href: "/dashboard/anuncios-eventos",
  slug: "anuncios-eventos",
} as const satisfies DashboardRouteItem

export const internalChatRoute = {
  title: "Chat interno",
  href: "/dashboard/chat-interno",
  slug: "chat-interno",
} as const satisfies DashboardRouteItem

export const groupsRoute = {
  title: "Grupos",
  href: "/dashboard/grupos",
  slug: "grupos",
} as const satisfies DashboardRouteItem

export const kanbanRoute = {
  title: "Kanban",
  href: "/dashboard/kanban",
  slug: "kanban",
} as const satisfies DashboardRouteItem

export const historyRoute = {
  title: "Historicos",
  href: "/dashboard/historicos",
  slug: "historicos",
} as const satisfies DashboardRouteItem

export const loansRoute = {
  title: "Emprestimos",
  href: "/dashboard/emprestimos",
  slug: "emprestimos",
} as const satisfies DashboardRouteItem

export const ideasRoute = {
  title: "Ideias",
  href: "/dashboard/ideias",
  slug: "ideias",
} as const satisfies DashboardRouteItem

export const helpRoute = {
  title: "Ajuda",
  href: "/dashboard/ajuda",
  slug: "ajuda",
} as const satisfies DashboardRouteItem

export const extensionListRoute = {
  title: "Lista de ramais",
  href: "/dashboard/lista-de-ramais",
  slug: "lista-de-ramais",
} as const satisfies DashboardRouteItem

export const createUserRoute = {
  title: "Criar usuario",
  href: "/dashboard/criar-usuario",
  slug: "criar-usuario",
} as const satisfies DashboardRouteItem

export const administrationRoute = {
  title: "Administracao",
  href: "/dashboard/administracao",
  slug: "administracao",
} as const satisfies DashboardRouteItem

export const profileRoute = {
  title: "Perfil",
  href: "/dashboard/perfil",
  slug: "perfil",
} as const satisfies DashboardRouteItem

export const logoutRoute = "/login"

export const dashboardMainRoutes = [
  dashboardHomeRoute,
  appointmentsRoute,
  internalChatRoute,
  loansRoute,
  announcementsEventsRoute,
  groupsRoute,
  kanbanRoute,
  historyRoute,
] as const

export const dashboardAdminRoutes = [
  ideasRoute,
  helpRoute,
  extensionListRoute,
  createUserRoute,
  administrationRoute,
] as const

export const dashboardSectionRoutes = [
  appointmentsRoute,
  internalChatRoute,
  loansRoute,
  announcementsEventsRoute,
  groupsRoute,
  kanbanRoute,
  historyRoute,
  ideasRoute,
  helpRoute,
  extensionListRoute,
  createUserRoute,
  administrationRoute,
  profileRoute,
] as const

const dashboardPageTitleMap = new Map<string, string>(
  [...dashboardMainRoutes, ...dashboardAdminRoutes, profileRoute].map((route) => [
    route.href,
    route.title,
  ])
)

export function getDashboardPageTitle(pathname: string) {
  return dashboardPageTitleMap.get(pathname) ?? dashboardHomeRoute.title
}

export function isDashboardSectionSlug(slug: string) {
  return dashboardSectionRoutes.some((route) => route.slug === slug)
}
