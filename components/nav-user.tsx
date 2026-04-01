"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { logoutRoute, profileRoute } from "@/lib/dashboard-routes"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { CircleUserRoundIcon, EllipsisVerticalIcon, LogOutIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const router = useRouter()
  const { isMobile, state } = useSidebar()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  return (
    <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className={cn(
                  "cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                  state === "collapsed" && "size-10 justify-center p-0",
                )}
              >
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "grid flex-1 text-left text-sm leading-tight",
                    state === "collapsed" && "hidden",
                  )}
                >
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <EllipsisVerticalIcon
                  className={cn("ml-auto size-4", state === "collapsed" && "hidden")}
                />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => router.push(profileRoute.href)}
              >
                <CircleUserRoundIcon />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/70" />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer font-medium"
                onSelect={() => setIsLogoutDialogOpen(true)}
              >
                <LogOutIcon />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <DialogContent
        size="sm"
        onEscapeKeyDown={() => setIsLogoutDialogOpen(false)}
        showCloseButton={false}
        className="rounded-2xl"
        overlayProps={{ onClick: () => setIsLogoutDialogOpen(false) }}
      >
        <DialogHeader className="p-5 pb-3">
          <DialogTitle>Confirmar saída</DialogTitle>
          <DialogDescription className="text-sm">
            Tem certeza que deseja sair da conta?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex items-center justify-end gap-3 px-5 py-3">
          <DialogClose asChild>
            <Button variant="outline" size="default" className="cursor-pointer w-20 justify-center">
              Cancelar
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              size="default"
              className="cursor-pointer w-20 justify-center"
              onClick={() => router.push(logoutRoute)}
            >
              Sair
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
