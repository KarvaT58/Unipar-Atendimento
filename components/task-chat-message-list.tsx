"use client"

import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { personInitials } from "@/components/atendimento-task-people"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { atendimentoCurrentAgentDisplay } from "@/lib/atendimento-users"
import {
  Ban,
  Check,
  CheckCheck,
  EyeOff,
  Flag,
  MoreVertical,
  Pencil,
  Pin,
  Star,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function MessageBodyWithHighlight({
  text,
  highlight,
}: {
  text: string
  highlight: string
}) {
  const q = highlight.trim()
  if (!q) return <>{text}</>
  try {
    const re = new RegExp(`(${escapeRegExp(q)})`, "gi")
    const parts = text.split(re)
    return (
      <>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <mark
              key={i}
              className="rounded-sm bg-amber-200/90 px-0.5 dark:bg-amber-500/35"
            >
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    )
  } catch {
    return <>{text}</>
  }
}

/** ~6 linhas (text-sm + leading-relaxed); acima disso mostra “Ler mais”. */
const CHAT_BUBBLE_COLLAPSED_MAX_HEIGHT = "9rem"

function ExpandableChatMessageBody({
  text,
  highlight,
  fromAgent,
  searchActive,
}: {
  text: string
  highlight: string
  fromAgent: boolean
  searchActive: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const contentRef = useRef<HTMLParagraphElement>(null)
  const [hasOverflow, setHasOverflow] = useState(false)

  const skipClamp =
    searchActive && typeof highlight === "string" && highlight.trim().length > 0

  useLayoutEffect(() => {
    const el = contentRef.current
    if (!el || skipClamp) {
      setHasOverflow(false)
      return
    }
    if (expanded) return
    setHasOverflow(el.scrollHeight - el.clientHeight > 1)
  }, [text, expanded, skipClamp])

  const readMoreClass = fromAgent
    ? cn(
        "font-semibold text-blue-900 underline-offset-2 hover:underline",
        "dark:font-semibold dark:text-primary-foreground/90 dark:hover:text-primary-foreground",
      )
    : cn(
        "font-semibold text-blue-800 underline-offset-2 hover:underline",
        "dark:font-semibold dark:text-sky-300 dark:hover:text-sky-200",
      )

  return (
    <div className="min-w-0">
      <p
        ref={contentRef}
        className={cn(
          "whitespace-pre-wrap break-words text-sm leading-relaxed",
          !skipClamp && !expanded && "overflow-hidden",
        )}
        style={
          !skipClamp && !expanded
            ? { maxHeight: CHAT_BUBBLE_COLLAPSED_MAX_HEIGHT }
            : undefined
        }
      >
        <MessageBodyWithHighlight text={text} highlight={highlight} />
      </p>
      {hasOverflow && !expanded ? (
        <button
          type="button"
          className={cn(
            "mt-0.5 inline cursor-pointer border-0 bg-transparent p-0 text-left text-sm",
            readMoreClass,
          )}
          aria-expanded={false}
          onClick={() => setExpanded(true)}
        >
          Ler mais
        </button>
      ) : null}
      {hasOverflow && expanded ? (
        <button
          type="button"
          className={cn(
            "mt-1 inline cursor-pointer border-0 bg-transparent p-0 text-left text-sm",
            readMoreClass,
          )}
          aria-expanded={true}
          onClick={() => setExpanded(false)}
        >
          Ler menos
        </button>
      ) : null}
    </div>
  )
}

type ReadReceiptState = "sent" | "delivered" | "read"

export type TaskChatMessageListProps = {
  taskId: string
  solicitanteName: string
  solicitanteAvatarUrl: string
  /** Texto da busca no cabeçalho do chat; vazio = lista normal com paginação. */
  conversationSearchQuery?: string
  pinnedMessageIds?: readonly string[]
  favoriteMessageIds?: readonly string[]
  onTogglePin?: (messageId: string) => void
  onToggleFavorite?: (messageId: string) => void
  /** Dispara scroll até a mensagem quando `nonce` muda. */
  jumpToMessage?: { messageId: string; nonce: number } | null
  /** Chamado uma vez após localizar a mensagem (ou desistir), para limpar o pedido no pai. */
  onJumpHandled?: () => void
  /** Mensagens enviadas nesta sessão (concatenadas após o histórico mock). */
  appendedMessages?: readonly TaskChatRow[]
  /** Visão do solicitante: oculta mensagens com `sectorOnly`. */
  hideSectorOnlyMessages?: boolean
  /** Quando true, quem vê o chat é o solicitante (senão, o atendente). */
  viewerIsSolicitante?: boolean
  /** Modo seleção múltipla para apagar várias mensagens. */
  selectionMode?: boolean
  selectedMessageIds?: ReadonlySet<string>
  onToggleMessageSelect?: (messageId: string) => void
  /** Abre o modo seleção para apagar (ex.: ao escolher Apagar no menu da bolha). */
  onOpenBulkDeleteSelection?: (messageId: string) => void
  /** Indica se o usuário rolou para cima (longe do fim) para ver mensagens antigas. */
  onJumpToConversationStartVisibilityChange?: (visible: boolean) => void
}

export type TaskChatMessageListHandle = {
  /** Marca várias mensagens como apagadas (conteúdo “Mensagem apagada”). */
  deleteMessages: (ids: readonly string[]) => void
  /** Rola até o fim do histórico (mensagens mais recentes). */
  scrollToLatestMessages: () => void
}

export type TaskChatRow = {
  id: string
  fromAgent: boolean
  body: string
  timeLabel: string
  readReceipt: ReadReceiptState | null
  /** Dia civil da mensagem no fuso local (`YYYY-MM-DD`) para separadores de data. */
  conversationDayKey: string
  /** Mensagem interna: visível só para o mesmo setor (não para o solicitante). */
  sectorOnly?: boolean
}

type ChatRow = TaskChatRow

const PHRASES = [
  "Bom dia, preciso de ajuda com o chamado.",
  "Olá! Pode detalhar o que está acontecendo?",
  "Quando tento salvar, aparece um erro genérico.",
  "Entendi. Qual navegador você está usando?",
  "Chrome, última versão.",
  "Perfeito. Consegue enviar um print da tela?",
  "Sim, envio em instantes.",
  "Obrigado. Enquanto isso, tente limpar o cache.",
  "Já limpei e o problema continua.",
  "Vamos verificar as permissões da sua conta.",
  "Pode ser isso, mudei de setor semana passada.",
  "Registrei aqui. Um momento enquanto consulto.",
  "Sem problemas, aguardo.",
  "Encontrei uma inconsistência no cadastro.",
  "O que preciso fazer?",
  "Vou ajustar do nosso lado e te aviso.",
  "Combinado, muito obrigado.",
  "Por nada! Estamos finalizando o ajuste.",
  "Recebi a confirmação por e-mail.",
  "Ótimo. Se voltar a ocorrer, abra novo chamado.",
  "Pode deixar.",
  "Mais alguma dúvida?",
  "Por enquanto é só isso.",
  "Qualquer coisa estamos à disposição.",
  "Vou testar de novo agora.",
  "Funcionou! Muito obrigado pelo suporte.",
  "Ficamos felizes em ajudar.",
  "O atendimento foi rápido, parabéns à equipe.",
  "Agradeço o feedback.",
  "Vou encerrar por aqui então.",
  "Pode encerrar quando quiser.",
  "Só confirmando: o protocolo é este mesmo?",
  "Sim, anote o número da tarefa no cabeçalho.",
  "Perfeito, anotado.",
  "Se precisar de histórico, fica salvo no sistema.",
  "Ótimo saber.",
  "Boa tarde, retomando o chamado.",
  "Boa tarde! Em que posso ajudar?",
  "O erro voltou depois da atualização.",
  "Vamos reproduzir juntos o passo a passo.",
  "Primeiro abro o menu lateral…",
  "Correto, depois selecione Relatórios.",
  "Feito. Aqui travou de novo.",
  "Vou abrir um registro interno para a equipe técnica.",
  "Precisa de mais alguma informação minha?",
  "Só o horário aproximado em que ocorre.",
  "Costuma ser pela manhã.",
  "Anotado. Retorno em até um dia útil.",
  "Combinado, aguardo o retorno.",
  "Enquanto isso, use o fluxo alternativo que enviei.",
  "Vi o PDF, obrigado.",
  "Disponha!",
]

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function localDateKeyFromDate(d: Date): string {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, "0")
  const da = String(d.getDate()).padStart(2, "0")
  return `${y}-${mo}-${da}`
}

/** Chave `YYYY-MM-DD` no fuso local (ex.: mensagens enviadas “hoje”). */
export function conversationDayKeyFromDate(d: Date = new Date()): string {
  return localDateKeyFromDate(d)
}

function conversationDayKeyForMockIndex(i: number, total: number): string {
  const buckets = 6
  const dayBucket = Math.min(Math.floor((i * buckets) / total), buckets - 1)
  const daysAgo = buckets - 1 - dayBucket
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - daysAgo)
  return localDateKeyFromDate(d)
}

/** Rótulo estilo WhatsApp (pt-BR) para o separador de dia. */
export function formatChatDaySeparatorLabel(
  conversationDayKey: string,
  now = new Date(),
): string {
  const [ys, ms, ds] = conversationDayKey.split("-")
  const y = Number(ys)
  const m = Number(ms)
  const day = Number(ds)
  if (!y || !m || !day) return conversationDayKey
  const msgDayStart = new Date(y, m - 1, day, 12, 0, 0, 0)
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12,
    0,
    0,
    0,
  )
  const diffDays = Math.round(
    (todayStart.getTime() - msgDayStart.getTime()) / 86400000,
  )
  if (diffDays === 0) return "Hoje"
  if (diffDays === 1) return "Ontem"
  if (diffDays >= 2 && diffDays < 7) {
    return new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(
      msgDayStart,
    )
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(msgDayStart)
}

function buildMockMessages(taskId: string): ChatRow[] {
  const seed = hashSeed(taskId)
  const rows: ChatRow[] = []
  let minutes = 9 * 60 + (seed % 45)
  const total = 50

  for (let i = 0; i < total; i++) {
    const fromAgent = (i + seed) % 3 !== 0
    const h = Math.floor(minutes / 60) % 24
    const m = minutes % 60
    const timeLabel = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    minutes += 1 + ((seed + i * 7) % 4)

    const phrase = PHRASES[i % PHRASES.length]
    const body =
      i > 0 && !fromAgent && (seed + i) % 5 === 0
        ? `${phrase} (#${i + 1})`
        : phrase

    let readReceipt: ReadReceiptState | null = null
    if (fromAgent) {
      const r = (seed + i * 3) % 10
      if (r < 2) readReceipt = "sent"
      else if (r < 5) readReceipt = "delivered"
      else readReceipt = "read"
    }

    rows.push({
      id: `${taskId}-msg-${i}`,
      fromAgent,
      body,
      timeLabel,
      readReceipt,
      conversationDayKey: conversationDayKeyForMockIndex(i, total),
    })
  }
  return rows
}

/** Dados mock da conversa (para painel de fixadas/favoritas). */
export function buildTaskChatMessages(taskId: string): TaskChatRow[] {
  return buildMockMessages(taskId)
}

const CHAT_PAGE_SIZE = 30
/** Distância do topo do scroll para disparar carregamento das mensagens mais antigas. */
const LOAD_OLDER_SCROLL_THRESHOLD_PX = 80
/** Distância mínima do fim do scroll: acima disso o usuário está vendo mensagens antigas (atalho para voltar às recentes). */
const SCROLL_SHOW_JUMP_TO_LATEST_THRESHOLD_PX = 100

function shouldShowJumpToLatestMessages(el: HTMLDivElement, isSearch: boolean) {
  if (isSearch) return false
  const distanceFromBottom =
    el.scrollHeight - el.scrollTop - el.clientHeight
  return distanceFromBottom > SCROLL_SHOW_JUMP_TO_LATEST_THRESHOLD_PX
}

const EMPTY_MESSAGE_SELECTION: ReadonlySet<string> = new Set()

type ChatMessageOverride = {
  deleted?: true
  /** Eu apaguei uma mensagem recebida: some da minha tela (sem card “Mensagem apagada”). */
  hiddenByViewer?: true
  body?: string
  edited?: boolean
}

/** `true` se a mensagem foi escrita pelo usuário que está vendo o chat agora. */
function isMessageAuthoredByCurrentViewer(
  msg: Pick<TaskChatRow, "fromAgent">,
  viewerIsSolicitante: boolean,
): boolean {
  return viewerIsSolicitante ? !msg.fromAgent : msg.fromAgent
}

/** Confirmações: claro = cinza/azul na bolha verde; escuro = texto escuro na bolha clara (primary). */
function ReadReceiptIcon({ state }: { state: ReadReceiptState }) {
  if (state === "sent") {
    return (
      <Check
        className="size-3.5 shrink-0 text-zinc-500 dark:text-primary-foreground/85"
        strokeWidth={2.5}
      />
    )
  }
  return (
    <CheckCheck
      className={cn(
        "size-3.5 shrink-0",
        state === "read"
          ? "text-sky-600 dark:text-blue-600"
          : "text-zinc-500 dark:text-primary-foreground/85",
      )}
      strokeWidth={2.5}
    />
  )
}

export const TaskChatMessageList = forwardRef<
  TaskChatMessageListHandle,
  TaskChatMessageListProps
>(function TaskChatMessageList(
  {
    taskId,
    solicitanteName,
    solicitanteAvatarUrl,
    conversationSearchQuery = "",
    pinnedMessageIds = [],
    favoriteMessageIds = [],
    onTogglePin,
    onToggleFavorite,
    jumpToMessage = null,
    onJumpHandled,
    appendedMessages = [],
    hideSectorOnlyMessages = false,
    viewerIsSolicitante = false,
    selectionMode = false,
    selectedMessageIds,
    onToggleMessageSelect,
    onOpenBulkDeleteSelection,
    onJumpToConversationStartVisibilityChange,
  },
  ref,
) {
  const resolvedSelectedIds = selectedMessageIds ?? EMPTY_MESSAGE_SELECTION
  const allMessages = useMemo(() => {
    const base = buildMockMessages(taskId)
    const merged = [...base, ...appendedMessages]
    if (!hideSectorOnlyMessages) return merged
    return merged.filter((m) => !m.sectorOnly)
  }, [taskId, appendedMessages, hideSectorOnlyMessages])

  const allMessagesRef = useRef(allMessages)
  allMessagesRef.current = allMessages
  const viewerIsSolicitanteRef = useRef(viewerIsSolicitante)
  viewerIsSolicitanteRef.current = viewerIsSolicitante

  const [visibleStart, setVisibleStart] = useState(() =>
    Math.max(0, buildMockMessages(taskId).length - CHAT_PAGE_SIZE),
  )

  const scrollRef = useRef<HTMLDivElement>(null)
  const prevAppendedLenRef = useRef(0)
  const pendingScrollRestoreRef = useRef<{
    prevScrollHeight: number
    prevScrollTop: number
  } | null>(null)
  const pendingNewStartRef = useRef(0)
  const loadOlderLockedRef = useRef(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportMessageId, setReportMessageId] = useState<string | null>(null)
  const [reportDescription, setReportDescription] = useState("")
  const [messageOverrides, setMessageOverrides] = useState<
    Record<string, ChatMessageOverride>
  >({})
  const [editOpen, setEditOpen] = useState(false)
  const [editMessageId, setEditMessageId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState("")
  useImperativeHandle(
    ref,
    () => ({
      deleteMessages(ids: readonly string[]) {
        setMessageOverrides((prev) => {
          const rows = allMessagesRef.current
          const solicitante = viewerIsSolicitanteRef.current
          const next = { ...prev }
          for (const id of ids) {
            const row = rows.find((m) => m.id === id)
            if (!row) continue
            if (isMessageAuthoredByCurrentViewer(row, solicitante)) {
              next[id] = { ...prev[id], deleted: true }
              delete next[id].hiddenByViewer
            } else {
              next[id] = { hiddenByViewer: true }
            }
          }
          return next
        })
      },
      scrollToLatestMessages() {
        const el = scrollRef.current
        if (!el) return
        el.scrollTo({
          top: el.scrollHeight - el.clientHeight,
          behavior: "smooth",
        })
      },
    }),
    [],
  )

  const agentName = atendimentoCurrentAgentDisplay.name
  const agentAvatarUrl = atendimentoCurrentAgentDisplay.avatarUrl

  const visibleMessages = useMemo(
    () =>
      allMessages
        .slice(visibleStart)
        .filter((m) => !messageOverrides[m.id]?.hiddenByViewer),
    [allMessages, visibleStart, messageOverrides],
  )

  const searchTrimmed = conversationSearchQuery.trim()
  const isSearchMode = searchTrimmed.length > 0

  const displayMessages = useMemo(() => {
    if (!isSearchMode) return visibleMessages
    const needle = searchTrimmed.toLowerCase()
    return allMessages.filter((m) => {
      if (messageOverrides[m.id]?.hiddenByViewer) return false
      if (messageOverrides[m.id]?.deleted) return false
      const body = messageOverrides[m.id]?.body ?? m.body
      return body.toLowerCase().includes(needle)
    })
  }, [
    allMessages,
    isSearchMode,
    searchTrimmed,
    visibleMessages,
    messageOverrides,
  ])

  useEffect(() => {
    setMessageOverrides({})
  }, [taskId])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (isSearchMode) {
      el.scrollTop = 0
      return
    }
    el.scrollTop = el.scrollHeight
  }, [taskId, isSearchMode, searchTrimmed])

  useLayoutEffect(() => {
    prevAppendedLenRef.current = 0
  }, [taskId])

  useLayoutEffect(() => {
    const len = appendedMessages.length
    if (isSearchMode) {
      prevAppendedLenRef.current = len
      return
    }
    if (len > prevAppendedLenRef.current) {
      const el = scrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    }
    prevAppendedLenRef.current = len
  }, [appendedMessages.length, isSearchMode, taskId])

  useEffect(() => {
    if (!loadingOlder) return
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setVisibleStart(pendingNewStartRef.current)
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [loadingOlder])

  useLayoutEffect(() => {
    const adj = pendingScrollRestoreRef.current
    if (!adj) return
    pendingScrollRestoreRef.current = null
    const el = scrollRef.current
    if (!el) return
    const delta = el.scrollHeight - adj.prevScrollHeight
    el.scrollTop = adj.prevScrollTop + delta
    loadOlderLockedRef.current = false
    setLoadingOlder(false)
  }, [visibleStart])

  const pinnedSet = useMemo(
    () => new Set(pinnedMessageIds),
    [pinnedMessageIds],
  )
  const favoriteSet = useMemo(
    () => new Set(favoriteMessageIds),
    [favoriteMessageIds],
  )

  useEffect(() => {
    if (!jumpToMessage) return
    const { messageId } = jumpToMessage
    const idx = allMessages.findIndex((m) => m.id === messageId)
    if (idx === -1) {
      onJumpHandled?.()
      return
    }
    setVisibleStart((prev) => (idx < prev ? idx : prev))

    let cancelled = false
    let notified = false
    let attempts = 0
    const finish = () => {
      if (notified) return
      notified = true
      onJumpHandled?.()
    }
    const tryScroll = () => {
      if (cancelled) return
      if (attempts > 40) {
        finish()
        return
      }
      attempts += 1
      const el = document.getElementById(`chat-message-${messageId}`)
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "center" })
        el.classList.add(
          "ring-2",
          "ring-ring",
          "ring-offset-2",
          "rounded-lg",
          "transition-shadow",
        )
        window.setTimeout(() => {
          el.classList.remove(
            "ring-2",
            "ring-ring",
            "ring-offset-2",
            "rounded-lg",
            "transition-shadow",
          )
        }, 1800)
        finish()
        return
      }
      requestAnimationFrame(tryScroll)
    }
    requestAnimationFrame(() => requestAnimationFrame(tryScroll))
    return () => {
      cancelled = true
    }
  }, [jumpToMessage, allMessages, onJumpHandled])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    const notifyJump = onJumpToConversationStartVisibilityChange
    if (el && notifyJump) {
      notifyJump(shouldShowJumpToLatestMessages(el, isSearchMode))
    }

    if (
      !el ||
      isSearchMode ||
      loadOlderLockedRef.current ||
      visibleStart <= 0
    )
      return
    if (el.scrollTop > LOAD_OLDER_SCROLL_THRESHOLD_PX) return

    const newStart = Math.max(0, visibleStart - CHAT_PAGE_SIZE)
    if (newStart === visibleStart) return

    loadOlderLockedRef.current = true
    pendingNewStartRef.current = newStart
    pendingScrollRestoreRef.current = {
      prevScrollHeight: el.scrollHeight,
      prevScrollTop: el.scrollTop,
    }
    setLoadingOlder(true)
  }, [
    visibleStart,
    isSearchMode,
    onJumpToConversationStartVisibilityChange,
  ])

  useLayoutEffect(() => {
    const el = scrollRef.current
    const notify = onJumpToConversationStartVisibilityChange
    if (!el || !notify) return
    notify(shouldShowJumpToLatestMessages(el, isSearchMode))
  }, [
    allMessages.length,
    visibleStart,
    loadingOlder,
    taskId,
    isSearchMode,
    onJumpToConversationStartVisibilityChange,
  ])

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#e5ddd5] dark:bg-[#0d0d0d]"
      data-slot="task-chat-canvas"
      data-task-id={taskId}
      aria-label="Mensagens do chamado"
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        aria-busy={loadingOlder}
        className="scrollbar-tasks-table min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4"
      >
        {loadingOlder && !isSearchMode ? (
          <Item
            variant="muted"
            size="sm"
            className="mb-2 w-full rounded-lg border border-border/60 bg-background/80 shadow-sm [--radius:1rem] backdrop-blur-sm dark:bg-card/80"
            aria-live="polite"
          >
            <ItemMedia>
              <Spinner className="text-muted-foreground" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="line-clamp-1 text-sm font-medium text-foreground">
                Carregando mensagens…
              </ItemTitle>
            </ItemContent>
          </Item>
        ) : null}
        {isSearchMode && displayMessages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma mensagem encontrada.
          </p>
        ) : null}
        {displayMessages.map((msg, index) => {
          const prev = index > 0 ? displayMessages[index - 1] : null
          const showDaySeparator =
            !prev || prev.conversationDayKey !== msg.conversationDayKey
          const dayLabel = formatChatDaySeparatorLabel(msg.conversationDayKey)
          const ov = messageOverrides[msg.id]
          const isDeleted = ov?.deleted === true
          const displayBody = isDeleted ? "" : (ov?.body ?? msg.body)
          const showEdited = !isDeleted && ov?.edited === true
          const isPinned = pinnedSet.has(msg.id)
          const isFavorite = favoriteSet.has(msg.id)
          const isSectorOnly = msg.sectorOnly === true && msg.fromAgent
          const isRowSelected =
            selectionMode && resolvedSelectedIds.has(msg.id)
          return (
          <Fragment key={msg.id}>
          {showDaySeparator ? (
            <div
              className="flex w-full justify-center py-2"
              role="separator"
              aria-label={dayLabel}
            >
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-center text-xs font-medium shadow-sm",
                  "bg-black/12 text-zinc-800",
                  "dark:bg-zinc-800/90 dark:text-zinc-100",
                )}
              >
                {dayLabel}
              </span>
            </div>
          ) : null}
          <div
            id={`chat-message-${msg.id}`}
            className={cn(
              "flex w-full scroll-mt-4",
              selectionMode
                ? cn(
                    "items-center gap-2 rounded-lg py-0.5 pl-1 pr-0.5",
                    isRowSelected &&
                      "bg-black/[0.06] dark:bg-white/[0.08]",
                  )
                : msg.fromAgent
                  ? "justify-end"
                  : "justify-start",
            )}
            onClick={
              selectionMode && !isDeleted
                ? () => onToggleMessageSelect?.(msg.id)
                : undefined
            }
            role={selectionMode && !isDeleted ? "button" : undefined}
            tabIndex={selectionMode && !isDeleted ? 0 : undefined}
            onKeyDown={
              selectionMode && !isDeleted
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onToggleMessageSelect?.(msg.id)
                    }
                  }
                : undefined
            }
          >
            {selectionMode ? (
              <div
                className="flex w-9 shrink-0 items-center justify-center self-center"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {!isDeleted ? (
                  <Checkbox
                    checked={resolvedSelectedIds.has(msg.id)}
                    onCheckedChange={() =>
                      onToggleMessageSelect?.(msg.id)
                    }
                    aria-label={`Selecionar mensagem (${msg.timeLabel})`}
                  />
                ) : (
                  <span className="inline-block size-4 shrink-0" aria-hidden />
                )}
              </div>
            ) : null}
            <div
              className={cn(
                "flex min-w-0",
                selectionMode
                  ? msg.fromAgent
                    ? "flex-1 justify-end"
                    : "flex-1 justify-start"
                  : cn(
                      "w-full",
                      msg.fromAgent ? "justify-end" : "justify-start",
                    ),
              )}
            >
            <div
              className={cn(
                "flex min-w-0 max-w-[min(92vw,calc(50%-0.75rem))] items-end gap-1.5",
                msg.fromAgent ? "flex-row-reverse" : "flex-row",
              )}
            >
              <Avatar className="size-9 shrink-0 rounded-full border border-zinc-300/80 bg-white shadow-sm dark:border-white/10 dark:bg-muted dark:shadow-none">
                <AvatarImage
                  src={msg.fromAgent ? agentAvatarUrl : solicitanteAvatarUrl}
                  alt=""
                />
                <AvatarFallback className="rounded-full text-[10px]">
                  {personInitials(msg.fromAgent ? agentName : solicitanteName)}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "group flex min-w-0 items-center gap-1.5",
                  msg.fromAgent ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "relative min-w-0 rounded-2xl px-3 py-2 shadow-sm",
                    msg.fromAgent
                      ? cn(
                          "rounded-br-md bg-[#d9fdd3] text-zinc-900 dark:bg-primary dark:text-primary-foreground",
                          !isDeleted &&
                            isSectorOnly &&
                            "ring-1 ring-amber-600/45 dark:ring-primary-foreground/55",
                        )
                      : "rounded-bl-md border border-zinc-200/80 bg-white text-zinc-900 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100",
                  )}
                >
                  {isSectorOnly && !isDeleted ? (
                    <div
                      className={cn(
                        "mb-1.5 flex items-center gap-1.5 text-[10px] font-medium leading-tight",
                        "text-amber-950/95 dark:text-primary-foreground",
                        "dark:[text-shadow:0_1px_2px_rgb(0_0_0_/_0.55)]",
                      )}
                    >
                      <EyeOff
                        className="size-3 shrink-0 opacity-90 dark:opacity-100"
                        aria-hidden
                      />
                    </div>
                  ) : null}
                  {isDeleted ? (
                    <div className="flex min-h-[1.25rem] items-center gap-2 py-0.5">
                      <Ban
                        className={cn(
                          "size-4 shrink-0 opacity-80",
                          msg.fromAgent
                            ? "text-zinc-600 dark:text-primary-foreground/75"
                            : "text-zinc-500 dark:text-zinc-400",
                        )}
                        strokeWidth={2}
                        aria-hidden
                      />
                      <p
                        className={cn(
                          "text-sm leading-snug italic",
                          msg.fromAgent
                            ? "text-zinc-700 dark:text-primary-foreground/85"
                            : "text-zinc-600 dark:text-zinc-400",
                        )}
                      >
                        Mensagem apagada
                      </p>
                    </div>
                  ) : (
                    <ExpandableChatMessageBody
                      text={displayBody}
                      highlight={isSearchMode ? searchTrimmed : ""}
                      fromAgent={msg.fromAgent}
                      searchActive={isSearchMode}
                    />
                  )}
                  <div
                    className={cn(
                      "mt-1 flex flex-wrap items-center justify-end gap-x-1 gap-y-0 tabular-nums",
                      msg.fromAgent
                        ? "text-zinc-600 dark:text-primary-foreground/75"
                        : "text-zinc-500 dark:text-zinc-400",
                    )}
                  >
                    {!isDeleted && (isPinned || isFavorite) ? (
                      <span
                        className="mr-0.5 flex shrink-0 items-center gap-0.5"
                        aria-hidden
                      >
                        {isPinned ? (
                          <Pin
                            className="size-3 shrink-0 text-amber-600 dark:text-amber-400"
                            strokeWidth={2.5}
                            aria-hidden
                          />
                        ) : null}
                        {isFavorite ? (
                          <Star
                            className="size-3 shrink-0 fill-amber-500 text-amber-600 dark:fill-amber-400 dark:text-amber-300"
                            strokeWidth={2}
                            aria-hidden
                          />
                        ) : null}
                      </span>
                    ) : null}
                    {showEdited ? (
                      <span
                        className="text-[10px] font-normal not-italic opacity-80"
                        aria-label="Mensagem editada"
                      >
                        editada
                        <span aria-hidden className="mx-0.5">
                          ·
                        </span>
                      </span>
                    ) : null}
                    <span className="text-[11px]">{msg.timeLabel}</span>
                    {msg.fromAgent && msg.readReceipt && !isDeleted ? (
                      <ReadReceiptIcon state={msg.readReceipt} />
                    ) : null}
                  </div>
                </div>

                {!isDeleted && !selectionMode ? (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "size-8 shrink-0 text-zinc-500 opacity-0 transition-opacity duration-150 hover:bg-zinc-300/50 hover:text-zinc-900 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 dark:text-muted-foreground dark:hover:bg-white/10 dark:hover:text-foreground",
                      msg.fromAgent && "dark:hover:bg-primary-foreground/15",
                    )}
                    aria-label="Ações da mensagem"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={msg.fromAgent ? "end" : "start"}>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    disabled={!onTogglePin}
                    onClick={() => onTogglePin?.(msg.id)}
                  >
                    <Pin className="size-4 opacity-80" />
                    {isPinned ? "Desfixar" : "Fixar"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    disabled={!onToggleFavorite}
                    onClick={() => onToggleFavorite?.(msg.id)}
                  >
                    <Star className="size-4 opacity-80" />
                    {isFavorite ? "Remover dos favoritos" : "Favoritar"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setReportMessageId(msg.id)
                      setReportDescription("")
                      setReportOpen(true)
                    }}
                  >
                    <Flag className="size-4 opacity-80" />
                    Denunciar
                  </DropdownMenuItem>
                  {msg.fromAgent ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          const current =
                            messageOverrides[msg.id]?.body ?? msg.body
                          setEditMessageId(msg.id)
                          setEditDraft(current)
                          setEditOpen(true)
                        }}
                      >
                        <Pencil className="size-4 opacity-80" />
                        Editar
                      </DropdownMenuItem>
                    </>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer"
                    disabled={!onOpenBulkDeleteSelection}
                    onClick={() => onOpenBulkDeleteSelection?.(msg.id)}
                  >
                    <Trash2 className="size-4 opacity-80" />
                    Apagar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
                ) : null}
              </div>
            </div>
            </div>
          </div>
          </Fragment>
          )
        })}
        <div className="h-px shrink-0" aria-hidden />
      </div>

      <Dialog
        open={reportOpen}
        onOpenChange={(open) => {
          setReportOpen(open)
          if (!open) {
            setReportMessageId(null)
            setReportDescription("")
          }
        }}
      >
        <DialogContent size="default" showCloseButton>
          <DialogHeader>
            <DialogTitle>Denunciar mensagem</DialogTitle>
            <DialogDescription>
              Descreva o motivo da denúncia. A equipe analisará sua solicitação.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-2">
            <Label htmlFor="chat-report-reason">Motivo da denúncia</Label>
            <textarea
              id="chat-report-reason"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Ex.: conteúdo inadequado, ofensa, spam…"
              rows={5}
              className={cn(
                "min-h-[7.5rem] w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-none outline-none transition-colors",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                "disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
              )}
            />
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReportOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!reportDescription.trim() || !reportMessageId}
              onClick={() => {
                if (!reportMessageId || !reportDescription.trim()) return
                toast.success("Denúncia enviada. Obrigado pelo retorno.")
                setReportOpen(false)
                setReportMessageId(null)
                setReportDescription("")
              }}
            >
              Enviar denúncia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) {
            setEditMessageId(null)
            setEditDraft("")
          }
        }}
      >
        <DialogContent size="default" showCloseButton>
          <DialogHeader>
            <DialogTitle>Editar mensagem</DialogTitle>
            <DialogDescription>
              As alterações ficam visíveis para todos na conversa. A linha do
              horário mostrará que a mensagem foi editada.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-2">
            <Label htmlFor="chat-edit-body">Mensagem</Label>
            <textarea
              id="chat-edit-body"
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              rows={5}
              className={cn(
                "min-h-[7.5rem] w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-none outline-none transition-colors",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                "disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
              )}
            />
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!editDraft.trim() || !editMessageId}
              onClick={() => {
                if (!editMessageId || !editDraft.trim()) return
                setMessageOverrides((prev) => ({
                  ...prev,
                  [editMessageId]: {
                    ...prev[editMessageId],
                    body: editDraft.trim(),
                    edited: true,
                  },
                }))
                toast.success("Mensagem atualizada.")
                setEditOpen(false)
                setEditMessageId(null)
                setEditDraft("")
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})

TaskChatMessageList.displayName = "TaskChatMessageList"
