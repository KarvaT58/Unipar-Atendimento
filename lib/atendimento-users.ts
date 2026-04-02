/** Logged-in agent id used when claiming a task from the queue (mock). */
export const ATENDIMENTO_CURRENT_USER_ID = "user-me"

/**
 * Mock: setor do agente logado. Notas internas no chat ficam visíveis só para
 * atendentes do mesmo setor; o solicitante não vê. Transferências futuras devem
 * checar o setor do atendente destino em relação a este id.
 */
export const ATENDIMENTO_CURRENT_AGENT_SECTOR_ID = "setor-suporte-n1"

/** Display profile for the current agent (matches dashboard user mock). */
export const atendimentoCurrentAgentDisplay = {
  name: "Carlos Nunes",
  avatarUrl:
    "https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosNunes&backgroundColor=b6e3f4",
} as const

export function atendimentoAvatarUrlFromSeed(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e0e7ff`
}

/** Avatar for the ticket requester (mock: derived from display name). */
export function atendimentoSolicitanteAvatarUrl(ownerName: string): string {
  return atendimentoAvatarUrlFromSeed(ownerName)
}

/** Outros agentes da equipe (mock por id — claim futuro / API). */
const ATENDIMENTO_TEAM_BY_ID: Record<string, { name: string }> = {
  "user-ana": { name: "Ana Souza" },
  "user-bruno": { name: "Bruno Lima" },
  "user-mariana": { name: "Mariana Santos" },
}

function displayNameForAgentId(agentId: string): string {
  const entry = ATENDIMENTO_TEAM_BY_ID[agentId]
  if (entry) return entry.name
  if (agentId.startsWith("user-")) {
    const slug = agentId.slice(5).replace(/-/g, " ").trim()
    if (!slug) return "Atendente"
    return slug
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")
  }
  return "Atendente"
}

export function resolveTaskAtendente(
  claimedByUserId: string | null | undefined,
): { name: string; avatarUrl: string } | null {
  if (claimedByUserId == null) return null
  if (claimedByUserId === ATENDIMENTO_CURRENT_USER_ID) {
    return {
      name: atendimentoCurrentAgentDisplay.name,
      avatarUrl: atendimentoCurrentAgentDisplay.avatarUrl,
    }
  }
  const name = displayNameForAgentId(claimedByUserId)
  return {
    name,
    avatarUrl: atendimentoAvatarUrlFromSeed(claimedByUserId),
  }
}
