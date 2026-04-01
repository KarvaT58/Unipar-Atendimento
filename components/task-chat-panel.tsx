"use client"

import { useMemo, useRef, useState } from "react"

import { useAtendimentoTasks } from "@/components/atendimento-task-provider"
import { personInitials } from "@/components/atendimento-task-people"
import {
  appointmentsTasksData,
  mergeAtendimentoTasks,
} from "@/components/appointments-tasks"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  ArrowDownIcon,
  ArrowLeftRightIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  Building2Icon,
  ChevronLeftIcon,
  FileTextIcon,
  HandMetalIcon,
  ImagesIcon,
  MoreHorizontalIcon,
  Music2Icon,
  PaperclipIcon,
  SendHorizonalIcon,
  Trash2Icon,
  XCircleIcon,
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
  if (status === "Backlog") return "Pausado"
  if (status === "Done") return "Concluído"
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

/** Voltar: sem fundo no hover; texto e ícone brancos ao passar o mouse. */
const taskChatBackButtonClass = cn(
  "h-auto min-h-0 w-fit justify-start gap-1.5 rounded-none border-0 bg-transparent px-2 py-2 -mx-2",
  "text-sm font-medium text-muted-foreground shadow-none transition-colors",
  "hover:bg-transparent hover:text-white",
  "active:bg-transparent active:text-white/90",
  "dark:hover:bg-transparent aria-expanded:bg-transparent",
  "focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0",
)

const DOCUMENT_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.odt,.ods,.rtf,application/pdf"

/** Estilo do botão de enviar mensagem (referência: quadrado arredondado, alto contraste claro/escuro). */
const chatSendMessageButtonClass = cn(
  "size-9 shrink-0 cursor-pointer rounded-md border shadow-none",
  "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-900",
  "dark:border-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200",
  "disabled:opacity-50",
)

export function TaskChatPanel({ taskId, source, onClose }: TaskChatPanelProps) {
  const {
    overrides,
    deletedIds,
    claimTask,
    encerrarTask,
    apagarTask,
  } = useAtendimentoTasks()
  const [draft, setDraft] = useState("")
  const documentInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const mergedTasks = useMemo(
    () => mergeAtendimentoTasks(appointmentsTasksData, overrides, deletedIds),
    [overrides, deletedIds],
  )

  const task = useMemo(() => {
    const base = appointmentsTasksData.find((t) => t.id === taskId)
    if (!base) return null
    return mergeAtendimentoTasks([base], overrides, deletedIds)[0] ?? null
  }, [taskId, overrides, deletedIds])

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
    !claimedByRow
  const showTransferirAlterarInMenu =
    !meusChamadosPage && !historicoPage
  const showEncerrarInMenu =
    !historicoPage && task.status !== "Canceled"

  const hasHeaderActions =
    showTransferirAlterarInMenu ||
    showPegarInMenu ||
    showApagarMenu ||
    showEncerrarInMenu

  function sendMessage() {
    if (chatReadOnly) return
    const text = draft.trim()
    if (!text) return
    setDraft("")
    toast.success("Mensagem enviada.")
  }

  function handleAttachmentChange(
    label: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const { files } = e.target
    e.target.value = ""
    if (chatReadOnly || !files?.length) return
    const names = Array.from(files)
      .map((f) => f.name)
      .join(", ")
    toast.success(`${label}: ${names}`)
  }

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
            {hasHeaderActions ? (
              <div className="ml-auto flex shrink-0 basis-full justify-end sm:basis-auto">
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
                      <>
                        <DropdownMenuSeparator />
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
                      </>
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
                            encerrarTask(task.id)
                            if (filaAtendimentosPage) {
                              toast.success(
                                "Chamado encerrado. Ele sai da fila e fica disponível em Histórico.",
                              )
                            } else if (meusAtendimentosPage) {
                              toast.success(
                                "Chamado encerrado. Ele sai de Meus atendimentos e fica em Histórico.",
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : null}
          </div>
        </div>
        <div
          className="min-h-0 flex-1"
          data-slot="task-chat-canvas"
          data-task-id={task.id}
          data-chat-source={source}
          aria-label="Área do chat do chamado"
        />
        <div className={`${chatComposerBarClass} border-t`}>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <input
              ref={documentInputRef}
              type="file"
              className="sr-only"
              accept={DOCUMENT_ACCEPT}
              multiple
              tabIndex={-1}
              onChange={(e) =>
                handleAttachmentChange("Documento(s) selecionado(s)", e)
              }
            />
            <input
              ref={mediaInputRef}
              type="file"
              className="sr-only"
              accept="image/*,video/*"
              multiple
              tabIndex={-1}
              onChange={(e) =>
                handleAttachmentChange("Foto(s) ou vídeo(s) selecionado(s)", e)
              }
            />
            <input
              ref={audioInputRef}
              type="file"
              className="sr-only"
              accept=".mp3,audio/mpeg,audio/mp3"
              multiple
              tabIndex={-1}
              onChange={(e) =>
                handleAttachmentChange("Áudio MP3 selecionado(s)", e)
              }
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
                <DropdownMenuItem
                  onSelect={() => {
                    window.setTimeout(() => audioInputRef.current?.click(), 0)
                  }}
                >
                  <Music2Icon className="size-4 opacity-80" />
                  Áudio (MP3)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                chatReadOnly
                  ? "Chat encerrado — somente leitura"
                  : "Escreva uma mensagem..."
              }
              disabled={chatReadOnly}
              className="h-9 min-h-9 flex-1 border border-border bg-background px-3 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-ring"
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
              <SendHorizonalIcon className="size-4" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
