// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest"

import {
  accessRequestsStorageKey,
  getSignupAccessRequestInput,
  submitSignupAccessRequest,
} from "./signup-access-request"

function createFormData() {
  const formData = new FormData()
  formData.set("name", "Maria Silva")
  formData.set("email", "maria@example.com")
  formData.set("department", "TI")
  formData.set("cpf", "529.982.247-25")
  formData.set("confirmCpf", "52998224725")
  return formData
}

describe("signup-access-request", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  describe("getSignupAccessRequestInput", () => {
    it("returns normalized input when CPF fields are equivalent", () => {
      expect(getSignupAccessRequestInput(createFormData())).toEqual({
        name: "Maria Silva",
        email: "maria@example.com",
        department: "TI",
        cpf: "52998224725",
      })
    })

    it("returns null when CPF confirmation does not match", () => {
      const formData = createFormData()
      formData.set("confirmCpf", "11111111111")

      expect(getSignupAccessRequestInput(formData)).toBeNull()
    })

    it("returns null when CPF is not 11 digits", () => {
      const formData = createFormData()
      formData.set("cpf", "123")
      formData.set("confirmCpf", "123")

      expect(getSignupAccessRequestInput(formData)).toBeNull()
    })
  })

  describe("submitSignupAccessRequest", () => {
    it("appends a request to localStorage with id and requestedAt", () => {
      const uuid = "test-uuid-1"
      vi.stubGlobal("crypto", { randomUUID: () => uuid })

      submitSignupAccessRequest({
        name: "João",
        email: "joao@example.com",
        department: "RH",
        cpf: "12345678901",
      })

      const stored = JSON.parse(
        window.localStorage.getItem(accessRequestsStorageKey) ?? "[]",
      ) as unknown[]

      expect(stored).toHaveLength(1)
      expect(stored[0]).toMatchObject({
        id: uuid,
        name: "João",
        email: "joao@example.com",
        department: "RH",
        cpf: "12345678901",
      })
      expect(typeof (stored[0] as { requestedAt: string }).requestedAt).toBe("string")
    })
  })
})
