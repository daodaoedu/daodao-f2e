"use client";

import { cn } from "@daodao/ui/lib/utils";
import { MessageCircle } from "lucide-react";
import { REACTION_CONFIG, REACTION_TYPE_LIST, type ReactionTypeType } from "@/constants/reaction-type";

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
  selectedReaction: ReactionTypeType | null;
  commentCount: number;
  onReactionClick: (type: ReactionTypeType) => void;
  onCommentClick: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function ReactionBar({
  reactions,
  selectedReaction,
  commentCount,
  onReactionClick,
  onCommentClick,
}: ReactionBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap px-4 py-3">
      {REACTION_TYPE_LIST.map((type) => {
        const config = REACTION_CONFIG[type];
        const reactionData = reactions.find((r) => r.type === type);
        const count = reactionData?.count ?? 0;
        const isSelected = selectedReaction === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onReactionClick(type)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all border",
              isSelected
                ? "border-logo-cyan bg-logo-cyan/10 text-logo-cyan font-medium"
                : "border-[#E4EAE9] bg-white text-text-dark hover:border-logo-cyan/50"
            )}
          >
            <span>{config.emoji}</span>
            <span className="text-xs leading-none">{config.label}</span>
            {count > 0 && (
              <span className={cn("text-xs font-medium", isSelected ? "text-logo-cyan" : "text-text-dark/60")}>
                {count}
              </span>
            )}
          </button>
        );
      })}

      {/* 留言按鈕 */}
      <button
        type="button"
        onClick={onCommentClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-[#E4EAE9] bg-white text-text-dark hover:border-logo-cyan/50 transition-all"
      >
        <MessageCircle className="size-4" />
        {commentCount > 0 && (
          <span className="text-xs font-medium text-text-dark/60">{commentCount}</span>
        )}
      </button>
    </div>
  );
}
