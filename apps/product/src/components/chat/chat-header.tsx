"use client";

import { useTranslations } from "@daodao/i18n";
import { useIsMobile } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { ArrowLeft, Pin, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { getChatRoomColor } from "@/constants/chat";

interface ChatHeaderProps {
  name: string;
  memberCount: number;
  iconLabel: string;
  colorSeed: number;
  pinnedCount?: number;
  onToggleSearch?: () => void;
  onToggleMembers?: () => void;
  onTogglePins?: () => void;
}

export function ChatHeader({
  name,
  memberCount,
  iconLabel,
  colorSeed,
  pinnedCount = 0,
  onToggleSearch,
  onToggleMembers,
  onTogglePins,
}: ChatHeaderProps) {
  const t = useTranslations("messages");
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#E4EAE9]">
      <div className="flex items-center gap-3 px-4 py-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/messages")}
            className="shrink-0 size-9"
            aria-label={t("room_header_back")}
          >
            <ArrowLeft className="size-5" />
          </Button>
        )}

        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full text-base font-semibold text-text-dark"
          )}
          style={{ backgroundColor: getChatRoomColor(colorSeed) }}
        >
          {iconLabel}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-text-dark truncate">{name}</h2>
          <div className="flex items-center gap-1 text-xs text-text-dark/50">
            <Users className="size-3" />
            <span>{t("members_count", { count: memberCount })}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onToggleSearch && (
            <Button variant="ghost" size="icon" className="size-8" onClick={onToggleSearch}>
              <Search className="size-4 text-text-dark/50" />
            </Button>
          )}
          {pinnedCount > 0 && onTogglePins && (
            <Button variant="ghost" size="icon" className="size-8" onClick={onTogglePins}>
              <Pin className="size-4 text-text-dark/50" />
            </Button>
          )}
          {onToggleMembers && (
            <Button variant="ghost" size="icon" className="size-8" onClick={onToggleMembers}>
              <Users className="size-4 text-text-dark/50" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
