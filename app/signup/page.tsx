import Image from "next/image"

import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="absolute top-6 left-6 md:top-8 md:left-8">
        <Image
          src="/logo.png"
          alt="Logo da Unipar"
          width={96}
          height={96}
          priority
          className="h-auto w-14 md:w-20"
        />
      </div>
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignupForm />
      </div>
    </div>
  )
}
