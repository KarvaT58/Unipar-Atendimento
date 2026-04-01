"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import {
  HistoryIcon,
  InfoIcon,
  KanbanSquareIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  ListIcon,
  MessagesSquareIcon,
  WalletCardsIcon,
  type LucideIcon,
} from "lucide-react"

import { HeroHeader } from "@/components/header"
import { Button } from "@/components/ui/button"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { ProgressiveBlur } from "@/components/ui/progressive-blur"
import { cn } from "@/lib/utils"

const HERO_IMAGE = "/login.png"

const sliderItems: { label: string; icon: LucideIcon }[] = [
  { label: "Dashboard", icon: LayoutDashboardIcon },
  { label: "Atendimentos", icon: ListIcon },
  { label: "Chat interno", icon: MessagesSquareIcon },
  { label: "Kanban", icon: KanbanSquareIcon },
  { label: "Ideias", icon: LightbulbIcon },
  { label: "Empréstimos", icon: WalletCardsIcon },
  { label: "Históricos", icon: HistoryIcon },
  { label: "Ajuda", icon: InfoIcon },
]

function LoadingExperienceSplash({ isExiting }: { isExiting: boolean }) {
  return (
    <div className="fixed inset-0 z-[999] overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0a0a0a_0%,#111313_45%,#0a0a0a_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.24),transparent_34%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,0,0,0.18),transparent_24%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_68%,rgba(255,0,0,0.14),transparent_26%)]" />

      <div className="absolute top-[80px] left-[-140px] h-[360px] w-[360px] rounded-full bg-[#ff0000]/30 blur-[140px]" />
      <div className="absolute top-[180px] right-[-120px] h-[300px] w-[300px] rounded-full bg-[#ff0000]/18 blur-[130px]" />
      <div className="absolute bottom-[-140px] left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#ff0000]/16 blur-[150px]" />

      <div className="relative flex h-full items-center justify-center px-6">
        <div
          className={cn(
            "w-full max-w-2xl text-center transition-all duration-700",
            isExiting && "-translate-y-4 scale-95 opacity-0",
          )}
        >
          <div className="mb-6 flex items-center justify-center gap-3 md:gap-4">
            <Image
              src="/logo.png"
              alt="Logo da Unipar"
              width={56}
              height={56}
              className="h-10 w-10 shrink-0 object-contain md:h-14 md:w-14"
              priority
            />
            <span className="text-lg font-semibold tracking-[0.2em] text-[#fafafa] md:text-xl">
              Unipar - Cascavel
            </span>
          </div>

          <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-[#ff0000] to-transparent" />
          <p className="mt-6 text-sm uppercase tracking-[0.28em] text-[#fafafa]/55">Loading experience</p>
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const [introLeaving, setIntroLeaving] = useState(false)
  const [introDone, setIntroDone] = useState(false)

  useEffect(() => {
    document.body.style.overflow = "hidden"

    const leaveTimer = window.setTimeout(() => {
      setIntroLeaving(true)
    }, 900)

    const doneTimer = window.setTimeout(() => {
      setIntroDone(true)
      document.body.style.overflow = ""
    }, 1550)

    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(doneTimer)
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <>
      {!introDone && <LoadingExperienceSplash isExiting={introLeaving} />}

      <div
        className={cn(
          "transition-opacity duration-700",
          introDone ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <HeroHeader />
        <main className="@container overflow-x-hidden pb-14">
          <section id="inicio">
            <div className="pb-24 pt-12 md:pb-32 lg:pb-56 lg:pt-44">
              <div className="relative mx-auto flex max-w-6xl flex-col px-6 lg:block">
                <div className="mx-auto max-w-lg text-center lg:ml-0 lg:w-1/2 lg:text-left">
                  <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16 xl:text-7xl">
                    Plataforma interna <span className="text-[#ff0000]">Unipar</span>
                  </h1>
                  <p className="mt-8 max-w-2xl text-pretty text-lg text-muted-foreground">
                    Atendimento, comunicação entre setores e organização do trabalho em um só lugar.
                  </p>

                  <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                    <Button asChild size="lg" className="px-5 text-base">
                      <Link href="/login">
                        <span className="text-nowrap">Acessar plataforma</span>
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="ghost" className="px-5 text-base">
                      <Link href="/signup">
                        <span className="text-nowrap">Solicitar acesso</span>
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="not-dark:invert mask-radial-from-35% mask-radial-to-70% max-lg:size-120 @max-lg:-translate-x-20 max-lg:order-first max-lg:mx-auto max-lg:-mb-20 lg:absolute lg:inset-0 lg:-inset-y-56 lg:ml-auto lg:w-166 lg:translate-x-28">
                  <div className="z-1 pointer-events-none absolute inset-0 bg-black/20" />
                  <Image
                    className="size-full object-cover object-right"
                    src={HERO_IMAGE}
                    alt="Unipar"
                    width={1500}
                    height={2000}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>
          <section id="recursos" className="bg-background pb-3 pt-2 md:pb-6 md:pt-3">
            <div className="relative m-auto max-w-6xl px-6">
              <div className="relative py-2 md:py-3">
                <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
                  {sliderItems.map(({ label, icon: Icon }) => (
                    <span
                      key={label}
                      className="text-foreground/80 inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold tracking-tight"
                    >
                      <Icon className="size-4 shrink-0 opacity-85" aria-hidden />
                      {label}
                    </span>
                  ))}
                </InfiniteSlider>

                <div aria-hidden className="from-background absolute inset-y-0 left-0 w-20 bg-linear-to-r" />
                <div aria-hidden className="from-background absolute inset-y-0 right-0 w-20 bg-linear-to-l" />
                <ProgressiveBlur
                  className="pointer-events-none absolute left-0 top-0 h-full w-20"
                  direction="left"
                  blurIntensity={1}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute right-0 top-0 h-full w-20"
                  direction="right"
                  blurIntensity={1}
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
