export type StoredProfile = {
  name: string
  email: string
  department: string
  photo: string | null
}

export const profileStorageKey = "unipar.profile"
export const profileUpdatedEventName = "unipar:profile-updated"

export const defaultStoredProfile: StoredProfile = {
  name: "Colaborador Unipar",
  email: "colaborador@unipar.br",
  department: "Atendimento",
  photo: null,
}

export function normalizeStoredProfile(value: unknown): StoredProfile {
  const candidate =
    typeof value === "object" && value !== null
      ? (value as Partial<Record<keyof StoredProfile, unknown>>)
      : {}

  return {
    name:
      typeof candidate.name === "string" && candidate.name.trim().length > 0
        ? candidate.name
        : defaultStoredProfile.name,
    email:
      typeof candidate.email === "string" && candidate.email.trim().length > 0
        ? candidate.email
        : defaultStoredProfile.email,
    department:
      typeof candidate.department === "string" && candidate.department.trim().length > 0
        ? candidate.department
        : defaultStoredProfile.department,
    photo:
      typeof candidate.photo === "string" && candidate.photo.trim().length > 0
        ? candidate.photo
        : null,
  }
}

function parseStoredProfile(raw: string | null): StoredProfile {
  if (!raw) {
    return defaultStoredProfile
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return normalizeStoredProfile(parsed)
  } catch {
    return defaultStoredProfile
  }
}

export function toNavUser(profile: StoredProfile) {
  return {
    name: profile.name,
    email: profile.email,
    avatar: profile.photo ?? "",
  }
}

export function readStoredProfile(): StoredProfile {
  if (typeof window === "undefined") {
    return defaultStoredProfile
  }

  return parseStoredProfile(window.localStorage.getItem(profileStorageKey))
}

export function updateStoredProfilePhoto(photo: string | null) {
  if (typeof window === "undefined") {
    return
  }

  const nextProfile: StoredProfile = {
    ...readStoredProfile(),
    photo,
  }

  window.localStorage.setItem(
    profileStorageKey,
    JSON.stringify(nextProfile),
  )

  window.dispatchEvent(new CustomEvent(profileUpdatedEventName))
}

export function writeStoredProfile(profile: StoredProfile) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(profileStorageKey, JSON.stringify(profile))
  window.dispatchEvent(new CustomEvent(profileUpdatedEventName))
}
