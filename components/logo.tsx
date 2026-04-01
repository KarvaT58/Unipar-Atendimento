import Image from "next/image"

import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string; uniColor?: boolean }) {
  return (
    <Image
      src="/logo.png"
      alt="Unipar Cascavel"
      width={180}
      height={48}
      className={cn("h-8 w-auto object-contain object-left", className)}
      priority
    />
  )
}

export function LogoIcon({ className }: { className?: string; uniColor?: boolean }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={40}
      height={40}
      className={cn("size-8 object-contain", className)}
    />
  )
}
