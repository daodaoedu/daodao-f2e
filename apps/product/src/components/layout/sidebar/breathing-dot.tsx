"use client";

import { cn } from "@daodao/ui/lib/utils";

export function BreathingDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute -top-px -right-px inline-flex items-center justify-center size-[9px]",
        className
      )}
    >
      <span className="absolute inset-0 rounded-full bg-logo-cyan animate-breathe" />
      <span className="absolute inset-px rounded-full bg-logo-cyan shadow-[0_0_0_1.5px_rgba(249,254,255,0.9)]" />
    </span>
  );
}
