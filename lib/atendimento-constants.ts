export type AtendimentoChatSource =
  | "fila"
  | "meus-chamados"
  | "meus-atendimentos"
  | "historico"
  | "default"

/** sessionStorage: reabre o chat após F5 na mesma rota de atendimentos. */
export const ATENDIMENTO_CHAT_STORAGE_KEY = "unipar-atendimento-open-chat"

export type AtendimentoChatPersisted = {
  taskId: string
  source: AtendimentoChatSource
  pathname: string
}

const ATENDIMENTO_PATH_PREFIX = "/dashboard/atendimentos"

/** Fonte do chat conforme a rota atual (deve bater com `resolveChatSourceForPage`). */
export function atendimentoChatSourceFromPathname(
  pathname: string | null,
): AtendimentoChatSource | null {
  if (!pathname?.startsWith(ATENDIMENTO_PATH_PREFIX)) return null
  if (pathname.includes("/fila-de-atendimentos")) return "fila"
  if (pathname.includes("/meus-chamados")) return "meus-chamados"
  if (pathname.includes("/meus-atendimentos")) return "meus-atendimentos"
  if (pathname.includes("/historico")) return "historico"
  return "default"
}
