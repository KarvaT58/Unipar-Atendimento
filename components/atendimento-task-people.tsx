"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function personInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function TaskTablePersonCell({
  name,
  avatarUrl,
  compact = false,
}: {
  name: string
  avatarUrl: string
  compact?: boolean
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar
        className={cn(
          "shrink-0 rounded-full border border-border bg-muted",
          compact ? "size-7" : "size-8",
        )}
      >
        <AvatarImage src={avatarUrl} alt="" />
        <AvatarFallback className="rounded-full text-[10px] font-medium">
          {personInitials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 truncate text-sm text-foreground">{name}</span>
    </div>
  )
}
