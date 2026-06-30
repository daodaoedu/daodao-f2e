"use client";

import { useTranslations } from "@daodao/i18n";
import { cn } from "@daodao/ui/lib/utils";
import {
  REACTION_CONFIG,
  REACTION_TYPE_LIST,
  type ReactionTypeType,
} from "@/constants/reaction-type";
import { LottieEmoji } from "./lottie-emoji";

// ============================================================================
// Types
// ============================================================================

export interface IReactionCount {
  type: ReactionTypeType;
  count: number;
  /** 最近反應的使用者名稱（用於聚合顯示） */
  latestActorName?: string;
}

interface ReactionBarProps {
  reactions: IReactionCount[];
  selectedReactions: ReactionTypeType[];
  onReactionClick: (type: ReactionTypeType) => void;
  /** 覆蓋容器的 className，可用來控制 scroll / wrap 行為 */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ReactionBar({
  reactions,
  selectedReactions,
  onReactionClick,
  className,
}: ReactionBarProps) {
  const t = useTranslations("app_product");
  return (
    <div className={cn("flex items-center gap-2 px-4 py-3", className ?? "flex-wrap")}>
      {REACTION_TYPE_LIST.map((type) => {
        const config = REACTION_CONFIG[type];
        const reactionData = reactions.find((r) => r.type === type);
        const count = reactionData?.count ?? 0;
        const isSelected = selectedReactions.includes(type);

        return (
          <button
            key={type}
            type="button"
            onClick={() => onReactionClick(type)}
            className={cn(
              "flex shrink-0 items-center gap-1 h-9 px-4 rounded-full text-sm transition-all border whitespace-nowrap",
              isSelected
                ? "border-logo-cyan bg-[#F5FFFD] text-logo-cyan font-medium"
                : "border-[#9FB5B8] bg-white text-[#295E5C] hover:border-logo-cyan/60"
            )}
          >
            <LottieEmoji
              url={config.lottieUrl}
              fallback={config.emoji}
              size={20}
              play={isSelected}
            />
            <span className="text-sm leading-none">{t(config.label)}</span>
            {count > 0 && (
              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-logo-cyan" : "text-[#295E5C]/60"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
