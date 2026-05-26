"use client"

import { cn } from "@daodao/ui/lib/utils"

interface ProgressBarProps {
  value: number
  className?: string
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full bg-muted rounded-full overflow-hidden", className)}>
      <div
        className="bg-primary h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}
