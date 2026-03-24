"use client";

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
  onSubmit: (content: string, reactionType?: ReactionTypeType | null) => void;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * 留言輸入框
 * - 根據 reactionType 動態切換 placeholder 引導文字
 * - 當 reactionType 改變時自動聚焦
 */
export function CommentInput({ reactionType, onSubmit, disabled, className }: CommentInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevReactionTypeRef = useRef<ReactionTypeType | null | undefined>(undefined);

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

  const placeholder = reactionType ? REACTION_CONFIG[reactionType].placeholder : "寫下你的留言...";

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed, reactionType);
    setValue("");
  }, [value, reactionType, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("flex gap-2 items-center", className)}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none rounded-lg border border-[#E4EAE9] bg-white px-4 py-2 text-sm text-[#295E5C] placeholder:text-[#9FB5B8] focus:outline-none focus:border-logo-cyan transition-colors h-10 disabled:opacity-50"
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
