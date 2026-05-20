"use client";

import type { MentionCandidate } from "@daodao/features-mention";
import { MentionInput, useMentionInput } from "@daodao/features-mention";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { REACTION_CONFIG, type ReactionTypeType } from "@/constants/reaction-type";

// ============================================================================
// Types
// ============================================================================

export interface CommentInputProps {
  /** 目前選取的反應類型，決定 placeholder 文字 */
  reactionType?: ReactionTypeType | null;
  onSubmit: (
    content: string,
    reactionType?: ReactionTypeType | null,
    mentionedUserIds?: number[]
  ) => void;
  disabled?: boolean;
  className?: string;
  /** 可供 @mention 的使用者候選清單（由父元件從留言清單中衍生） */
  participants?: MentionCandidate[];
}

// ============================================================================
// Component
// ============================================================================

/**
 * 留言輸入框（含 @mention 支援）
 * - 根據 reactionType 動態切換 placeholder 引導文字
 * - 當 reactionType 改變時自動聚焦
 * - 送出時傳送 mentionedUserIds 給父元件
 *
 * Task 2.1 調查：CommentInput 目前由 social/index.ts 匯出但尚未在任何頁面使用，
 * 適合加入 @mention UI（所有 target type 均為具名用戶，不涉及匿名場景）。
 */
export function CommentInput({
  reactionType,
  onSubmit,
  disabled,
  className,
  participants = [],
}: CommentInputProps) {
  const t = useTranslations("social");
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevReactionTypeRef = useRef<ReactionTypeType | null | undefined>(undefined);
  const { handleMentionSelect, getActiveMentionIds, reset: resetMentions } = useMentionInput();

  // reactionType 改變時聚焦輸入框
  useEffect(() => {
    if (reactionType && reactionType !== prevReactionTypeRef.current) {
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      });
    }
    prevReactionTypeRef.current = reactionType;
  }, [reactionType]);

  const placeholder = reactionType ? REACTION_CONFIG[reactionType].placeholder : t("comment_placeholder");

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed, reactionType, getActiveMentionIds(trimmed));
    setValue("");
    resetMentions();
  }, [value, reactionType, onSubmit, getActiveMentionIds, resetMentions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("flex gap-2 items-end", className)}>
      <MentionInput
        inputRef={textareaRef}
        value={value}
        onChange={setValue}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        participants={participants}
        disabled={disabled}
        className="flex-1 resize-none overflow-hidden rounded-lg border border-[#E4EAE9] bg-white px-4 py-2 text-sm text-[#295E5C] placeholder:text-[#9FB5B8] focus:outline-none focus:border-logo-cyan transition-colors min-h-[40px] disabled:opacity-50"
        onMentionSelect={handleMentionSelect}
      />
      <Button
        type="button"
        size="icon"
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        className="shrink-0 size-10 rounded-full bg-logo-cyan hover:bg-logo-cyan/80 disabled:opacity-40"
      >
        <Send className="size-4" />
      </Button>
    </div>
  );
}
