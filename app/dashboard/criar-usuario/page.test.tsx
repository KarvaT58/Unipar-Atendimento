// @vitest-environment jsdom

import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"

import CreateUserPage from "./page"

describe("CreateUserPage route", () => {
  it("renders an empty placeholder like other dashboard sections", () => {
    const { container } = render(<CreateUserPage />)
    const root = container.firstElementChild

    expect(root).toBeTruthy()
    expect(root?.className).toMatch(/flex/)
    expect(root?.className).toMatch(/flex-1/)
  })
})
