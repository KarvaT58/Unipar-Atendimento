/** Logged-in agent id used when claiming a task from the queue (mock). */
export const ATENDIMENTO_CURRENT_USER_ID = "user-me"

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
  return {
    name: "Atendente",
    avatarUrl: atendimentoAvatarUrlFromSeed(claimedByUserId),
  }
}
