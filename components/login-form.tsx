"use client"

import Image from "next/image"
import Link from "next/link"
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type FormEvent,
  type MouseEvent,
} from "react"
import { useRouter } from "next/navigation"
import { EyeClosedIcon, EyeIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { getStoredAccessRequests, submitSignupAccessRequest } from "@/lib/signup-access-request"
import { defaultStoredProfile, writeStoredProfile } from "@/lib/profile-storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const LOADING_DESTINATION = "/dashboard"

export function LoginForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const router = useRouter()
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const routeTransitionTimerRef = useRef<number | null>(null)

  function normalizeEmail(raw: string) {
    return raw.trim().toLowerCase()
  }

  function normalizeCpf(raw: string) {
    return raw.replace(/\D/g, "")
  }

  useEffect(() => {
    // Dev helper: garante um usuário demo para testes locais.
    if (process.env.NODE_ENV !== "development") return

    const demoEmail = "jorge.karvat@unipar.br"
    const demoPassword = "09496380999" // CPF digits (veja a lógica do MVP)

    const accessRequests = getStoredAccessRequests()
    const alreadyExists = accessRequests.some(
      (r) =>
        normalizeEmail(r.email) === normalizeEmail(demoEmail) &&
        r.cpf === normalizeCpf(demoPassword),
    )

    if (alreadyExists) return

    submitSignupAccessRequest({
      name: "Jorge Karvat",
      email: demoEmail,
      department: defaultStoredProfile.department,
      cpf: normalizeCpf(demoPassword),
    })
  }, [])

  useEffect(() => {
    return () => {
      if (routeTransitionTimerRef.current !== null) {
        window.clearTimeout(routeTransitionTimerRef.current)
      }
    }
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isRouteTransitioning) {
      return
    }

    setIsRouteTransitioning(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "").trim()

    // Autenticação MVP: usuário loga usando a solicitação salva (CPF = senha).
    const accessRequests = getStoredAccessRequests()
    const matchedRequest = accessRequests.find(
      (r) =>
        normalizeEmail(r.email) === normalizeEmail(email) &&
        r.cpf === normalizeCpf(password),
    )

    if (!matchedRequest) {
      toast.error("Você errou suas credenciais.")
      setIsRouteTransitioning(false)
      return
    }

    const nextProfile = {
      name: matchedRequest.name,
      email: matchedRequest.email,
      department: matchedRequest.department || defaultStoredProfile.department,
      photo: null,
    }

    writeStoredProfile(nextProfile)
    toast.success("Login realizado com sucesso")
    router.push(LOADING_DESTINATION)
  }

  function handleSignupNavigation(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    if (isRouteTransitioning) {
      return
    }

    setIsRouteTransitioning(true)

    routeTransitionTimerRef.current = window.setTimeout(() => {
      router.push("/signup")
    }, 320)
  }

  return (
    <div className={cn("flex flex-col gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500", className)} {...props}>
      <div
        className={cn(
          "flex flex-col gap-6 transition-all duration-500",
          isRouteTransitioning && "pointer-events-none -translate-y-3 scale-[0.99] opacity-0 blur-sm duration-300",
        )}
      >
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Sejá bem-vindo</h1>
                  <p className="text-balance text-muted-foreground">
                    Faça login em sua conta da Unipar
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    required
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-2 hover:underline"
                    >
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="Digite sua senha"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                      aria-pressed={isPasswordVisible}
                      onClick={() => setIsPasswordVisible((current) => !current)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors"
                    >
                      {isPasswordVisible ? (
                        <EyeIcon className="size-4 text-white" />
                      ) : (
                        <EyeClosedIcon className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </Field>
                <Field>
                  <Button type="submit" className="cursor-pointer">Entrar</Button>
                </Field>
                <FieldDescription className="text-center">
                  Caso ainda não tenha uma conta:{" "}
                  <Link href="/signup" onClick={handleSignupNavigation}>
                    Solicite seu acesso
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
            <div className="relative hidden bg-muted md:block">
              <Image
                src="/login.png"
                alt="Ilustração da tela de login"
                fill
                sizes="(min-width: 768px) 50vw, 0vw"
                className="object-cover"
              />
            </div>
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          Ao continuar, você concorda com nossos <a href="#">Termos de Serviço</a>{" "}
          e <a href="#">Política de Privacidade</a>.
        </FieldDescription>
      </div>
    </div>
  )
}
