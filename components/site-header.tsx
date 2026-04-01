"use client"

import {
  BellRingIcon,
  CircleUserRoundIcon,
  HistoryIcon,
  InfoIcon,
  KanbanSquareIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  ListIcon,
  MegaphoneIcon,
  MessagesSquareIcon,
  MoonIcon,
  SunIcon,
  PhoneIcon,
  ShieldIcon,
  UserPlusIcon,
  UsersIcon,
  WalletCardsIcon,
  type LucideIcon,
} from "lucide-react"
import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"

import {
  administrationRoute,
  announcementsEventsRoute,
  appointmentsRoute,
  createUserRoute,
  dashboardHomeRoute,
  extensionListRoute,
  getDashboardPageTitle,
  groupsRoute,
  helpRoute,
  historyRoute,
  ideasRoute,
  internalChatRoute,
  kanbanRoute,
  loansRoute,
  profileRoute,
} from "@/lib/dashboard-routes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  accessRequestsUpdatedEventName,
  getStoredAccessRequests,
} from "@/lib/signup-access-request"

const headerIconItems: Array<{ href: string; icon: LucideIcon }> = [
  { href: dashboardHomeRoute.href, icon: LayoutDashboardIcon },
  { href: appointmentsRoute.href, icon: ListIcon },
  { href: internalChatRoute.href, icon: MessagesSquareIcon },
  { href: groupsRoute.href, icon: UsersIcon },
  { href: loansRoute.href, icon: WalletCardsIcon },
  { href: announcementsEventsRoute.href, icon: MegaphoneIcon },
  { href: kanbanRoute.href, icon: KanbanSquareIcon },
  { href: historyRoute.href, icon: HistoryIcon },
  { href: ideasRoute.href, icon: LightbulbIcon },
  { href: helpRoute.href, icon: InfoIcon },
  { href: extensionListRoute.href, icon: PhoneIcon },
  { href: createUserRoute.href, icon: UserPlusIcon },
  { href: administrationRoute.href, icon: ShieldIcon },
  { href: profileRoute.href, icon: CircleUserRoundIcon },
]

function matchesRoute(pathname: string, href: string) {
  if (href === dashboardHomeRoute.href) {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function formatRequestedAt(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })
}

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const title = getDashboardPageTitle(pathname)
  const CurrentPageIcon = headerIconItems.find((item) =>
    matchesRoute(pathname, item.href),
  )?.icon
  const [accessRequests, setAccessRequests] = React.useState(() => {
    if (typeof window === "undefined") return []
    return getStoredAccessRequests()
  })

  React.useEffect(() => {
    function sync() {
      setAccessRequests(getStoredAccessRequests())
    }

    sync()
    window.addEventListener(accessRequestsUpdatedEventName, sync)
    window.addEventListener("storage", sync)

    return () => {
      window.removeEventListener(accessRequestsUpdatedEventName, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  function toggleTheme() {
    // next-themes only changes theme when the user explicitly clicks this button.
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 bg-transparent transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="cursor-pointer -ml-1" />
        <div className="h-6 w-px bg-border shrink-0" />
        <div className="flex items-center gap-2">
          {CurrentPageIcon ? <CurrentPageIcon className="size-4 text-muted-foreground" /> : null}
          <h1 className="text-base font-medium">{title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-0 md:gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative inline-flex size-10 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="Abrir notificações"
              >
                <BellRingIcon className="size-[18px]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0">
              <DropdownMenuLabel className="px-4 py-3 text-sm font-semibold text-foreground">
                Notificações
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="flex max-h-80 flex-col overflow-y-auto">
                {accessRequests.slice(0, 6).map((request) => (
                  <div
                    key={request.id}
                    className="border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {request.name}
                        </p>
                        <p className="text-xs leading-5 text-muted-foreground">
                          {request.email}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                        {formatRequestedAt(request.requestedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <DropdownMenuSeparator />
              <div className="p-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  onClick={() => router.push(historyRoute.href)}
                >
                  Visualizar todas
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            className="relative inline-flex size-10 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="Alternar tema (claro/escuro)"
            onClick={toggleTheme}
          >
            {isMounted ? (
              isDark ? (
                <SunIcon className="size-[18px]" />
              ) : (
                <MoonIcon className="size-[18px]" />
              )
            ) : null}
          </button>
        </div>
      </div>
    </header>
  )
}
