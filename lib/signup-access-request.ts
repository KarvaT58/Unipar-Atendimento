export type AccessRequestInput = {
  name: string
  email: string
  department: string
  cpf: string
}

export type AccessRequest = AccessRequestInput & {
  id: string
  requestedAt: string
}

export const accessRequestsStorageKey = "unipar.user-management.access-requests"

export const accessRequestsUpdatedEventName =
  "unipar:user-management-access-requests-updated"

function normalizeCpf(raw: string) {
  return raw.replace(/\D/g, "")
}

function isValidCpfDigits(cpf: string) {
  return cpf.length === 11 && /^\d+$/.test(cpf)
}

export function getSignupAccessRequestInput(
  formData: FormData,
): AccessRequestInput | null {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const department = String(formData.get("department") ?? "").trim()
  const cpf = normalizeCpf(String(formData.get("cpf") ?? ""))
  const confirmCpf = normalizeCpf(String(formData.get("confirmCpf") ?? ""))

  if (!name || !email || !department) {
    return null
  }

  if (!isValidCpfDigits(cpf) || cpf !== confirmCpf) {
    return null
  }

  return { name, email, department, cpf }
}

function parseStoredRequests(raw: string | null): AccessRequest[] {
  if (!raw) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isAccessRequest)
  } catch {
    return []
  }
}

function isAccessRequest(value: unknown): value is AccessRequest {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.email === "string" &&
    typeof record.department === "string" &&
    typeof record.cpf === "string" &&
    typeof record.requestedAt === "string"
  )
}

function readStoredAccessRequests(): AccessRequest[] {
  if (typeof window === "undefined") {
    return []
  }

  return parseStoredRequests(window.localStorage.getItem(accessRequestsStorageKey))
}

function persistAccessRequests(requests: AccessRequest[]) {
  window.localStorage.setItem(accessRequestsStorageKey, JSON.stringify(requests))
  window.dispatchEvent(new CustomEvent(accessRequestsUpdatedEventName))
}

export function getStoredAccessRequests(): AccessRequest[] {
  return readStoredAccessRequests()
}

export function submitSignupAccessRequest(input: AccessRequestInput) {
  if (typeof window === "undefined") {
    return
  }

  const request: AccessRequest = {
    ...input,
    id: crypto.randomUUID(),
    requestedAt: new Date().toISOString(),
  }

  const next = [...readStoredAccessRequests(), request]
  persistAccessRequests(next)
}
