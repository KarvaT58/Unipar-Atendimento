'use client'

import { useState } from "react"

import { useCreateAtendimento } from "@/components/create-atendimento-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowDownIcon,
  ArrowLeftRightIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  Building2Icon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  CirclePlusIcon,
  EyeIcon,
  HandMetalIcon,
  MoreHorizontalIcon,
  XCircleIcon,
} from "lucide-react"

type Task = {
  id: string
  type: "Documentation" | "Bug" | "Feature"
  title: string
  owner: string
  status: "In Progress" | "Backlog" | "Todo" | "Canceled" | "Done"
  priority: "Low" | "Medium" | "High"
  openedAt?: string
}

export const appointmentsTasksData: Task[] = [
  {
    id: "TASK-8782",
    type: "Documentation",
    title: "You can’t compress the program without quantifying the open-source SSD ...",
    owner: "Ana Souza",
    status: "In Progress",
    priority: "Medium",
  },
  {
    id: "TASK-7878",
    type: "Documentation",
    title: "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
    owner: "Bruno Lima",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-7839",
    type: "Bug",
    title: "We need to bypass the neural TCP card!",
    owner: "Carla Mendes",
    status: "Todo",
    priority: "High",
  },
  {
    id: "TASK-5562",
    type: "Feature",
    title: "The SAS interface is down, bypass the open-source pixel so we can back up ...",
    owner: "Diego Costa",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-8866",
    type: "Feature",
    title: "I’ll parse the wireless SSL protocol, that should driver the API panel!",
    owner: "Eduarda Nunes",
    status: "Canceled",
    priority: "Medium",
  },
  {
    id: "TASK-1280",
    type: "Bug",
    title: "Use the digital TLS panel, then you can transmit the haptic system!",
    owner: "Felipe Rocha",
    status: "Done",
    priority: "High",
  },
  {
    id: "TASK-7262",
    type: "Feature",
    title: "The UTF8 application is down, parse the neural bandwidth so we can back ...",
    owner: "Gabriela Alves",
    status: "Done",
    priority: "High",
  },
  {
    id: "TASK-1138",
    type: "Feature",
    title: "Generating the driver won’t do anything, we need to quantify the 1080p SM ...",
    owner: "Henrique Silva",
    status: "In Progress",
    priority: "Medium",
  },
  {
    id: "TASK-7184",
    type: "Feature",
    title: "We need to program the back-end THX pixel!",
    owner: "Isabela Ferreira",
    status: "Todo",
    priority: "Low",
  },
  {
    id: "TASK-5160",
    type: "Documentation",
    title: "Calculating the bus won’t do anything, we need to navigate the back-end J ...",
    owner: "João Pedro",
    status: "In Progress",
    priority: "High",
  },
  // extra fake tasks just for demo pagination
  {
    id: "TASK-9001",
    type: "Bug",
    title: "Investigate intermittent timeout in appointment confirmations.",
    owner: "Karen Souza",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "TASK-9002",
    type: "Feature",
    title: "Add color badges for appointment priority levels.",
    owner: "Lucas Pereira",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9003",
    type: "Documentation",
    title: "Document the new appointment reschedule flow for support team.",
    owner: "Mariana Santos",
    status: "Todo",
    priority: "Low",
  },
  {
    id: "TASK-9004",
    type: "Bug",
    title: "Fix layout shift when opening filters on small screens.",
    owner: "Natalia Ribeiro",
    status: "Todo",
    priority: "Medium",
  },
  {
    id: "TASK-9005",
    type: "Feature",
    title: "Allow bulk update of appointment status from table view.",
    owner: "Otávio Martins",
    status: "Backlog",
    priority: "High",
  },
  {
    id: "TASK-9006",
    type: "Feature",
    title: "Expose appointments API for mobile app integration.",
    owner: "Paula Fernandes",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "TASK-9007",
    type: "Documentation",
    title: "Update FAQ with common appointment cancellation questions.",
    owner: "Rafael Gomes",
    status: "In Progress",
    priority: "Low",
  },
  {
    id: "TASK-9008",
    type: "Bug",
    title: "Email reminders are not respecting user locale formatting.",
    owner: "Sara Oliveira",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9009",
    type: "Feature",
    title: "Create saved views for frequently used appointment filters.",
    owner: "Thiago Carvalho",
    status: "Todo",
    priority: "Medium",
  },
  {
    id: "TASK-9010",
    type: "Bug",
    title: "Scrolling jumps when selecting multiple appointment rows.",
    owner: "Vanessa Costa",
    status: "Todo",
    priority: "Low",
  },
  {
    id: "TASK-9011",
    type: "Documentation",
    title: "Write changelog entry for appointments dashboard redesign.",
    owner: "William Araújo",
    status: "Done",
    priority: "Low",
  },
  {
    id: "TASK-9012",
    type: "Feature",
    title: "Add quick action buttons inside each appointment row.",
    owner: "Ana Souza",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9013",
    type: "Bug",
    title: "Fix inconsistent timezone handling in appointment exports.",
    owner: "Bruno Lima",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "TASK-9014",
    type: "Feature",
    title: "Introduce tag-based labels for appointment categories.",
    owner: "Carla Mendes",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9015",
    type: "Documentation",
    title: "Record internal guide on how to triage new appointment issues.",
    owner: "Diego Costa",
    status: "Todo",
    priority: "Low",
  },
  {
    id: "TASK-9016",
    type: "Feature",
    title: "Add export to CSV button for filtered appointments.",
    owner: "Eduarda Nunes",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9017",
    type: "Bug",
    title: "Keyboard navigation skips the last appointment row.",
    owner: "Felipe Rocha",
    status: "Todo",
    priority: "Medium",
  },
  {
    id: "TASK-9018",
    type: "Feature",
    title: "Show appointment analytics summary above the table.",
    owner: "Gabriela Alves",
    status: "Backlog",
    priority: "High",
  },
  {
    id: "TASK-9019",
    type: "Bug",
    title: "Filter panel occasionally overlaps the pagination controls.",
    owner: "Henrique Silva",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "TASK-9020",
    type: "Documentation",
    title: "Clean up obsolete screenshots from the appointments documentation.",
    owner: "Isabela Ferreira",
    status: "Done",
    priority: "Low",
  },
  {
    id: "TASK-9021",
    type: "Feature",
    title: "Allow pinning important appointments to the top of the list.",
    owner: "João Pedro",
    status: "Backlog",
    priority: "High",
  },
  {
    id: "TASK-9022",
    type: "Bug",
    title: "Dark mode contrast is low for canceled appointment label.",
    owner: "Karen Souza",
    status: "Todo",
    priority: "Medium",
  },
  {
    id: "TASK-9023",
    type: "Feature",
    title: "Implement quick search by appointment ID in the header.",
    owner: "Lucas Pereira",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "TASK-9024",
    type: "Documentation",
    title: "Update API docs for new appointment webhooks.",
    owner: "Mariana Santos",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9025",
    type: "Feature",
    title: "Add inline editing for appointment notes.",
    owner: "Natalia Ribeiro",
    status: "Backlog",
    priority: "High",
  },
  {
    id: "TASK-9026",
    type: "Bug",
    title: "Loading skeleton sometimes appears over real appointment data.",
    owner: "Otávio Martins",
    status: "Todo",
    priority: "Low",
  },
  {
    id: "TASK-9027",
    type: "Feature",
    title: "Save user preferences for visible columns in local storage.",
    owner: "Paula Fernandes",
    status: "In Progress",
    priority: "Medium",
  },
  {
    id: "TASK-9028",
    type: "Bug",
    title: "Pagination displays wrong total when filters are active.",
    owner: "Rafael Gomes",
    status: "Backlog",
    priority: "High",
  },
  {
    id: "TASK-9029",
    type: "Documentation",
    title: "Describe appointment retention policy for compliance team.",
    owner: "Sara Oliveira",
    status: "Todo",
    priority: "Medium",
  },
  {
    id: "TASK-9030",
    type: "Feature",
    title: "Add quick filter chips for the most common appointment states.",
    owner: "Thiago Carvalho",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9031",
    type: "Bug",
    title: "Footer pagination buttons do not respect disabled state on last page.",
    owner: "Vanessa Costa",
    status: "Todo",
    priority: "Low",
  },
  {
    id: "TASK-9032",
    type: "Feature",
    title: "Allow exporting selected appointments only instead of full page.",
    owner: "William Araújo",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9033",
    type: "Documentation",
    title: "Write internal playbook on handling overbooked appointment slots.",
    owner: "Ana Souza",
    status: "In Progress",
    priority: "Low",
  },
  {
    id: "TASK-9034",
    type: "Feature",
    title: "Add side panel with full appointment details when clicking a row.",
    owner: "Bruno Lima",
    status: "Backlog",
    priority: "High",
  },
  {
    id: "TASK-9035",
    type: "Bug",
    title: "Filter by status resets when returning from appointment details page.",
    owner: "Carla Mendes",
    status: "Todo",
    priority: "Medium",
  },
  {
    id: "TASK-9036",
    type: "Feature",
    title: "Show small status icon next to each appointment ID.",
    owner: "Diego Costa",
    status: "Backlog",
    priority: "Low",
  },
  {
    id: "TASK-9037",
    type: "Documentation",
    title: "Clarify difference between canceled and no-show statuses in docs.",
    owner: "Eduarda Nunes",
    status: "Backlog",
    priority: "Low",
  },
  {
    id: "TASK-9038",
    type: "Bug",
    title: "Bulk actions bar overlaps header on very small screens.",
    owner: "Felipe Rocha",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "TASK-9039",
    type: "Feature",
    title: "Support color themes per appointment type to improve visual scanning.",
    owner: "Gabriela Alves",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9040",
    type: "Documentation",
    title: "Update onboarding docs to mention new appointments dashboard.",
    owner: "Henrique Silva",
    status: "Todo",
    priority: "Low",
  },
  {
    id: "TASK-9041",
    type: "Feature",
    title: "Add keyboard shortcut to jump directly to appointments section.",
    owner: "Isabela Ferreira",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9042",
    type: "Bug",
    title: "Search by patient name is case-sensitive and should not be.",
    owner: "João Pedro",
    status: "Backlog",
    priority: "High",
  },
  {
    id: "TASK-9043",
    type: "Feature",
    title: "Display last updated timestamp for the appointments list.",
    owner: "Karen Souza",
    status: "Backlog",
    priority: "Low",
  },
  {
    id: "TASK-9044",
    type: "Documentation",
    title: "Add section about appointment permissions and roles.",
    owner: "Lucas Pereira",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9045",
    type: "Bug",
    title: "Appointment labels are not read correctly by screen readers.",
    owner: "Mariana Santos",
    status: "Todo",
    priority: "High",
  },
  {
    id: "TASK-9046",
    type: "Feature",
    title: "Provide quick actions for confirming or canceling directly in the list.",
    owner: "Natalia Ribeiro",
    status: "Backlog",
    priority: "High",
  },
  {
    id: "TASK-9047",
    type: "Documentation",
    title: "Document the event stream used for real-time appointment updates.",
    owner: "Otávio Martins",
    status: "In Progress",
    priority: "Medium",
  },
  {
    id: "TASK-9048",
    type: "Feature",
    title: "Allow grouping appointments by day or practitioner.",
    owner: "Paula Fernandes",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9049",
    type: "Bug",
    title: "Appointment filter chips are not cleared when pressing the reset button.",
    owner: "Rafael Gomes",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9050",
    type: "Feature",
    title: "Show quick stats for total confirmed, pending, and canceled appointments.",
    owner: "Sara Oliveira",
    status: "Backlog",
    priority: "Low",
  },
  {
    id: "TASK-9051",
    type: "Bug",
    title: "Time picker in appointment form allows invalid ranges.",
    owner: "Thiago Carvalho",
    status: "Todo",
    priority: "High",
  },
  {
    id: "TASK-9052",
    type: "Feature",
    title: "Add preset filters for 'Today', 'This week' and 'This month'.",
    owner: "Vanessa Costa",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9053",
    type: "Documentation",
    title: "Explain how appointment reminders are scheduled in the background jobs.",
    owner: "William Araújo",
    status: "Backlog",
    priority: "Low",
  },
  {
    id: "TASK-9054",
    type: "Feature",
    title: "Enable drag and drop reordering of appointments within the same day.",
    owner: "Ana Souza",
    status: "Backlog",
    priority: "High",
  },
  {
    id: "TASK-9055",
    type: "Bug",
    title: "Appointment list does not update after bulk status change until refresh.",
    owner: "Bruno Lima",
    status: "In Progress",
    priority: "High",
  },
  {
    id: "TASK-9056",
    type: "Feature",
    title: "Support saving custom table layouts per user profile.",
    owner: "Carla Mendes",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9057",
    type: "Documentation",
    title: "Add troubleshooting guide for missing appointment notifications.",
    owner: "Diego Costa",
    status: "Todo",
    priority: "Medium",
  },
  {
    id: "TASK-9058",
    type: "Feature",
    title: "Display appointment source (web, phone, app) as an extra column.",
    owner: "Eduarda Nunes",
    status: "Backlog",
    priority: "Low",
  },
  {
    id: "TASK-9059",
    type: "Bug",
    title: "Sticky header overlaps first row when zoom level is increased.",
    owner: "Felipe Rocha",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9060",
    type: "Feature",
    title: "Allow exporting appointment list in XLSX format.",
    owner: "Gabriela Alves",
    status: "Backlog",
    priority: "Medium",
  },
  // extra pages of fake tasks (visual/demo only)
  {
    id: "TASK-9061",
    type: "Documentation",
    title: "Describe pagination behavior and edge cases for appointments list.",
    owner: "Ana Souza",
    status: "Backlog",
    priority: "Low",
  },
  {
    id: "TASK-9062",
    type: "Bug",
    title: "Clicking next page resets selected filters unexpectedly.",
    owner: "Bruno Lima",
    status: "Backlog",
    priority: "High",
  },
  {
    id: "TASK-9063",
    type: "Feature",
    title: "Persist last visited appointments page between sessions.",
    owner: "Carla Mendes",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9064",
    type: "Bug",
    title: "High contrast mode does not apply to pagination controls.",
    owner: "Diego Costa",
    status: "Todo",
    priority: "High",
  },
  {
    id: "TASK-9065",
    type: "Feature",
    title: "Support infinite scroll as an alternative to pagination.",
    owner: "Eduarda Nunes",
    status: "Backlog",
    priority: "Low",
  },
  {
    id: "TASK-9066",
    type: "Bug",
    title: "Ellipsis icon sometimes shows even when there is only one page.",
    owner: "Felipe Rocha",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9067",
    type: "Feature",
    title: "Add quick jump input to go directly to a specific page.",
    owner: "Gabriela Alves",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9068",
    type: "Documentation",
    title: "Document keyboard shortcuts for navigating appointment pages.",
    owner: "Henrique Silva",
    status: "Todo",
    priority: "Low",
  },
  {
    id: "TASK-9069",
    type: "Bug",
    title: "Mobile layout cuts off last appointment row when pagination is visible.",
    owner: "Isabela Ferreira",
    status: "Backlog",
    priority: "High",
  },
  {
    id: "TASK-9070",
    type: "Feature",
    title: "Add compact density option to fit more appointments per page.",
    owner: "João Pedro",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9071",
    type: "Documentation",
    title: "Create visual examples of each appointment priority combination.",
    owner: "Karen Souza",
    status: "Backlog",
    priority: "Low",
  },
  {
    id: "TASK-9072",
    type: "Bug",
    title: "Sorting by priority does not keep secondary sort by date stable.",
    owner: "Lucas Pereira",
    status: "Todo",
    priority: "Medium",
  },
  {
    id: "TASK-9073",
    type: "Feature",
    title: "Add toggle to show completed appointments on separate tab.",
    owner: "Mariana Santos",
    status: "Backlog",
    priority: "Low",
  },
  {
    id: "TASK-9074",
    type: "Bug",
    title: "Scrolling to top after changing page causes slight layout jump.",
    owner: "Natalia Ribeiro",
    status: "Backlog",
    priority: "Low",
  },
  {
    id: "TASK-9075",
    type: "Feature",
    title: "Allow multi-select actions to span across pages when desired.",
    owner: "Otávio Martins",
    status: "Backlog",
    priority: "High",
  },
  {
    id: "TASK-9076",
    type: "Documentation",
    title: "Explain how pagination interacts with real-time updates.",
    owner: "Paula Fernandes",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9077",
    type: "Bug",
    title: "Appointment count badge does not always match visible rows.",
    owner: "Rafael Gomes",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-9078",
    type: "Feature",
    title: "Show a small loading indicator when changing pages.",
    owner: "Sara Oliveira",
    status: "Todo",
    priority: "Low",
  },
  {
    id: "TASK-9079",
    type: "Bug",
    title: "Tooltip for page numbers is misaligned in RTL languages.",
    owner: "Thiago Carvalho",
    status: "Backlog",
    priority: "Low",
  },
  {
    id: "TASK-9080",
    type: "Feature",
    title: "Expose pagination state to analytics for usage tracking.",
    owner: "Vanessa Costa",
    status: "Backlog",
    priority: "Low",
  },
]

const tasksTableHeadClass =
  "text-sm font-semibold tracking-tight text-[var(--tasks-table-header-fg)] normal-case"

const tasksTableCol = {
  task: "w-[9%] min-w-[5.5rem] pl-4",
  owner: "w-[11%] min-w-[7rem]",
  title: "min-w-0 w-[38%]",
  status: "w-[10%] min-w-[5.5rem] pl-0",
  date: "w-[8%] min-w-[4.5rem]",
  time: "w-[7%] min-w-[4rem]",
  priority: "w-[9%] min-w-[5rem]",
  action: "w-[8%] min-w-[3rem] pr-4 text-right",
} as const

export function AppointmentsTasks({
  page = 1,
  pageSize = 20,
  showCreateAtendimentoButton = false,
  showEncerradoStatusFilter = true,
  historicoPage = false,
  filaAtendimentosPage = false,
  meusAtendimentosPage = false,
}: {
  page?: number
  pageSize?: number
  showCreateAtendimentoButton?: boolean
  showEncerradoStatusFilter?: boolean
  historicoPage?: boolean
  filaAtendimentosPage?: boolean
  meusAtendimentosPage?: boolean
}) {
  const { openCreateAtendimento } = useCreateAtendimento()

  const [statusFilter, setStatusFilter] = useState<Array<Task["status"]>>(() => {
    if (historicoPage) return ["Canceled"]
    if (filaAtendimentosPage) {
      return ["Todo", "In Progress", "Backlog", "Canceled", "Done"]
    }
    if (showEncerradoStatusFilter) {
      return ["Todo", "In Progress", "Canceled"]
    }
    return ["Todo", "In Progress"]
  })
  const [priorityFilter, setPriorityFilter] = useState<Array<Task["priority"]>>([
    "Low",
    "Medium",
    "High",
  ])
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [pendingDateFilter, setPendingDateFilter] = useState<Date | undefined>(
    undefined,
  )
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTasks = appointmentsTasksData.filter((task) => {
    if (historicoPage) {
      if (task.status !== "Canceled") {
        return false
      }
    } else if (meusAtendimentosPage) {
      if (task.status !== "In Progress") {
        return false
      }
    } else if (!filaAtendimentosPage) {
      if (task.status === "Backlog" || task.status === "Done") {
        return false
      }
      if (!showEncerradoStatusFilter && task.status === "Canceled") {
        return false
      }
    }

    const matchesStatus =
      historicoPage || meusAtendimentosPage
        ? true
        : statusFilter.length === 0 || statusFilter.includes(task.status)

    const matchesPriority =
      priorityFilter.length === 0 || priorityFilter.includes(task.priority)

    let matchesDate = true
    if (dateFilter) {
      const openedAt =
        task.openedAt
          ? new Date(task.openedAt)
          : new Date(
              new Date("2026-03-01T09:00:00").getTime() +
                appointmentsTasksData.indexOf(task) * 60 * 60 * 1000,
            )

      matchesDate =
        openedAt.getFullYear() === dateFilter.getFullYear() &&
        openedAt.getMonth() === dateFilter.getMonth() &&
        openedAt.getDate() === dateFilter.getDate()
    }

    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      q.length === 0 ||
      task.owner.toLowerCase().includes(q) ||
      task.title.toLowerCase().includes(q) ||
      task.id.toLowerCase().includes(q)

    return matchesStatus && matchesPriority && matchesDate && matchesSearch
  })

  const totalItems = filteredTasks.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const start = (page - 1) * pageSize
  const visibleTasks = filteredTasks.slice(start, start + pageSize)
  const openedAtDateFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  })
  const openedAtTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeStyle: "short",
  })

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden px-4 pt-4 pb-3 sm:px-6">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              filaAtendimentosPage
                ? "Buscar por responsável, título ou ID..."
                : "Filtrar tarefas..."
            }
            className="h-8 w-full min-w-0 sm:w-72"
          />
          <DropdownMenu open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="cursor-pointer rounded-full font-semibold shadow-sm"
              >
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[260px] space-y-3">
              {!historicoPage && !meusAtendimentosPage ? (
                <>
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Status
                    </span>
                    <div className="space-y-1.5">
                      {filaAtendimentosPage ? (
                        <>
                          <DropdownMenuCheckboxItem
                            className="cursor-pointer"
                            onSelect={(event) => event.preventDefault()}
                            checked={statusFilter.includes("Todo")}
                            onCheckedChange={(checked) => {
                              setStatusFilter((current) =>
                                checked
                                  ? [...current, "Todo"]
                                  : current.filter((value) => value !== "Todo"),
                              )
                            }}
                          >
                            <span className="flex w-full items-center justify-between gap-4 whitespace-nowrap">
                              <span>Aberto</span>
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            </span>
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            className="cursor-pointer"
                            onSelect={(event) => event.preventDefault()}
                            checked={statusFilter.includes("In Progress")}
                            onCheckedChange={(checked) => {
                              setStatusFilter((current) =>
                                checked
                                  ? [...current, "In Progress"]
                                  : current.filter(
                                      (value) => value !== "In Progress",
                                    ),
                              )
                            }}
                          >
                            <span className="flex w-full items-center justify-between gap-4 whitespace-nowrap">
                              <span>Em andamento</span>
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            </span>
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            className="cursor-pointer"
                            onSelect={(event) => event.preventDefault()}
                            checked={statusFilter.includes("Backlog")}
                            onCheckedChange={(checked) => {
                              setStatusFilter((current) =>
                                checked
                                  ? [...current, "Backlog"]
                                  : current.filter((value) => value !== "Backlog"),
                              )
                            }}
                          >
                            <span className="flex w-full items-center justify-between gap-4 whitespace-nowrap">
                              <span>Pausado</span>
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            </span>
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            className="cursor-pointer"
                            onSelect={(event) => event.preventDefault()}
                            checked={statusFilter.includes("Canceled")}
                            onCheckedChange={(checked) => {
                              setStatusFilter((current) =>
                                checked
                                  ? [...current, "Canceled"]
                                  : current.filter(
                                      (value) => value !== "Canceled",
                                    ),
                              )
                            }}
                          >
                            <span className="flex w-full items-center justify-between gap-4 whitespace-nowrap">
                              <span>Encerrado</span>
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            </span>
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            className="cursor-pointer"
                            onSelect={(event) => event.preventDefault()}
                            checked={statusFilter.includes("Done")}
                            onCheckedChange={(checked) => {
                              setStatusFilter((current) =>
                                checked
                                  ? [...current, "Done"]
                                  : current.filter((value) => value !== "Done"),
                              )
                            }}
                          >
                            <span className="flex w-full items-center justify-between gap-4 whitespace-nowrap">
                              <span>Concluído</span>
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            </span>
                          </DropdownMenuCheckboxItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuCheckboxItem
                            className="cursor-pointer"
                            onSelect={(event) => event.preventDefault()}
                            checked={statusFilter.includes("Todo")}
                            onCheckedChange={(checked) => {
                              setStatusFilter((current) =>
                                checked
                                  ? [...current, "Todo"]
                                  : current.filter((value) => value !== "Todo"),
                              )
                            }}
                          >
                            <span className="flex w-full items-center justify-between gap-4 whitespace-nowrap">
                              <span>Aberto</span>
                              <span className="text-xs text-muted-foreground">21</span>
                            </span>
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            className="cursor-pointer"
                            onSelect={(event) => event.preventDefault()}
                            checked={statusFilter.includes("In Progress")}
                            onCheckedChange={(checked) => {
                              setStatusFilter((current) =>
                                checked
                                  ? [...current, "In Progress"]
                                  : current.filter(
                                      (value) => value !== "In Progress",
                                    ),
                              )
                            }}
                          >
                            <span className="flex w-full items-center justify-between gap-4 whitespace-nowrap">
                              <span>Em andamento</span>
                              <span className="text-xs text-muted-foreground">21</span>
                            </span>
                          </DropdownMenuCheckboxItem>
                          {showEncerradoStatusFilter ? (
                            <DropdownMenuCheckboxItem
                              className="cursor-pointer"
                              onSelect={(event) => event.preventDefault()}
                              checked={statusFilter.includes("Canceled")}
                              onCheckedChange={(checked) => {
                                setStatusFilter((current) =>
                                  checked
                                    ? [...current, "Canceled"]
                                    : current.filter(
                                        (value) => value !== "Canceled",
                                      ),
                                )
                              }}
                            >
                              <span className="flex w-full items-center justify-between gap-4 whitespace-nowrap">
                                <span>Encerrado</span>
                                <span className="text-xs text-muted-foreground">
                                  19
                                </span>
                              </span>
                            </DropdownMenuCheckboxItem>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                </>
              ) : null}

              <div className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Prioridade
                </span>
                <div className="space-y-1.5">
                  <DropdownMenuCheckboxItem
                    className="cursor-pointer"
                    onSelect={(event) => event.preventDefault()}
                    checked={priorityFilter.includes("Low")}
                    onCheckedChange={(checked) => {
                      setPriorityFilter((current) =>
                        checked
                          ? [...current, "Low"]
                          : current.filter((value) => value !== "Low"),
                      )
                    }}
                  >
                    <span className="flex w-full items-center justify-between gap-3 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <ArrowDownIcon className="size-3 shrink-0 text-green-500 dark:text-green-400" />
                        <span>Baixa</span>
                      </span>
                      <span className="text-xs text-muted-foreground">36</span>
                    </span>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="cursor-pointer"
                    onSelect={(event) => event.preventDefault()}
                    checked={priorityFilter.includes("Medium")}
                    onCheckedChange={(checked) => {
                      setPriorityFilter((current) =>
                        checked
                          ? [...current, "Medium"]
                          : current.filter((value) => value !== "Medium"),
                      )
                    }}
                  >
                    <span className="flex w-full items-center justify-between gap-3 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <ArrowRightIcon className="size-3 shrink-0 text-amber-400 dark:text-amber-300" />
                        <span>Média</span>
                      </span>
                      <span className="text-xs text-muted-foreground">33</span>
                    </span>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="cursor-pointer"
                    onSelect={(event) => event.preventDefault()}
                    checked={priorityFilter.includes("High")}
                    onCheckedChange={(checked) => {
                      setPriorityFilter((current) =>
                        checked
                          ? [...current, "High"]
                          : current.filter((value) => value !== "High"),
                      )
                    }}
                  >
                    <span className="flex w-full items-center justify-between gap-3 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <ArrowUpIcon className="size-3 shrink-0 text-red-500 dark:text-red-400" />
                        <span>Alta</span>
                      </span>
                      <span className="text-xs text-muted-foreground">31</span>
                    </span>
                  </DropdownMenuCheckboxItem>
                </div>
              </div>

              <DropdownMenuSeparator />

              <div className="space-y-2">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Data de abertura
                </span>
                <div className="space-y-2 rounded-md border border-border bg-card p-2">
                  <Calendar
                    mode="single"
                    selected={pendingDateFilter}
                    onSelect={(date) => setPendingDateFilter(date ?? undefined)}
                    showOutsideDays
                    locale={{ code: "pt-BR" } as any}
                    className="mx-auto bg-transparent p-0"
                  />
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      className="cursor-pointer rounded-full font-semibold shadow-sm"
                      onClick={() => {
                        setPendingDateFilter(undefined)
                        setDateFilter(undefined)
                      }}
                    >
                      Limpar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="cursor-pointer rounded-full font-semibold shadow-sm"
                      onClick={() => {
                        setDateFilter(pendingDateFilter)
                        setFiltersOpen(false)
                      }}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {showCreateAtendimentoButton ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="cursor-pointer gap-2 rounded-full font-semibold shadow-sm"
              onClick={openCreateAtendimento}
            >
              <CirclePlusIcon className="size-4 shrink-0 text-red-500" />
              Criar Atendimento
            </Button>
          </div>
        ) : null}
      </div>

      <div className="-mt-1 flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden rounded-lg border border-border bg-[var(--tasks-table-surface)]">
        <div className="scrollbar-tasks-table min-h-0 flex-1 overflow-auto">
          <table className="w-full caption-bottom text-sm table-fixed">
            <TableHeader className="bg-transparent [&_tr]:border-0 [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:border-b [&_th]:border-border [&_th]:bg-[var(--tasks-table-header-bg)]">
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className={`${tasksTableCol.task} ${tasksTableHeadClass}`}>
                  Tarefa
                </TableHead>
                <TableHead className={`${tasksTableCol.owner} ${tasksTableHeadClass}`}>
                  Responsável
                </TableHead>
                <TableHead className={`${tasksTableCol.title} ${tasksTableHeadClass}`}>
                  Título
                </TableHead>
                <TableHead className={`${tasksTableCol.status} ${tasksTableHeadClass}`}>
                  Status
                </TableHead>
                <TableHead className={`${tasksTableCol.date} ${tasksTableHeadClass}`}>
                  Data
                </TableHead>
                <TableHead className={`${tasksTableCol.time} ${tasksTableHeadClass}`}>
                  Horário
                </TableHead>
                <TableHead className={`${tasksTableCol.priority} ${tasksTableHeadClass}`}>
                  Prioridade
                </TableHead>
                <TableHead className={`${tasksTableCol.action} ${tasksTableHeadClass}`}>
                  Ação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
          {visibleTasks.map((task, index) => {
            const globalIndex = start + index
            const openedAtDate = task.openedAt
              ? new Date(task.openedAt)
              : new Date(new Date("2026-03-01T09:00:00").getTime() + globalIndex * 60 * 60 * 1000)
            const openedAtDateLabel = openedAtDateFormatter.format(openedAtDate)
            const openedAtTimeLabel = openedAtTimeFormatter.format(openedAtDate)
            const priorityLabel =
              task.priority === "High"
                ? "Alta"
                : task.priority === "Medium"
                  ? "Média"
                  : "Baixa"
            const statusLabel =
              task.status === "Todo"
                ? "Aberto"
                : task.status === "In Progress"
                  ? "Em andamento"
                  : task.status === "Backlog"
                    ? "Pausado"
                    : task.status === "Done"
                      ? "Concluído"
                      : "Encerrado"

            return (
              <TableRow
                key={task.id}
                className="border-border hover:bg-muted/40 dark:hover:bg-white/[0.06]"
              >
                <TableCell
                  className={`${tasksTableCol.task} whitespace-nowrap text-sm font-medium text-foreground`}
                >
                  {task.id}
                </TableCell>
                <TableCell
                  className={`${tasksTableCol.owner} whitespace-nowrap text-sm text-foreground`}
                >
                  {task.owner}
                </TableCell>
                <TableCell className={`${tasksTableCol.title} space-y-1 text-foreground`}>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {task.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell
                  className={`${tasksTableCol.status} whitespace-nowrap text-sm text-foreground`}
                >
                  {statusLabel}
                </TableCell>
                <TableCell
                  className={`${tasksTableCol.date} whitespace-nowrap text-sm text-foreground`}
                >
                  {openedAtDateLabel}
                </TableCell>
                <TableCell
                  className={`${tasksTableCol.time} whitespace-nowrap text-sm text-foreground`}
                >
                  {openedAtTimeLabel}
                </TableCell>
                <TableCell
                  className={`${tasksTableCol.priority} whitespace-nowrap text-sm text-foreground`}
                >
                  <div className="flex items-center gap-1.5">
                    {task.priority === "High" ? (
                      <ArrowUpIcon className="size-3 shrink-0 text-red-500 dark:text-red-400" />
                    ) : task.priority === "Medium" ? (
                      <ArrowRightIcon className="size-3 shrink-0 text-amber-400 dark:text-amber-300" />
                    ) : (
                      <ArrowDownIcon className="size-3 shrink-0 text-green-500 dark:text-green-400" />
                    )}
                    <span>{priorityLabel}</span>
                  </div>
                </TableCell>
                <TableCell
                  className={`${tasksTableCol.action} text-foreground`}
                >
                  <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 cursor-pointer text-foreground hover:bg-muted hover:text-foreground"
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-44">
                      <DropdownMenuItem className="cursor-pointer">
                        <ArrowLeftRightIcon />
                        Transferir
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Building2Icon />
                        Alterar setor
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <EyeIcon />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <HandMetalIcon />
                        Pegar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" className="cursor-pointer">
                        <XCircleIcon />
                        Encerrar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
            </TableBody>
          </table>
        </div>

        <footer
          className="shrink-0 border-t border-border bg-[var(--tasks-table-header-bg)] px-4 py-1.5"
          aria-label="Rodapé da lista de atendimentos"
        />
      </div>
    </div>
  )
}

