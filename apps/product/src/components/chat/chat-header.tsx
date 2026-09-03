"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { useSafeRouter } from "@daodao/ui/hooks/use-safe-router";
import { ArrowLeft, Users } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface ChatHeaderProps {
  name: string;
  memberCount: number;
  iconLabel: string;
  colorSeed: number;
}

// ============================================================================
// Helpers
// ============================================================================

const ROOM_COLORS = [
  "bg-[#FFD6C8]",
  "bg-[#C8FFE4]",
  "bg-[#C8DCFF]",
  "bg-[#FFC8F0]",
  "bg-[#FEFFC8]",
  "bg-[#C8FFF2]",
  "bg-[#E4C8FF]",
  "bg-[#FFE4C8]",
  "bg-[#C8F0FF]",
];

function getRoomColor(colorSeed: number): string {
  return ROOM_COLORS[colorSeed % ROOM_COLORS.length] ?? "bg-[#C8FFF2]";
}

// ============================================================================
// Component
// ============================================================================

export function ChatHeader({ name, memberCount, iconLabel, colorSeed }: ChatHeaderProps) {
  const t = useTranslations("messages");
  const router = useSafeRouter();

  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#E4EAE9]">
      <div className="max-w-[640px] mx-auto flex items-center gap-3 px-4 py-3">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0 size-9"
          aria-label={t("room_header_back")}
        >
          <ArrowLeft className="size-5" />
        </Button>

        {/* Room Icon */}
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-text-dark",
            getRoomColor(colorSeed)
          )}
        >
          {iconLabel}
        </div>

        {/* Room Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-text-dark truncate">{name}</h1>
          <div className="flex items-center gap-1 text-xs text-text-dark/50">
            <Users className="size-3" />
            <span>{t("members_count", { count: memberCount })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
