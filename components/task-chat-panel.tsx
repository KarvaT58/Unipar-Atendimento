"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react"

import { useAtendimentoTasks } from "@/components/atendimento-task-provider"
import { personInitials } from "@/components/atendimento-task-people"
import {
  buildTaskChatMessages,
  conversationDayKeyFromDate,
  type TaskChatMessageListHandle,
  type TaskChatRow,
  TaskChatMessageList,
} from "@/components/task-chat-message-list"
import {
  appointmentsTasksData,
  mergeAtendimentoTasks,
} from "@/components/appointments-tasks"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  ArrowDownIcon,
  ArrowLeftRightIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BookmarkIcon,
  Building2Icon,
  ChevronLeftIcon,
  ChevronsDown,
  FileTextIcon,
  HandMetalIcon,
  ImagesIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  PinIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  SendIcon,
  StarIcon,
  Trash2Icon,
  XCircleIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"
import type { AtendimentoChatSource } from "@/lib/atendimento-constants"
import {
  ATENDIMENTO_CURRENT_USER_ID,
  atendimentoSolicitanteAvatarUrl,
  resolveTaskAtendente,
} from "@/lib/atendimento-users"
import type { Task } from "@/components/appointments-tasks"

function taskStatusLabel(status: Task["status"]) {
  if (status === "Todo") return "Aberto"
  if (status === "In Progress") return "Em andamento"
  return "Encerrado"
}

function taskPriorityLabel(priority: Task["priority"]) {
  if (priority === "High") return "Alta"
  if (priority === "Medium") return "Média"
  return "Baixa"
}

const openedAtDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
})
const openedAtTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeStyle: "short",
})

type TaskChatPanelProps = {
  taskId: string
  source: AtendimentoChatSource
  onClose: () => void
}

/**
 * Shell do chat: card vazio para reconstruirmos a UI pedaço a pedaço.
 * Use o elemento com data-slot="task-chat-canvas" como raiz do conteúdo.
 */
const chatComposerBarClass =
  "shrink-0 border-border bg-[var(--tasks-table-header-bg)] px-4 py-2.5 sm:px-6"

/** Voltar: sem fundo no hover; claro = texto preto no hover, escuro = branco. */
const taskChatBackButtonClass = cn(
  "h-auto min-h-0 w-fit justify-start gap-1.5 rounded-none border-0 bg-transparent px-2 py-2 -mx-2",
  "text-sm font-medium text-muted-foreground shadow-none transition-colors",
  "hover:bg-transparent hover:text-black",
  "active:bg-transparent active:text-black dark:active:text-white/90",
  "dark:hover:bg-transparent dark:hover:text-white",
  "aria-expanded:bg-transparent",
  "focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0",
  "dark:focus-visible:ring-white/40",
)

const DOCUMENT_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.odt,.ods,.rtf,application/pdf"

/** Documentos + mídia: botão “+” na pré-visualização. */
const ATTACHMENT_COMBINED_ACCEPT = `${DOCUMENT_ACCEPT},image/*,video/*`

type ChatAttachmentPreviewItem = {
  id: string
  file: File
  url: string
}

type ChatAttachmentPreviewState = {
  items: ChatAttachmentPreviewItem[]
  activeIndex: number
  caption: string
}

function attachmentKindLabel(file: File): string {
  if (file.type.startsWith("image/")) return "Imagem"
  if (file.type.startsWith("video/")) return "Vídeo"
  if (file.type === "application/pdf") return "PDF"
  return "Documento"
}

/** Estilo do botão de enviar mensagem (referência: quadrado arredondado, alto contraste claro/escuro). */
const chatSendMessageButtonClass = cn(
  "size-9 shrink-0 cursor-pointer rounded-md border shadow-none",
  "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-900",
  "dark:border-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200",
  "disabled:opacity-50",
)

const MAX_PINNED_MESSAGES_PER_CHAT = 3

/** Após esta quantidade de linhas visíveis, o campo para de crescer e rola por dentro. */
const CHAT_COMPOSER_VISIBLE_MAX_LINES = 8

function textareaMaxHeightPxForLines(
  el: HTMLTextAreaElement,
  maxLines: number,
): number {
  const cs = getComputedStyle(el)
  const lh = cs.lineHeight
  const fontSize = parseFloat(cs.fontSize) || 14
  const lineHeightPx =
    !lh || lh === "normal" ? fontSize * 1.375 : parseFloat(lh)
  const pt = parseFloat(cs.paddingTop) || 0
  const pb = parseFloat(cs.paddingBottom) || 0
  const bt = parseFloat(cs.borderTopWidth) || 0
  const bb = parseFloat(cs.borderBottomWidth) || 0
  return Math.ceil(pt + pb + bt + bb + lineHeightPx * maxLines)
}

function bulkSelectionCountLabel(count: number) {
  if (count === 0) return "Nenhuma selecionada"
  if (count === 1) return "1 selecionada"
  return `${count} selecionadas`
}

export function TaskChatPanel({ taskId, source, onClose }: TaskChatPanelProps) {
  const viewerIsSolicitante = source === "meus-chamados"
  const {
    overrides,
    deletedIds,
    claimTask,
    encerrarTask,
    reabrirTask,
    apagarTask,
  } = useAtendimentoTasks()
  const [draft, setDraft] = useState("")
  const [messageSearchOpen, setMessageSearchOpen] = useState(false)
  const [messageSearchQuery, setMessageSearchQuery] = useState("")
  const [pinnedMessageIds, setPinnedMessageIds] = useState<string[]>([])
  const [favoriteMessageIds, setFavoriteMessageIds] = useState<string[]>([])
  const [savedMessagesOpen, setSavedMessagesOpen] = useState(false)
  const [savedMessagesFilter, setSavedMessagesFilter] = useState("")
  const [jumpToMessage, setJumpToMessage] = useState<{
    messageId: string
    nonce: number
  } | null>(null)
  const [appendedChatMessages, setAppendedChatMessages] = useState<
    TaskChatRow[]
  >([])
  const [sendSectorOnlyMessage, setSendSectorOnlyMessage] = useState(false)
  const [bulkSelectMode, setBulkSelectMode] = useState(false)
  const [bulkSelectedIds, setBulkSelectedIds] = useState(
    () => new Set<string>(),
  )
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)
  const [showJumpToConversationStart, setShowJumpToConversationStart] =
    useState(false)
  const [attachmentPreview, setAttachmentPreview] =
    useState<ChatAttachmentPreviewState | null>(null)
  const chatListRef = useRef<TaskChatMessageListHandle>(null)
  const attachmentAddMoreInputRef = useRef<HTMLInputElement>(null)

  const onJumpToConversationStartVisibilityChange = useCallback(
    (visible: boolean) => {
      setShowJumpToConversationStart(visible)
    },
    [],
  )

  useEffect(() => {
    setAttachmentPreview((prev) => {
      if (prev?.items.length) {
        for (const it of prev.items) URL.revokeObjectURL(it.url)
      }
      return null
    })
    setMessageSearchOpen(false)
    setMessageSearchQuery("")
    setPinnedMessageIds([])
    setFavoriteMessageIds([])
    setSavedMessagesOpen(false)
    setSavedMessagesFilter("")
    setJumpToMessage(null)
    setAppendedChatMessages([])
    setSendSectorOnlyMessage(false)
    setBulkSelectMode(false)
    setBulkSelectedIds(new Set())
    setBulkDeleteConfirmOpen(false)
    setShowJumpToConversationStart(false)
  }, [taskId])
  const documentInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const draftTextareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = draftTextareaRef.current
    if (!el) return
    const maxH = textareaMaxHeightPxForLines(el, CHAT_COMPOSER_VISIBLE_MAX_LINES)
    el.style.overflowY = "hidden"
    el.style.height = "auto"
    const natural = el.scrollHeight
    const capped = Math.min(natural, maxH)
    el.style.height = `${capped}px`
    el.style.overflowY = natural > maxH + 1 ? "auto" : "hidden"
  }, [draft])

  const mergedTasks = useMemo(
    () => mergeAtendimentoTasks(appointmentsTasksData, overrides, deletedIds),
    [overrides, deletedIds],
  )

  const task = useMemo(() => {
    const base = appointmentsTasksData.find((t) => t.id === taskId)
    if (!base) return null
    return mergeAtendimentoTasks([base], overrides, deletedIds)[0] ?? null
  }, [taskId, overrides, deletedIds])

  const allChatMessages = useMemo(
    () => [...buildTaskChatMessages(taskId), ...appendedChatMessages],
    [taskId, appendedChatMessages],
  )

  const handleTogglePin = useCallback((messageId: string) => {
    setPinnedMessageIds((prev) => {
      if (prev.includes(messageId)) return prev.filter((id) => id !== messageId)
      if (prev.length >= MAX_PINNED_MESSAGES_PER_CHAT) {
        toast.error(
          "Você pode fixar no máximo 3 mensagens por conversa.",
        )
        return prev
      }
      return [...prev, messageId]
    })
  }, [])

  const handleToggleFavorite = useCallback((messageId: string) => {
    setFavoriteMessageIds((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId],
    )
  }, [])

  const clearJumpToMessage = useCallback(() => {
    setJumpToMessage(null)
  }, [])

  const toggleBulkMessageSelect = useCallback((messageId: string) => {
    setBulkSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(messageId)) next.delete(messageId)
      else next.add(messageId)
      return next
    })
  }, [])

  const exitBulkSelectMode = useCallback(() => {
    setBulkSelectMode(false)
    setBulkSelectedIds(new Set())
    setBulkDeleteConfirmOpen(false)
  }, [])

  const openBulkDeleteConfirm = useCallback(() => {
    if (bulkSelectedIds.size === 0) return
    setBulkDeleteConfirmOpen(true)
  }, [bulkSelectedIds.size])

  const executeBulkDeleteMessages = useCallback(() => {
    const ids = Array.from(bulkSelectedIds)
    if (ids.length === 0) return
    chatListRef.current?.deleteMessages(ids)
    setPinnedMessageIds((prev) => prev.filter((id) => !ids.includes(id)))
    setFavoriteMessageIds((prev) => prev.filter((id) => !ids.includes(id)))
    exitBulkSelectMode()
    setBulkDeleteConfirmOpen(false)
    toast.success(
      ids.length === 1
        ? "Mensagem apagada."
        : `${ids.length} mensagens apagadas.`,
    )
  }, [bulkSelectedIds, exitBulkSelectMode])

  const openBulkDeleteFromMessageMenu = useCallback((messageId: string) => {
    setMessageSearchOpen(false)
    setBulkSelectMode(true)
    setBulkSelectedIds(new Set([messageId]))
  }, [])

  const goToChatMessage = useCallback((messageId: string) => {
    setJumpToMessage((prev) => ({
      messageId,
      nonce: (prev?.nonce ?? 0) + 1,
    }))
    setSavedMessagesOpen(false)
  }, [])

  const pinnedRows = useMemo(() => {
    const needle = savedMessagesFilter.trim().toLowerCase()
    return pinnedMessageIds
      .map((id) => allChatMessages.find((m) => m.id === id))
      .filter((m): m is (typeof allChatMessages)[number] => Boolean(m))
      .filter((m) => !(viewerIsSolicitante && m.sectorOnly))
      .filter((m) => !needle || m.body.toLowerCase().includes(needle))
  }, [pinnedMessageIds, allChatMessages, savedMessagesFilter, viewerIsSolicitante])

  const favoriteRows = useMemo(() => {
    const needle = savedMessagesFilter.trim().toLowerCase()
    return favoriteMessageIds
      .map((id) => allChatMessages.find((m) => m.id === id))
      .filter((m): m is (typeof allChatMessages)[number] => Boolean(m))
      .filter((m) => !(viewerIsSolicitante && m.sectorOnly))
      .filter((m) => !needle || m.body.toLowerCase().includes(needle))
  }, [
    favoriteMessageIds,
    allChatMessages,
    savedMessagesFilter,
    viewerIsSolicitante,
  ])

  const savedMarksCount = pinnedMessageIds.length + favoriteMessageIds.length

  if (!task) {
    return (
      <aside className="flex min-h-0 h-full w-full min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-lg border border-border bg-[var(--tasks-table-surface)]">
          <div className="shrink-0 border-b border-border bg-[var(--tasks-table-header-bg)] px-4 py-2.5 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              className={taskChatBackButtonClass}
              onClick={onClose}
            >
              <ChevronLeftIcon className="size-4 shrink-0" />
              Voltar
            </Button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-center px-6 py-8">
            <p className="text-sm text-muted-foreground">Chamado não encontrado.</p>
          </div>
        </div>
      </aside>
    )
  }

  const chatReadOnly = source === "historico" || task.status === "Canceled"

  const taskIndex = mergedTasks.findIndex((t) => t.id === task.id)
  const openedAtDate = task.openedAt
    ? new Date(task.openedAt)
    : new Date(
        new Date("2026-03-01T09:00:00").getTime() +
          Math.max(0, taskIndex) * 60 * 60 * 1000,
      )
  const openedAtDateLabel = openedAtDateFormatter.format(openedAtDate)
  const openedAtTimeLabel = openedAtTimeFormatter.format(openedAtDate)
  const statusLabel = taskStatusLabel(task.status)
  const priorityLabel = taskPriorityLabel(task.priority)
  const solicitanteAvatarUrl = atendimentoSolicitanteAvatarUrl(task.owner)
  const atendente = resolveTaskAtendente(task.claimedByUserId)

  const filaAtendimentosPage = source === "fila"
  const meusChamadosPage = source === "meus-chamados"
  const meusAtendimentosPage = source === "meus-atendimentos"
  const historicoPage = source === "historico"

  const claimedByRow = task.claimedByUserId ?? null
  const showPegarInMenu =
    filaAtendimentosPage && claimedByRow !== ATENDIMENTO_CURRENT_USER_ID
  const showApagarMenu =
    meusChamadosPage &&
    task.createdByUserId === "me" &&
    !claimedByRow &&
    task.status === "Todo"
  const showTransferirAlterarInMenu =
    !meusChamadosPage && !historicoPage
  const showEncerrarInMenu =
    !historicoPage &&
    (meusChamadosPage
      ? task.status === "In Progress"
      : task.status !== "Canceled")
  const showReabrirChamadoMenu =
    meusChamadosPage && task.status === "Canceled"

  const hasHeaderActions =
    showTransferirAlterarInMenu ||
    showPegarInMenu ||
    showApagarMenu ||
    showEncerrarInMenu ||
    showReabrirChamadoMenu

  function sendMessage() {
    if (chatReadOnly) return
    const text = draft.trim()
    if (!text) return

    const now = new Date()
    const timeLabel = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    const conversationDayKey = conversationDayKeyFromDate(now)
    const id = `${taskId}-live-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    if (viewerIsSolicitante) {
      setAppendedChatMessages((prev) => [
        ...prev,
        {
          id,
          fromAgent: false,
          body: text,
          timeLabel,
          readReceipt: null,
          conversationDayKey,
        },
      ])
    } else {
      const sectorOnly = sendSectorOnlyMessage
      setAppendedChatMessages((prev) => [
        ...prev,
        {
          id,
          fromAgent: true,
          body: text,
          timeLabel,
          readReceipt: "sent",
          conversationDayKey,
          ...(sectorOnly ? { sectorOnly: true as const } : {}),
        },
      ])
    }
    setDraft("")
  }

  const closeAttachmentPreview = useCallback(() => {
    setAttachmentPreview((prev) => {
      if (prev?.items.length) {
        for (const it of prev.items) URL.revokeObjectURL(it.url)
      }
      return null
    })
  }, [])

  const openAttachmentPreview = useCallback(
    (files: FileList | null) => {
      if (!files?.length || chatReadOnly) return
      const items: ChatAttachmentPreviewItem[] = Array.from(files).map(
        (file) => ({
          id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          url: URL.createObjectURL(file),
        }),
      )
      setAttachmentPreview({ items, activeIndex: 0, caption: "" })
    },
    [chatReadOnly],
  )

  const onAddMoreAttachments = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target
      e.target.value = ""
      if (!files?.length) return
      setAttachmentPreview((prev) => {
        if (!prev) return prev
        const added: ChatAttachmentPreviewItem[] = Array.from(files).map(
          (file) => ({
            id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2, 9)}`,
            file,
            url: URL.createObjectURL(file),
          }),
        )
        return {
          ...prev,
          items: [...prev.items, ...added],
          activeIndex: prev.items.length,
        }
      })
    },
    [],
  )

  const sendAttachmentPreview = useCallback(() => {
    if (!attachmentPreview?.items.length || chatReadOnly) return
    const { items, caption } = attachmentPreview
    const now = new Date()
    const timeLabel = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    const conversationDayKey = conversationDayKeyFromDate(now)

    const parts: string[] = []
    if (caption.trim()) parts.push(caption.trim())
    for (const it of items) {
      parts.push(`📎 ${it.file.name}`)
    }
    const body = parts.join("\n\n")

    const id = `${taskId}-live-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    if (viewerIsSolicitante) {
      setAppendedChatMessages((prev) => [
        ...prev,
        {
          id,
          fromAgent: false,
          body,
          timeLabel,
          readReceipt: null,
          conversationDayKey,
        },
      ])
    } else {
      const sectorOnly = sendSectorOnlyMessage
      setAppendedChatMessages((prev) => [
        ...prev,
        {
          id,
          fromAgent: true,
          body,
          timeLabel,
          readReceipt: "sent",
          conversationDayKey,
          ...(sectorOnly ? { sectorOnly: true as const } : {}),
        },
      ])
    }

    toast.success(
      items.length === 1
        ? "Arquivo enviado na conversa."
        : `${items.length} arquivos enviados na conversa.`,
    )
    closeAttachmentPreview()
  }, [
    attachmentPreview,
    chatReadOnly,
    taskId,
    viewerIsSolicitante,
    sendSectorOnlyMessage,
    closeAttachmentPreview,
  ])

  const attachmentActive =
    attachmentPreview?.items[attachmentPreview.activeIndex] ??
    attachmentPreview?.items[0] ??
    null

  return (
    <aside className="flex min-h-0 h-full w-full min-w-0 flex-1 flex-col">
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-lg border border-border bg-[var(--tasks-table-surface)]">
        <div className={`${chatComposerBarClass} border-b`}>
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground sm:text-sm">
            <Button
              type="button"
              variant="ghost"
              className={cn(taskChatBackButtonClass, "shrink-0")}
              onClick={onClose}
            >
              <ChevronLeftIcon className="size-4 shrink-0" />
              Voltar
            </Button>
            <span className="whitespace-nowrap">
              <span className="font-medium text-muted-foreground">Tarefa</span>{" "}
              <span className="font-medium tabular-nums">{task.id}</span>
            </span>
            <span className="flex min-w-0 max-w-full items-center gap-1.5 whitespace-nowrap">
              <span className="shrink-0 font-medium text-muted-foreground">
                Solicitante
              </span>
              <Avatar className="size-6 shrink-0 rounded-full border border-border bg-muted sm:size-7">
                <AvatarImage src={solicitanteAvatarUrl} alt="" />
                <AvatarFallback className="rounded-full text-[9px] font-medium sm:text-[10px]">
                  {personInitials(task.owner)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 max-w-[10rem] truncate font-medium sm:max-w-[14rem]">
                {task.owner}
              </span>
            </span>
            <span className="flex min-w-0 max-w-full items-center gap-1.5 whitespace-nowrap">
              <span className="shrink-0 font-medium text-muted-foreground">
                Atendente
              </span>
              {atendente ? (
                <>
                  <Avatar className="size-6 shrink-0 rounded-full border border-border bg-muted sm:size-7">
                    <AvatarImage src={atendente.avatarUrl} alt="" />
                    <AvatarFallback className="rounded-full text-[9px] font-medium sm:text-[10px]">
                      {personInitials(atendente.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 max-w-[10rem] truncate font-medium sm:max-w-[14rem]">
                    {atendente.name}
                  </span>
                </>
              ) : (
                <span className="font-medium">Aguardando na fila</span>
              )}
            </span>
            <span className="whitespace-nowrap">
              <span className="font-medium text-muted-foreground">Status</span>{" "}
              <span className="font-medium">{statusLabel}</span>
            </span>
            <span className="whitespace-nowrap">
              <span className="font-medium text-muted-foreground">Data</span>{" "}
              <span className="font-medium tabular-nums">
                {openedAtDateLabel}
              </span>
            </span>
            <span className="whitespace-nowrap">
              <span className="font-medium text-muted-foreground">Horário</span>{" "}
              <span className="font-medium tabular-nums">
                {openedAtTimeLabel}
              </span>
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-medium text-muted-foreground">
                Prioridade
              </span>
              {task.priority === "High" ? (
                <ArrowUpIcon className="size-3 shrink-0 text-red-500 dark:text-red-400" />
              ) : task.priority === "Medium" ? (
                <ArrowRightIcon className="size-3 shrink-0 text-amber-400 dark:text-amber-300" />
              ) : (
                <ArrowDownIcon className="size-3 shrink-0 text-green-500 dark:text-green-400" />
              )}
              <span className="font-medium">{priorityLabel}</span>
            </span>
            <div className="ml-auto flex shrink-0 basis-full items-center justify-end gap-0.5 sm:basis-auto sm:gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "size-8 shrink-0 cursor-pointer text-foreground hover:bg-muted hover:text-foreground",
                  messageSearchOpen && "bg-muted",
                )}
                aria-label={
                  messageSearchOpen
                    ? "Fechar pesquisa de mensagens"
                    : "Pesquisar mensagens na conversa"
                }
                aria-pressed={messageSearchOpen}
                onClick={() => {
                  setMessageSearchOpen((o) => {
                    const next = !o
                    if (!next) setMessageSearchQuery("")
                    return next
                  })
                }}
              >
                <SearchIcon className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "relative size-8 shrink-0 cursor-pointer text-foreground hover:bg-muted hover:text-foreground",
                  savedMessagesOpen && "bg-muted",
                )}
                aria-label="Mensagens fixadas e favoritas"
                aria-pressed={savedMessagesOpen}
                onClick={() => {
                  setSavedMessagesOpen(true)
                  setSavedMessagesFilter("")
                }}
              >
                <BookmarkIcon className="size-4" />
                {savedMarksCount > 0 ? (
                  <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
                ) : null}
              </Button>
              {hasHeaderActions ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 cursor-pointer text-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Ações do chamado"
                    >
                      <MoreHorizontalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-44">
                    {showTransferirAlterarInMenu ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => toast.message("Transferir — em breve")}
                      >
                        <ArrowLeftRightIcon />
                        Transferir
                      </DropdownMenuItem>
                    ) : null}
                    {showTransferirAlterarInMenu ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => toast.message("Alterar setor — em breve")}
                      >
                        <Building2Icon />
                        Alterar setor
                      </DropdownMenuItem>
                    ) : null}
                    {showPegarInMenu ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          claimTask(task.id)
                          toast.success(
                            "Atendimento atribuído a você. Confira em Meus atendimentos.",
                          )
                        }}
                      >
                        <HandMetalIcon />
                        Pegar
                      </DropdownMenuItem>
                    ) : null}
                    {showApagarMenu ? (
                      <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => {
                          apagarTask(task.id)
                          toast.success("Chamado removido.")
                        }}
                      >
                        <Trash2Icon />
                        Apagar
                      </DropdownMenuItem>
                    ) : null}
                    {showEncerrarInMenu ? (
                      <>
                        {!meusChamadosPage ? (
                          <DropdownMenuSeparator />
                        ) : null}
                        <DropdownMenuItem
                          variant="destructive"
                          className="cursor-pointer"
                          onClick={() => {
                            encerrarTask(task.id, {
                              peloSolicitante: source === "meus-chamados",
                            })
                            if (filaAtendimentosPage) {
                              toast.success(
                                "Chamado encerrado. Ele sai da fila e fica disponível em Histórico.",
                              )
                            } else if (meusAtendimentosPage) {
                              toast.success(
                                "Chamado encerrado. Ele sai de Meus atendimentos e fica em Histórico.",
                              )
                            } else if (source === "meus-chamados") {
                              toast.success(
                                "Chamado encerrado. Ele permanece em Meus chamados.",
                              )
                            } else {
                              toast.success(
                                "Chamado encerrado. Consulte o histórico para ver a conversa.",
                              )
                            }
                          }}
                        >
                          <XCircleIcon />
                          Encerrar
                        </DropdownMenuItem>
                      </>
                    ) : null}
                    {showReabrirChamadoMenu ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          reabrirTask(task.id)
                          toast.success("Chamado reaberto.")
                        }}
                      >
                        <RotateCcwIcon />
                        Reabrir chamado
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </div>
          {messageSearchOpen ? (
            <div
              className="flex min-w-0 items-center gap-2 border-t border-border px-4 py-2 sm:px-6"
              role="search"
            >
              <SearchIcon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={messageSearchQuery}
                onChange={(e) => setMessageSearchQuery(e.target.value)}
                placeholder="Pesquisar na conversa…"
                className="h-8 min-h-8 flex-1 border border-border bg-background px-3 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-ring"
                autoFocus
                aria-label="Pesquisar mensagens"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Fechar pesquisa"
                onClick={() => {
                  setMessageSearchOpen(false)
                  setMessageSearchQuery("")
                }}
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            className="relative flex min-h-0 min-w-0 flex-1 flex-col"
            data-chat-source={source}
          >
            <TaskChatMessageList
              ref={chatListRef}
              key={task.id}
              taskId={task.id}
              solicitanteName={task.owner}
              solicitanteAvatarUrl={solicitanteAvatarUrl}
              conversationSearchQuery={messageSearchQuery}
              pinnedMessageIds={pinnedMessageIds}
              favoriteMessageIds={favoriteMessageIds}
              onTogglePin={handleTogglePin}
              onToggleFavorite={handleToggleFavorite}
              jumpToMessage={jumpToMessage}
              onJumpHandled={clearJumpToMessage}
              appendedMessages={appendedChatMessages}
              hideSectorOnlyMessages={viewerIsSolicitante}
              viewerIsSolicitante={viewerIsSolicitante}
              selectionMode={bulkSelectMode}
              selectedMessageIds={bulkSelectedIds}
              onToggleMessageSelect={toggleBulkMessageSelect}
              onOpenBulkDeleteSelection={
                chatReadOnly ? undefined : openBulkDeleteFromMessageMenu
              }
              onJumpToConversationStartVisibilityChange={
                onJumpToConversationStartVisibilityChange
              }
            />
            {showJumpToConversationStart ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center px-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="pointer-events-auto gap-2 shadow-md"
                  aria-label="Ir às mensagens mais recentes"
                  onClick={() => chatListRef.current?.scrollToLatestMessages()}
                >
                  <ChevronsDown className="size-4 shrink-0" />
                  Mensagens recentes
                </Button>
              </div>
            ) : null}
          </div>
          {historicoPage ? (
          <div
            className={`${chatComposerBarClass} border-t`}
            role="status"
            aria-live="polite"
          >
            <p className="text-center text-sm leading-relaxed text-muted-foreground">
              No histórico não é possível enviar mensagens. Esta conversa é
              somente leitura.
            </p>
          </div>
        ) : (
          <div className={`${chatComposerBarClass} border-t`}>
            {bulkSelectMode ? (
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0 text-foreground hover:bg-muted"
                    aria-label="Cancelar seleção"
                    onClick={exitBulkSelectMode}
                  >
                    <XIcon className="size-5" />
                  </Button>
                  <span className="min-w-0 truncate text-sm font-medium text-foreground">
                    {bulkSelectionCountLabel(bulkSelectedIds.size)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={bulkSelectedIds.size === 0}
                  aria-label="Apagar mensagens selecionadas"
                  onClick={openBulkDeleteConfirm}
                >
                  <Trash2Icon className="size-5" />
                </Button>
              </div>
            ) : (
            <div className="flex min-w-0 items-end gap-1.5 sm:gap-2">
              <input
                ref={documentInputRef}
                type="file"
                className="sr-only"
                accept={DOCUMENT_ACCEPT}
                multiple
                tabIndex={-1}
                onChange={(e) => {
                  openAttachmentPreview(e.target.files)
                  e.target.value = ""
                }}
              />
              <input
                ref={mediaInputRef}
                type="file"
                className="sr-only"
                accept="image/*,video/*"
                multiple
                tabIndex={-1}
                onChange={(e) => {
                  openAttachmentPreview(e.target.files)
                  e.target.value = ""
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={chatReadOnly}
                    className="size-9 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Anexar arquivos"
                  >
                    <PaperclipIcon className="size-[1.125rem]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="top"
                  sideOffset={6}
                  className="min-w-52"
                >
                  <DropdownMenuItem
                    onSelect={() => {
                      window.setTimeout(
                        () => documentInputRef.current?.click(),
                        0,
                      )
                    }}
                  >
                    <FileTextIcon className="size-4 opacity-80" />
                    Documentos
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      window.setTimeout(() => mediaInputRef.current?.click(), 0)
                    }}
                  >
                    <ImagesIcon className="size-4 opacity-80" />
                    Fotos e vídeos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {!viewerIsSolicitante && !chatReadOnly ? (
                <div
                  className="flex min-h-9 max-w-[9rem] shrink-0 items-center gap-2 sm:max-w-none"
                  title="Visível só para atendentes do mesmo setor. O solicitante não vê."
                >
                  <Checkbox
                    id={`chat-sector-only-${task.id}`}
                    checked={sendSectorOnlyMessage}
                    onCheckedChange={(v) =>
                      setSendSectorOnlyMessage(v === true)
                    }
                    aria-describedby={`chat-sector-only-hint-${task.id}`}
                  />
                  <Label
                    htmlFor={`chat-sector-only-${task.id}`}
                    id={`chat-sector-only-hint-${task.id}`}
                    className="cursor-pointer text-xs font-normal leading-snug text-muted-foreground"
                  >
                    <span className="sm:hidden">Interna</span>
                    <span className="hidden sm:inline">
                      Só setor
                    </span>
                  </Label>
                </div>
              ) : null}
              <textarea
                ref={draftTextareaRef}
                value={draft}
                rows={1}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  chatReadOnly
                    ? "Chat encerrado — somente leitura"
                    : "Escreva uma mensagem..."
                }
                disabled={chatReadOnly}
                className={cn(
                  "scrollbar-chat-composer min-h-9 w-full min-w-0 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm leading-snug shadow-none outline-none",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring",
                  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                )}
                aria-label="Mensagem"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                disabled={chatReadOnly || !draft.trim()}
                className={chatSendMessageButtonClass}
                aria-label="Enviar mensagem"
                onClick={sendMessage}
              >
                <SendIcon className="size-4" strokeWidth={2} />
              </Button>
            </div>
            )}
          </div>
        )}
        {attachmentPreview && attachmentActive ? (
          <div
            className="absolute inset-0 z-50 flex flex-col rounded-b-lg bg-background shadow-[0_-4px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attachment-preview-title"
          >
            <header className="flex shrink-0 items-center gap-2 border-b border-border px-2 py-2 sm:px-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Fechar"
                onClick={closeAttachmentPreview}
              >
                <XIcon className="size-5" />
              </Button>
              <div className="min-w-0 flex-1 text-center" id="attachment-preview-title">
                <p className="truncate text-sm font-medium text-foreground">
                  {attachmentActive.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {attachmentKindLabel(attachmentActive.file)}
                  {attachmentActive.file.type === "application/pdf"
                    ? " · 1 arquivo"
                    : null}
                </p>
              </div>
              <span className="size-9 shrink-0" aria-hidden />
            </header>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/30 dark:bg-black/50">
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 sm:p-4">
                {attachmentActive.file.type.startsWith("image/") ? (
                  <img
                    src={attachmentActive.url}
                    alt=""
                    className="max-h-[min(50vh,100%)] max-w-full object-contain"
                  />
                ) : attachmentActive.file.type.startsWith("video/") ? (
                  <video
                    src={attachmentActive.url}
                    controls
                    className="max-h-[min(50vh,100%)] max-w-full rounded-lg"
                  />
                ) : attachmentActive.file.type === "application/pdf" ? (
                  <iframe
                    title={attachmentActive.file.name}
                    src={attachmentActive.url}
                    className="h-full min-h-[12rem] w-full max-w-full rounded-lg border border-border bg-white sm:max-h-[min(55vh,100%)]"
                  />
                ) : (
                  <div className="flex max-w-md flex-col items-center gap-4 px-6 text-center">
                    <FileTextIcon
                      className="size-20 text-muted-foreground opacity-60"
                      strokeWidth={1.25}
                    />
                    <p className="text-sm font-medium text-foreground">
                      {attachmentActive.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pré-visualização indisponível para este tipo. O arquivo será
                      enviado junto da mensagem.
                    </p>
                  </div>
                )}
              </div>

              <div className="shrink-0 space-y-3 border-t border-border bg-background px-3 py-3 sm:px-4">
                <Input
                  value={attachmentPreview.caption}
                  onChange={(e) =>
                    setAttachmentPreview((p) =>
                      p ? { ...p, caption: e.target.value } : null,
                    )
                  }
                  placeholder="Digite uma mensagem"
                  className="h-11 rounded-xl border-border bg-muted/40 text-sm shadow-none dark:bg-muted/25"
                  aria-label="Legenda da mensagem"
                />

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {attachmentPreview.items.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setAttachmentPreview((p) =>
                          p ? { ...p, activeIndex: index } : null,
                        )
                      }
                      className={cn(
                        "relative size-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                        index === attachmentPreview.activeIndex
                          ? "border-emerald-500 dark:border-emerald-400"
                          : "border-transparent ring-1 ring-border",
                      )}
                      aria-label={`Ver ${item.file.name}`}
                      aria-current={
                        index === attachmentPreview.activeIndex
                          ? "true"
                          : undefined
                      }
                    >
                      {item.file.type.startsWith("image/") ? (
                        <img
                          src={item.url}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : item.file.type.startsWith("video/") ? (
                        <div className="flex size-full items-center justify-center bg-muted">
                          <ImagesIcon className="size-7 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="flex size-full items-center justify-center bg-muted">
                          <FileTextIcon className="size-7 text-muted-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                  <input
                    ref={attachmentAddMoreInputRef}
                    type="file"
                    className="sr-only"
                    accept={ATTACHMENT_COMBINED_ACCEPT}
                    multiple
                    tabIndex={-1}
                    onChange={onAddMoreAttachments}
                  />
                  <button
                    type="button"
                    onClick={() => attachmentAddMoreInputRef.current?.click()}
                    className="flex size-14 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Adicionar mais arquivos"
                  >
                    <PlusIcon className="size-7" strokeWidth={2} />
                  </button>
                  <div className="ml-auto flex shrink-0 items-center pl-2">
                    <Button
                      type="button"
                      size="icon"
                      className="size-12 rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                      aria-label="Enviar"
                      onClick={sendAttachmentPreview}
                    >
                      <SendIcon className="size-5" strokeWidth={2} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        </div>
      </div>

      <Dialog
        open={savedMessagesOpen}
        onOpenChange={(open) => {
          setSavedMessagesOpen(open)
          if (open) setSavedMessagesFilter("")
        }}
      >
        <DialogContent size="default" className="max-h-[min(32rem,85vh)]">
          <DialogHeader>
            <DialogTitle>Fixadas e favoritas</DialogTitle>
            <DialogDescription>
              Busque e abra mensagens fixadas ou favoritadas nesta conversa.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-3">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={savedMessagesFilter}
                onChange={(e) => setSavedMessagesFilter(e.target.value)}
                placeholder="Filtrar por texto…"
                className="h-9 pl-8"
                aria-label="Filtrar mensagens fixadas e favoritas"
              />
            </div>
          </div>
          <DialogBody className="min-h-0 pt-0">
            <Tabs defaultValue="pinned" className="flex min-h-0 flex-col gap-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pinned" className="gap-1.5">
                  <PinIcon className="size-3.5" />
                  Fixadas
                  <span className="tabular-nums text-muted-foreground">
                    ({pinnedMessageIds.length})
                  </span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="gap-1.5">
                  <StarIcon className="size-3.5" />
                  Favoritas
                  <span className="tabular-nums text-muted-foreground">
                    ({favoriteMessageIds.length})
                  </span>
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="pinned"
                className="mt-0 max-h-64 min-h-0 overflow-y-auto space-y-2 pr-1 data-[state=inactive]:hidden"
              >
                {pinnedRows.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {pinnedMessageIds.length === 0
                      ? "Nenhuma mensagem fixada."
                      : "Nenhum resultado para o filtro."}
                  </p>
                ) : (
                  pinnedRows.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60"
                      onClick={() => goToChatMessage(m.id)}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="tabular-nums">{m.timeLabel}</span>
                        <PinIcon className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="line-clamp-3 text-foreground">{m.body}</p>
                    </button>
                  ))
                )}
              </TabsContent>
              <TabsContent
                value="favorites"
                className="mt-0 max-h-64 min-h-0 overflow-y-auto space-y-2 pr-1 data-[state=inactive]:hidden"
              >
                {favoriteRows.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {favoriteMessageIds.length === 0
                      ? "Nenhuma mensagem favoritada."
                      : "Nenhum resultado para o filtro."}
                  </p>
                ) : (
                  favoriteRows.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60"
                      onClick={() => goToChatMessage(m.id)}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="tabular-nums">{m.timeLabel}</span>
                        <StarIcon className="size-3.5 shrink-0 fill-amber-500 text-amber-600 dark:fill-amber-400 dark:text-amber-300" />
                      </div>
                      <p className="line-clamp-3 text-foreground">{m.body}</p>
                    </button>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={bulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkSelectedIds.size === 1
                ? "Apagar mensagem?"
                : "Apagar mensagens?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkSelectedIds.size === 1
                ? "Deseja apagar esta mensagem? Ela será exibida como apagada na conversa. Esta ação não pode ser desfeita."
                : `Deseja apagar as ${bulkSelectedIds.size} mensagens selecionadas? Elas serão exibidas como apagadas na conversa. Esta ação não pode ser desfeita.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={executeBulkDeleteMessages}
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  )
}
