"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import {
  type AtendimentoChatPersisted,
  type AtendimentoChatSource,
  ATENDIMENTO_CHAT_STORAGE_KEY,
  atendimentoChatSourceFromPathname,
} from "@/lib/atendimento-constants"
import { ATENDIMENTO_CURRENT_USER_ID } from "@/lib/atendimento-users"

export type AtendimentoTaskOverride = {
  claimedByUserId?: string | null
  status?:
    | "In Progress"
    | "Todo"
    | "Canceled"
  /**
   * Encerrado pelo solicitante em Meus chamados — não entra na página Histórico
   * (só chamados encerrados da fila ou de Meus atendimentos aparecem lá).
   */
  encerradoPeloSolicitante?: boolean
}

type AtendimentoTaskContextValue = {
  overrides: Record<string, AtendimentoTaskOverride>
  deletedIds: ReadonlySet<string>
  openChat: (taskId: string, source: AtendimentoChatSource) => void
  closeChat: () => void
  activeChatTaskId: string | null
  chatSource: AtendimentoChatSource | null
  claimTask: (taskId: string) => void
  encerrarTask: (
    taskId: string,
    options?: { peloSolicitante?: boolean },
  ) => void
  /** Meus chamados: volta de Encerrado para Aberto e limpa atendente (mock). */
  reabrirTask: (taskId: string) => void
  apagarTask: (taskId: string) => void
}

const AtendimentoTaskContext =
  React.createContext<AtendimentoTaskContextValue | null>(null)

function readPersistedOpenChat(): AtendimentoChatPersisted | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(ATENDIMENTO_CHAT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AtendimentoChatPersisted
  } catch {
    return null
  }
}

function writePersistedOpenChat(data: AtendimentoChatPersisted | null) {
  if (typeof window === "undefined") return
  if (!data) sessionStorage.removeItem(ATENDIMENTO_CHAT_STORAGE_KEY)
  else sessionStorage.setItem(ATENDIMENTO_CHAT_STORAGE_KEY, JSON.stringify(data))
}

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
      writePersistedOpenChat({ taskId, source, pathname })
    },
    [pathname],
  )

  const closeChat = React.useCallback(() => {
    writePersistedOpenChat(null)
    setActiveChatTaskId(null)
    setChatSource(null)
  }, [])

  React.useEffect(() => {
    if (pathnameRef.current !== pathname) {
      pathnameRef.current = pathname
      writePersistedOpenChat(null)
      setActiveChatTaskId(null)
      setChatSource(null)
    }
  }, [pathname])

  /** Após F5 (ou nova visita à rota): reabre o chat se a aba ainda tiver o snapshot desta página. */
  React.useEffect(() => {
    const stored = readPersistedOpenChat()
    if (!stored || stored.pathname !== pathname) return
    const expected = atendimentoChatSourceFromPathname(pathname)
    if (!expected || stored.source !== expected) {
      writePersistedOpenChat(null)
      return
    }
    setActiveChatTaskId(stored.taskId)
    setChatSource(stored.source)
  }, [pathname])

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

  const encerrarTask = React.useCallback(
    (taskId: string, options?: { peloSolicitante?: boolean }) => {
      const peloSolicitante = options?.peloSolicitante === true
      setOverrides((prev) => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          status: "Canceled",
          encerradoPeloSolicitante: peloSolicitante,
        },
      }))
    },
    [],
  )

  const reabrirTask = React.useCallback((taskId: string) => {
    setOverrides((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        status: "Todo",
        encerradoPeloSolicitante: false,
        claimedByUserId: null,
      },
    }))
  }, [])

  const apagarTask = React.useCallback((taskId: string) => {
    setDeletedIds((prev) => new Set(prev).add(taskId))
    setActiveChatTaskId((current) => {
      if (current === taskId) {
        writePersistedOpenChat(null)
        setChatSource(null)
        return null
      }
      return current
    })
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
      reabrirTask,
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
      reabrirTask,
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
