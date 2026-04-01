"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState, type ComponentProps, type FormEvent, type MouseEvent } from "react"
import { useRouter } from "next/navigation"
import { CheckIcon } from "lucide-react"
import { toast } from "sonner"

import {
  getSignupAccessRequestInput,
  submitSignupAccessRequest,
} from "@/lib/signup-access-request"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const router = useRouter()
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false)
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [isRequestSent, setIsRequestSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const routeTransitionTimerRef = useRef<number | null>(null)
  const submitTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (routeTransitionTimerRef.current !== null) {
        window.clearTimeout(routeTransitionTimerRef.current)
      }

      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current)
      }
    }
  }, [])

  function handleLoginNavigation(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()

    if (isRouteTransitioning || isSubmittingRequest) {
      return
    }

    setIsRouteTransitioning(true)

    routeTransitionTimerRef.current = window.setTimeout(() => {
      router.push("/login")
    }, 320)
  }

  function handleBackToLogin() {
    if (isRouteTransitioning || isSubmittingRequest) {
      return
    }

    setIsRouteTransitioning(true)

    routeTransitionTimerRef.current = window.setTimeout(() => {
      router.push("/login")
    }, 320)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isRouteTransitioning || isSubmittingRequest || isRequestSent) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const accessRequestInput = getSignupAccessRequestInput(formData)

    if (!accessRequestInput) {
      return
    }

    setSubmittedEmail(accessRequestInput.email)
    setIsSubmittingRequest(true)

    submitTimerRef.current = window.setTimeout(() => {
      submitSignupAccessRequest(accessRequestInput)
      setIsSubmittingRequest(false)
      setIsRequestSent(true)
      toast.success("Solicitação enviada com sucesso")
      submitTimerRef.current = null
    }, 700)
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
            <div className="relative min-h-[560px]">
              <div
                className={cn(
                  "h-full p-6 transition-all duration-700 md:p-8",
                  (isSubmittingRequest || isRequestSent) &&
                    "pointer-events-none -translate-y-6 scale-95 opacity-0 blur-md",
                )}
              >
                <form className="h-full" onSubmit={handleSubmit}>
                  <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <h1 className="text-2xl font-bold">Solicite seu acesso</h1>
                      <p className="text-balance text-muted-foreground">
                        Preencha seus dados para solicitar acesso ao sistema da Unipar
                      </p>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="name">Nome</FieldLabel>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Digite seu nome"
                        required
                      />
                    </Field>
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
                      <FieldLabel htmlFor="department">Setor</FieldLabel>
                      <Input
                        id="department"
                        name="department"
                        type="text"
                        placeholder="Digite seu setor"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="cpf">CPF</FieldLabel>
                      <Input
                        id="cpf"
                        name="cpf"
                        type="text"
                        inputMode="numeric"
                        placeholder="Digite seu CPF"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirm-cpf">Confirmação do CPF</FieldLabel>
                      <Input
                        id="confirm-cpf"
                        name="confirmCpf"
                        type="text"
                        inputMode="numeric"
                        placeholder="Confirme seu CPF"
                        required
                      />
                    </Field>
                    <Field>
                      <Button type="submit" className="cursor-pointer">Solicitar acesso</Button>
                    </Field>
                    <FieldDescription className="text-center">
                      Já tem uma conta? <Link href="/login" onClick={handleLoginNavigation}>Faça login</Link>
                    </FieldDescription>
                  </FieldGroup>
                </form>
              </div>

              {isRequestSent && (
                <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
                  <div className="w-full max-w-md text-center animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-6 duration-700">
                    <h2 className="text-2xl font-bold">Solicitação enviada</h2>
                    <div className="mx-auto mt-5 mb-8 h-px w-24 bg-gradient-to-r from-transparent via-[#ff0000] to-transparent" />
                    <p className="mt-5 text-balance leading-7 text-muted-foreground">
                      Assim que seu acesso estiver liberado, você receberá uma notificação no seu e-mail <br />
                      <br />
                      <span className="inline-flex items-center gap-2 font-bold">
                        <CheckIcon className="size-4" />
                        <span>{submittedEmail}</span>
                      </span>
                    </p>
                    <Button
                      type="button"
                      className="mt-8 cursor-pointer"
                      onClick={handleBackToLogin}
                    >
                      Voltar para tela de login
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative hidden bg-muted md:block">
              <Image
                src="/signup.png"
                alt="Ilustração da tela de cadastro"
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
