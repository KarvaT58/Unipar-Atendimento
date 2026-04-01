"use client"

import { DoorOpenIcon } from "lucide-react"
import Link from "next/link"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

export function HeroHeader() {
  return (
    <header>
      <nav className="fixed z-20 w-full bg-transparent">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 lg:py-4">
            <Link href="/" aria-label="Início" className="flex items-center space-x-2">
              <Logo />
            </Link>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button asChild size="sm">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2"
                >
                  Entrar
                  <DoorOpenIcon
                    className="size-4 shrink-0 text-red-500"
                    aria-hidden
                  />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/signup">Solicitar acesso</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
