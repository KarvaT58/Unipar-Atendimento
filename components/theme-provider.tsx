"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { usePathname } from "next/navigation"

function ThemeRouteEnforcer() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    const isLandingPage = pathname === "/"
    // Land page is always dark; other routes may use light/dark.
    if (isLandingPage && resolvedTheme !== "dark") {
      setTheme("dark")
    }
  }, [pathname, resolvedTheme, setTheme])

  return null
}

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      <ThemeRouteEnforcer />
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
