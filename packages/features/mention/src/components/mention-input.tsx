"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { cn } from "@daodao/ui/lib/utils";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MentionCandidate } from "../hooks/use-mention-input";

const AVATAR_COLORS = [
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

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? "bg-[#C8FFF2]";
}

export interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  participants: MentionCandidate[];
  autoFocus?: boolean;
  onMentionSelect?: (candidate: MentionCandidate) => void;
  disabled?: boolean;
}

/**
 * Textarea with @mention dropdown support.
 *
 * Filters `participants` locally as the user types after `@`.
 * Calls `onMentionSelect` when a candidate is chosen so the parent can
 * track selected mention IDs (e.g. via `useMentionInput`).
 */
export function MentionInput({
  value,
  onChange,
  onKeyDown,
  placeholder,
  rows = 1,
  className,
  inputRef,
  participants,
  autoFocus,
  onMentionSelect,
  disabled,
}: MentionInputProps) {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = (inputRef ?? localRef) as React.RefObject<HTMLTextAreaElement>;
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(-1);

  const resizeTextarea = useCallback((textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  useEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;
    resizeTextarea(textarea);
  }, [resizeTextarea]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    resizeTextarea(e.currentTarget);
    onChange(newValue);

    const cursor = e.target.selectionStart ?? newValue.length;
    const textBeforeCursor = newValue.slice(0, cursor);
    const lastAt = textBeforeCursor.lastIndexOf("@");

    if (lastAt !== -1) {
      const charBeforeAt = lastAt > 0 ? (textBeforeCursor[lastAt - 1] ?? null) : null;
      if (charBeforeAt === null || /\s/.test(charBeforeAt)) {
        const afterAt = textBeforeCursor.slice(lastAt + 1);
        if (!afterAt.includes(" ") && !afterAt.includes("\n")) {
          setMentionStart(lastAt);
          setMentionQuery(afterAt);
          return;
        }
      }
    }

    setMentionQuery(null);
    setMentionStart(-1);
  };

  const handleSelect = (candidate: MentionCandidate) => {
    const mention = `@${candidate.name}`;
    const before = value.slice(0, mentionStart);
    const after = value.slice(mentionStart + 1 + (mentionQuery?.length ?? 0));
    const next = `${before}${mention} ${after}`;
    onChange(next);
    onMentionSelect?.(candidate);
    setMentionQuery(null);
    setMentionStart(-1);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      const pos = before.length + mention.length + 1;
      el.setSelectionRange(pos, pos);
    });
  };

  const filtered =
    mentionQuery !== null
      ? participants.filter((p) => p.name.toLowerCase().includes(mentionQuery.toLowerCase()))
      : [];

  return (
    <div className="relative flex-1 min-w-0">
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={className}
        disabled={disabled}
        // biome-ignore lint/a11y/noAutofocus: intentional UX for inline edit
        autoFocus={autoFocus}
      />
      {mentionQuery !== null && filtered.length > 0 && (
        // biome-ignore lint/a11y/noStaticElementInteractions: prevent textarea blur when clicking anywhere in dropdown
        <div
          className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E4EAE9] py-1 z-20 min-w-[160px] max-h-44 overflow-y-auto"
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.map((p) => (
            <button
              key={p.userId}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(p);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors text-left"
            >
              <Avatar className="size-6 shrink-0">
                {p.photoURL && <AvatarImage src={p.photoURL} alt={p.name} />}
                <AvatarFallback
                  className={cn("text-xs font-medium text-text-dark", getAvatarColor(p.name))}
                >
                  {p.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
