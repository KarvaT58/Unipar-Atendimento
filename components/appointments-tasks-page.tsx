'use client'

import { useState } from "react"

import { useAtendimentoTasks } from "@/components/atendimento-task-provider"
import { TaskChatPanel } from "@/components/task-chat-panel"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AppointmentsTasks,
  appointmentsTasksData,
} from "@/components/appointments-tasks"

const PAGE_SIZE = 20

type AppointmentsTasksPageProps = {
  showCreateAtendimentoButton?: boolean
  showEncerradoStatusFilter?: boolean
  historicoPage?: boolean
  filaAtendimentosPage?: boolean
  meusAtendimentosPage?: boolean
  meusChamadosPage?: boolean
}

export function AppointmentsTasksPage({
  showCreateAtendimentoButton = false,
  showEncerradoStatusFilter = true,
  historicoPage = false,
  filaAtendimentosPage = false,
  meusAtendimentosPage = false,
  meusChamadosPage = false,
}: AppointmentsTasksPageProps) {
  const { activeChatTaskId, chatSource, closeChat } = useAtendimentoTasks()
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(appointmentsTasksData.length / PAGE_SIZE))
  const totalTasks = appointmentsTasksData.length

  const goToPage = (nextPage: number) => {
    const safePage = Math.min(Math.max(1, nextPage), totalPages)
    setPage(safePage)
  }

  const chatOpen = Boolean(activeChatTaskId && chatSource)

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-0 overflow-hidden">
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        {activeChatTaskId && chatSource ? (
          <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden px-4 pt-3 pb-3 sm:px-6 sm:pt-4">
            <TaskChatPanel
              taskId={activeChatTaskId}
              source={chatSource}
              onClose={closeChat}
            />
          </div>
        ) : (
          <AppointmentsTasks
            page={page}
            pageSize={PAGE_SIZE}
            showCreateAtendimentoButton={showCreateAtendimentoButton}
            showEncerradoStatusFilter={showEncerradoStatusFilter}
            historicoPage={historicoPage}
            filaAtendimentosPage={filaAtendimentosPage}
            meusAtendimentosPage={meusAtendimentosPage}
            meusChamadosPage={meusChamadosPage}
          />
        )}
      </div>
      {!chatOpen ? (
      <div className="flex shrink-0 items-center justify-between gap-4 px-6 pb-[4px] pt-2 text-xs text-muted-foreground">
        <span className="space-x-1">
          <span>Total</span>
          <span className="font-medium text-foreground">{totalTasks}</span>
        </span>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  goToPage(page - 1)
                }}
              />
            </PaginationItem>
            {(() => {
              const items = []

              // Page 1 is always visible and fixed
              items.push(
                <PaginationItem key={1}>
                  <PaginationLink
                    href="#"
                    isActive={page === 1}
                    onClick={(event) => {
                      event.preventDefault()
                      goToPage(1)
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>,
              )

              // When we're on page 1, also show 2 and 3 (if they exist)
              if (page === 1) {
                if (totalPages >= 2) {
                  items.push(
                    <PaginationItem key={2}>
                      <PaginationLink
                        href="#"
                        isActive={false}
                        onClick={(event) => {
                          event.preventDefault()
                          goToPage(2)
                        }}
                      >
                        2
                      </PaginationLink>
                    </PaginationItem>,
                  )
                }
                if (totalPages >= 3) {
                  items.push(
                    <PaginationItem key={3}>
                      <PaginationLink
                        href="#"
                        isActive={false}
                        onClick={(event) => {
                          event.preventDefault()
                          goToPage(3)
                        }}
                      >
                        3
                      </PaginationLink>
                    </PaginationItem>,
                  )
                }
                return items
              }

              // For page >= 2 we only show:
              // 1 (fixed), current page, and next page (if exists)
              items.push(
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive
                    onClick={(event) => {
                      event.preventDefault()
                      goToPage(page)
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>,
              )

              if (page + 1 <= totalPages) {
                items.push(
                  <PaginationItem key={page + 1}>
                    <PaginationLink
                      href="#"
                      isActive={false}
                      onClick={(event) => {
                        event.preventDefault()
                        goToPage(page + 1)
                      }}
                    >
                      {page + 1}
                    </PaginationLink>
                  </PaginationItem>,
                )
              }

              return items
            })()}
            {totalPages > 3 && page + 1 < totalPages && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  goToPage(page + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      ) : null}
    </div>
  )
}

