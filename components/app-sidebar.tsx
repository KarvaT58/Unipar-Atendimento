"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import {
  administrationRoute,
  announcementsEventsRoute,
  appointmentsMyAtendimentosRoute,
  appointmentsRoute,
  appointmentsSubRoutes,
  createUserRoute,
  dashboardHomeRoute,
  groupsRoute,
  helpRoute,
  ideasRoute,
  internalChatRoute,
  kanbanRoute,
  loansRoute,
  extensionListRoute,
  reportsRoute,
} from "@/lib/dashboard-routes"
import {
  defaultStoredProfile,
  normalizeStoredProfile,
  profileStorageKey,
  profileUpdatedEventName,
  toNavUser,
} from "@/lib/profile-storage"
import { useCreateAtendimento } from "@/components/create-atendimento-provider"
import { NavUser } from "@/components/nav-user"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  BarChart2Icon,
  ChevronRightIcon,
  CirclePlusIcon,
  InfoIcon,
  KanbanSquareIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  ListIcon,
  MailIcon,
  MegaphoneIcon,
  MessagesSquareIcon,
  PhoneIcon,
  ShieldIcon,
  UserPlusIcon,
  UsersIcon,
  WalletCardsIcon,
  type LucideIcon,
} from "lucide-react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"

type SidebarItem = {
  title: string
  url: string
  icon: LucideIcon
}

const primaryItems: SidebarItem[] = [
  {
    title: dashboardHomeRoute.title,
    url: dashboardHomeRoute.href,
    icon: LayoutDashboardIcon,
  },
  {
    title: internalChatRoute.title,
    url: internalChatRoute.href,
    icon: MessagesSquareIcon,
  },
  {
    title: groupsRoute.title,
    url: groupsRoute.href,
    icon: UsersIcon,
  },
]

const secondaryItems: SidebarItem[] = [
  {
    title: loansRoute.title,
    url: loansRoute.href,
    icon: WalletCardsIcon,
  },
  {
    title: announcementsEventsRoute.title,
    url: announcementsEventsRoute.href,
    icon: MegaphoneIcon,
  },
  {
    title: kanbanRoute.title,
    url: kanbanRoute.href,
    icon: KanbanSquareIcon,
  },
  {
    title: reportsRoute.title,
    url: reportsRoute.href,
    icon: BarChart2Icon,
  },
]

const adminItems: SidebarItem[] = [
  {
    title: ideasRoute.title,
    url: ideasRoute.href,
    icon: LightbulbIcon,
  },
  {
    title: helpRoute.title,
    url: helpRoute.href,
    icon: InfoIcon,
  },
  {
    title: extensionListRoute.title,
    url: extensionListRoute.href,
    icon: PhoneIcon,
  },
]

const managementItems: SidebarItem[] = [
  {
    title: administrationRoute.title,
    url: administrationRoute.href,
    icon: ShieldIcon,
  },
]

const defaultUser = toNavUser(defaultStoredProfile)

function isItemActive(pathname: string, url: string) {
  if (url === dashboardHomeRoute.href) {
    return pathname === url
  }

  return pathname === url || pathname.startsWith(`${url}/`)
}

function SidebarAtendimentosNav({ pathname }: { pathname: string }) {
  const { state, isMobile } = useSidebar()
  const collapsed = state === "collapsed" && !isMobile
  const branchActive = pathname.startsWith(appointmentsRoute.href)

  const [menuOpen, setMenuOpen] = React.useState(branchActive)
  React.useEffect(() => {
    if (branchActive) {
      setMenuOpen(true)
    }
  }, [branchActive])

  if (collapsed) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip={appointmentsRoute.title}
          size="sm"
          isActive={branchActive}
          className={`${sidebarNavButtonActiveClass} cursor-pointer`}
        >
          <Link href={appointmentsMyAtendimentosRoute.href}>
            <div className="relative">
              <ListIcon />
            </div>
            <span className="group-data-[collapsible=icon]:hidden">
              {appointmentsRoute.title}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <CollapsiblePrimitive.Root
        open={menuOpen}
        onOpenChange={setMenuOpen}
        className="group/collapsible w-full min-w-0"
      >
        <CollapsiblePrimitive.Trigger asChild>
          <SidebarMenuButton
            tooltip={appointmentsRoute.title}
            type="button"
            size="sm"
            isActive={branchActive}
            className={`${sidebarNavButtonActiveClass} cursor-pointer`}
          >
            <div className="relative">
              <ListIcon />
            </div>
            <span className="group-data-[collapsible=icon]:hidden">
              {appointmentsRoute.title}
            </span>
            <ChevronRightIcon className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsiblePrimitive.Trigger>
        <CollapsiblePrimitive.Content>
          <SidebarMenuSub>
            {appointmentsSubRoutes.map((sub) => (
              <SidebarMenuSubItem key={sub.href}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isItemActive(pathname, sub.href)}
                >
                  <Link href={sub.href}>
                    <span>{sub.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsiblePrimitive.Content>
      </CollapsiblePrimitive.Root>
    </SidebarMenuItem>
  )
}

const sidebarNavButtonActiveClass =
  "relative h-8 rounded-lg px-2.5 text-[13px] transition-all duration-200 data-[active=true]:bg-transparent data-[active=true]:font-semibold data-[active=true]:text-sidebar-foreground data-[active=true]:shadow-none data-[active=true]:before:absolute data-[active=true]:before:top-1/2 data-[active=true]:before:left-1 data-[active=true]:before:h-4 data-[active=true]:before:w-0.5 data-[active=true]:before:-translate-y-1/2 data-[active=true]:before:rounded-full data-[active=true]:before:bg-red-500 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:data-[active=true]:before:left-0.5 group-data-[collapsible=icon]:data-[active=true]:before:h-5 group-data-[collapsible=icon]:data-[active=true]:before:w-0.5"

function SidebarNavItem({
  item,
  pathname,
}: {
  item: SidebarItem
  pathname: string
}) {
  const active = isItemActive(pathname, item.url)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={item.title}
        size="sm"
        isActive={active}
        className={sidebarNavButtonActiveClass}
      >
        <Link href={item.url}>
          <div className="relative">
            <item.icon />
          </div>
          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { openCreateAtendimento } = useCreateAtendimento()
  const [user, setUser] = React.useState(defaultUser)

  React.useEffect(() => {
    function syncStoredProfile() {
      if (typeof window === "undefined") {
        return
      }

      try {
        const storedProfile = window.localStorage.getItem(profileStorageKey)

        if (!storedProfile) {
          setUser(defaultUser)
          return
        }

        setUser(toNavUser(normalizeStoredProfile(JSON.parse(storedProfile))))
      } catch {
        setUser(defaultUser)
      }
    }

    syncStoredProfile()
    window.addEventListener(profileUpdatedEventName, syncStoredProfile)
    window.addEventListener("storage", syncStoredProfile)

    return () => {
      window.removeEventListener(profileUpdatedEventName, syncStoredProfile)
      window.removeEventListener("storage", syncStoredProfile)
    }
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="rounded-xl px-3 data-[slot=sidebar-menu-button]:p-2! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <Link href={dashboardHomeRoute.href}>
                <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md group-data-[collapsible=icon]:size-7">
                  <Image
                    src="/logo.png"
                    alt="Logo da Unipar"
                    width={40}
                    height={40}
                    className="size-full scale-125 object-contain"
                  />
                </div>
                <span className="text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                  Unipar
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  type="button"
                  tooltip="Criar Atendimento"
                  size="sm"
                  onClick={openCreateAtendimento}
                  className="min-w-8 cursor-pointer rounded-lg bg-zinc-950 text-white duration-200 ease-linear hover:bg-zinc-900 hover:text-white active:bg-zinc-900 active:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:hover:text-neutral-900 dark:active:bg-neutral-200 dark:active:text-neutral-900"
                >
                  <CirclePlusIcon className="text-red-500" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Criar Atendimento
                  </span>
                </SidebarMenuButton>
                <Button
                  size="icon"
                  className="size-8 group-data-[collapsible=icon]:hidden"
                  variant="outline"
                >
                  <MailIcon />
                  <span className="sr-only">Inbox</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu className="gap-1">
              <SidebarNavItem
                item={primaryItems[0]!}
                pathname={pathname}
              />
              <SidebarAtendimentosNav pathname={pathname} />
              {primaryItems.slice(1).map((item) => (
                <SidebarNavItem key={item.title} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="my-auto">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {secondaryItems.map((item) => (
                <SidebarNavItem key={item.title} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-1">
            <SidebarMenu className="gap-1">
              {adminItems.map((item) => (
                <SidebarNavItem key={item.title} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
            <Separator className="my-1 bg-red-500/80 group-data-[collapsible=icon]:hidden" />
            <SidebarMenu className="gap-1">
              {managementItems.map((item) => (
                <SidebarNavItem
                  key={item.title}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </SidebarMenu>
            <Separator className="mt-1 bg-red-500/80 group-data-[collapsible=icon]:hidden" />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
