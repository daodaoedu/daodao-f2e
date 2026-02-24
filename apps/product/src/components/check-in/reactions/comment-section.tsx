"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { Send } from "lucide-react";
import { REACTION_CONFIG, type ReactionTypeType } from "@/constants/reaction-type";
import { LottieEmoji } from "./lottie-emoji";

// ============================================================================
// Types
// ============================================================================

export interface ICommentAuthor {
  name: string;
  photoURL?: string;
}

export interface ICommentReply {
  id: string;
  author: ICommentAuthor;
  content: string;
  reactions?: ReactionTypeType[];
  time: string;
}

export interface IComment {
  id: string;
  author: ICommentAuthor;
  content: string;
  reactions?: ReactionTypeType[];
  time: string;
  replies?: ICommentReply[];
}

// ============================================================================
// Avatar color
// ============================================================================

const AVATAR_COLORS = [
  "bg-[#FFD6C8]", "bg-[#C8FFE4]", "bg-[#C8DCFF]", "bg-[#FFC8F0]",
  "bg-[#FEFFC8]", "bg-[#C8FFF2]", "bg-[#E4C8FF]", "bg-[#FFE4C8]", "bg-[#C8F0FF]",
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? "bg-[#C8FFF2]";
}

// ============================================================================
// CommentBubble (single comment or reply)
// ============================================================================

interface CommentBubbleProps {
  comment: IComment | ICommentReply;
  isReply?: boolean;
  onReply?: () => void;
}

function CommentBubble({ comment, isReply = false, onReply }: CommentBubbleProps) {
  // Show first reaction emoji as the avatar badge
  const firstReaction = comment.reactions?.[0];
  const reactionConfig = firstReaction ? REACTION_CONFIG[firstReaction] : null;

  return (
    // level 2 replies: indent by 40px (avatar width) to align under parent content
    <div className={cn("flex gap-[11px] items-start", isReply && "pl-[40px]")}>
      {/* Avatar + reaction badge */}
      <div className="relative shrink-0">
        <Avatar className="size-10">
          {comment.author.photoURL && (
            <AvatarImage src={comment.author.photoURL} alt={comment.author.name} />
          )}
          <AvatarFallback
            className={cn("text-sm font-medium text-text-dark", getAvatarColor(comment.author.name))}
          >
            {comment.author.name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        {/* Emoji badge on avatar bottom-right */}
        {reactionConfig && !isReply && (
          <div className="absolute -bottom-1 -right-1.5 size-6 rounded-full bg-[#E8FAF9] flex items-center justify-center shadow-sm">
            <LottieEmoji
              url={reactionConfig.lottieUrl}
              fallback={reactionConfig.emoji}
              size={18}
              play={false}
            />
          </div>
        )}
      </div>

      {/* Text content (no bubble background) */}
      <div className="flex-1 min-w-0">
        {/* Author + time */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-[#295E5C]">{comment.author.name}</span>
          <span className="text-xs text-[#295E5C]/50">{comment.time}</span>
        </div>
        {/* Content */}
        <p className="text-sm text-[#295E5C] leading-5 whitespace-pre-wrap">{comment.content}</p>
        {/* 回覆 link */}
        {!isReply && onReply && (
          <button
            type="button"
            onClick={onReply}
            className="text-sm font-medium text-logo-cyan mt-1"
          >
            回覆
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CommentSection
// ============================================================================

interface CommentSectionProps {
  comments: IComment[];
  selectedReactions: ReactionTypeType[];
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit: (content: string, reactions: ReactionTypeType[]) => void;
}

export function CommentSection({
  comments,
  selectedReactions,
  inputRef: externalRef,
  onSubmit,
}: CommentSectionProps) {
  const [inputValue, setInputValue] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = externalRef ?? internalRef;

  // Track the previous set to detect newly added reactions
  const prevSelectedRef = useRef<ReactionTypeType[]>([]);

  // When reactions are added: append their placeholder text and scroll to input
  // biome-ignore lint/correctness/useExhaustiveDependencies: ref.current is intentionally excluded — it's stable and doesn't trigger re-renders
  useEffect(() => {
    const prev = prevSelectedRef.current;
    const newlyAdded = selectedReactions.filter((r) => !prev.includes(r));

    if (newlyAdded.length > 0) {
      setInputValue((current) => {
        const additions = newlyAdded.map((r) => REACTION_CONFIG[r].placeholder).join(" ");
        return current.trim() ? `${current.trim()} ${additions}` : additions;
      });
      setTimeout(() => {
        const el = ref.current;
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }, 100);
    }

    prevSelectedRef.current = selectedReactions;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReactions]);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSubmit(trimmed, selectedReactions);
    setInputValue("");
    setReplyTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col">
      {/* 留言列表 */}
      {comments.length > 0 && (
        <div className="flex flex-col gap-5 px-4 pt-4 pb-4">
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentBubble
                comment={comment}
                onReply={() => setReplyTo(comment.id)}
              />
              {/* Replies */}
              {comment.replies?.map((reply) => (
                <div key={reply.id} className="mt-3">
                  <CommentBubble comment={reply} isReply />
                </div>
              ))}
              {/* Inline reply input */}
              {replyTo === comment.id && (
                <div className="pl-[40px] flex gap-2 items-center mt-3">
                  <textarea
                    className="flex-1 resize-none rounded-lg border border-[#E4EAE9] bg-white px-4 py-2 text-sm text-[#295E5C] placeholder:text-[#9FB5B8] focus:outline-none focus:border-logo-cyan transition-colors min-h-[40px]"
                    placeholder={`回覆 ${comment.author.name}...`}
                    rows={1}
                  />
                  <Button
                    size="icon"
                    className="shrink-0 size-9 rounded-full bg-logo-cyan hover:bg-logo-cyan/80"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 主留言輸入框 */}
      <div className="bg-white border-t border-[#E4EAE9] flex gap-2 items-center px-4 py-3">
        {/* Selected reaction emojis (or grey dot when none) */}
        {selectedReactions.length > 0 ? (
          <div className="flex shrink-0 gap-0.5">
            {selectedReactions.map((type) => (
              <div
                key={type}
                className="size-6 rounded-full bg-[#E8FAF9] flex items-center justify-center"
              >
                <LottieEmoji
                  url={REACTION_CONFIG[type].lottieUrl}
                  fallback={REACTION_CONFIG[type].emoji}
                  size={20}
                  play
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="shrink-0 size-6 rounded-full bg-[#E4EAE9]" />
        )}

        {/* Input */}
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedReactions.length === 0 ? "寫下你的留言..." : ""}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-[#E4EAE9] bg-white px-4 py-2 text-sm text-[#295E5C] placeholder:text-[#9FB5B8] focus:outline-none focus:border-logo-cyan transition-colors h-10"
        />

        {/* Send */}
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
          className="shrink-0 size-10 rounded-full bg-logo-cyan hover:bg-logo-cyan/80 disabled:opacity-40"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
