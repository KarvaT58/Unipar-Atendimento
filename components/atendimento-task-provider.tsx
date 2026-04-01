"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import type { AtendimentoChatSource } from "@/lib/atendimento-constants"
import { ATENDIMENTO_CURRENT_USER_ID } from "@/lib/atendimento-users"

export type AtendimentoTaskOverride = {
  claimedByUserId?: string | null
  status?:
    | "In Progress"
    | "Backlog"
    | "Todo"
    | "Canceled"
    | "Done"
}

type AtendimentoTaskContextValue = {
  overrides: Record<string, AtendimentoTaskOverride>
  deletedIds: ReadonlySet<string>
  openChat: (taskId: string, source: AtendimentoChatSource) => void
  closeChat: () => void
  activeChatTaskId: string | null
  chatSource: AtendimentoChatSource | null
  claimTask: (taskId: string) => void
  encerrarTask: (taskId: string) => void
  apagarTask: (taskId: string) => void
}

const AtendimentoTaskContext =
  React.createContext<AtendimentoTaskContextValue | null>(null)

export function AtendimentoTaskProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const pathnameRef = React.useRef(pathname)

  const [overrides, setOverrides] = React.useState<
    Record<string, AtendimentoTaskOverride>
  >({})
  const [deletedIds, setDeletedIds] = React.useState<Set<string>>(
    () => new Set(),
  )
  const [activeChatTaskId, setActiveChatTaskId] = React.useState<string | null>(
    null,
  )
  const [chatSource, setChatSource] =
    React.useState<AtendimentoChatSource | null>(null)

  const openChat = React.useCallback(
    (taskId: string, source: AtendimentoChatSource) => {
      setChatSource(source)
      setActiveChatTaskId(taskId)
    },
    [],
  )

  const closeChat = React.useCallback(() => {
    setActiveChatTaskId(null)
    setChatSource(null)
  }, [])

  React.useEffect(() => {
    if (pathnameRef.current !== pathname) {
      pathnameRef.current = pathname
      closeChat()
    }
  }, [pathname, closeChat])

  const claimTask = React.useCallback((taskId: string) => {
    setOverrides((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        claimedByUserId: ATENDIMENTO_CURRENT_USER_ID,
        status: "In Progress",
      },
    }))
  }, [])

  const encerrarTask = React.useCallback((taskId: string) => {
    setOverrides((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        status: "Canceled",
      },
    }))
  }, [])

  const apagarTask = React.useCallback((taskId: string) => {
    setDeletedIds((prev) => new Set(prev).add(taskId))
    setActiveChatTaskId((current) => (current === taskId ? null : current))
  }, [])

  const value = React.useMemo<AtendimentoTaskContextValue>(
    () => ({
      overrides,
      deletedIds,
      openChat,
      closeChat,
      activeChatTaskId,
      chatSource,
      claimTask,
      encerrarTask,
      apagarTask,
    }),
    [
      overrides,
      deletedIds,
      openChat,
      closeChat,
      activeChatTaskId,
      chatSource,
      claimTask,
      encerrarTask,
      apagarTask,
    ],
  )

  return (
    <AtendimentoTaskContext.Provider value={value}>
      {children}
    </AtendimentoTaskContext.Provider>
  )
}

export function useAtendimentoTasks() {
  const ctx = React.useContext(AtendimentoTaskContext)
  if (!ctx) {
    throw new Error(
      "useAtendimentoTasks must be used within AtendimentoTaskProvider",
    )
  }
  return ctx
}

export { ATENDIMENTO_CURRENT_USER_ID } from "@/lib/atendimento-users"
