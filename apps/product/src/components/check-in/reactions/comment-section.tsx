"use client";

import type React from "react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { Send } from "lucide-react";
import { REACTION_CONFIG, type ReactionTypeType } from "@/constants/reaction-type";

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
  reaction?: ReactionTypeType;
  time: string;
}

export interface IComment {
  id: string;
  author: ICommentAuthor;
  content: string;
  reaction?: ReactionTypeType;
  time: string;
  replies?: ICommentReply[];
}

// ============================================================================
// Avatar color (same pattern as notification-item)
// ============================================================================

const AVATAR_COLORS = [
  "bg-[#FFD6C8]", "bg-[#C8FFE4]", "bg-[#C8DCFF]", "bg-[#FFC8F0]",
  "bg-[#FEFFC8]", "bg-[#C8FFF2]", "bg-[#E4C8FF]", "bg-[#FFE4C8]", "bg-[#C8F0FF]",
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? "bg-[#C8FFF2]";
}

// ============================================================================
// CommentAvatar
// ============================================================================

function CommentAvatar({ author, size = "md" }: { author: ICommentAuthor; size?: "sm" | "md" }) {
  return (
    <Avatar className={cn("shrink-0", size === "sm" ? "size-7" : "size-9")}>
      {author.photoURL && <AvatarImage src={author.photoURL} alt={author.name} />}
      <AvatarFallback className={cn("text-sm font-medium text-text-dark", getAvatarColor(author.name))}>
        {author.name.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
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
  const reactionConfig = comment.reaction ? REACTION_CONFIG[comment.reaction] : null;

  return (
    <div className="flex gap-2">
      <CommentAvatar author={comment.author} size={isReply ? "sm" : "md"} />
      <div className="flex-1 min-w-0">
        <div className="bg-[#F2F7F7] rounded-2xl rounded-tl-sm px-3 py-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-semibold text-text-dark">{comment.author.name}</span>
            {reactionConfig && (
              <span className="text-sm" title={reactionConfig.label}>
                {reactionConfig.emoji}
              </span>
            )}
          </div>
          <p className="text-sm text-text-dark leading-5">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-xs text-text-dark/50">{comment.time}</span>
          {!isReply && onReply && (
            <button
              type="button"
              onClick={onReply}
              className="text-xs text-text-dark/50 hover:text-logo-cyan transition-colors"
            >
              回覆
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CommentSection
// ============================================================================

interface CommentSectionProps {
  comments: IComment[];
  selectedReaction: ReactionTypeType | null;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  onSubmit: (content: string, reaction: ReactionTypeType | null) => void;
}

export function CommentSection({
  comments,
  selectedReaction,
  inputRef: externalRef,
  onSubmit,
}: CommentSectionProps) {
  const [inputValue, setInputValue] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = externalRef ?? internalRef;

  const placeholder = selectedReaction
    ? REACTION_CONFIG[selectedReaction].placeholder
    : "留下你的想法...";

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSubmit(trimmed, selectedReaction);
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
        <div className="flex flex-col gap-4 px-4 pt-2 pb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-2">
              <CommentBubble
                comment={comment}
                onReply={() => setReplyTo(comment.id)}
              />
              {/* 回覆（最多一層） */}
              {comment.replies?.map((reply) => (
                <div key={reply.id} className="pl-8">
                  <CommentBubble comment={reply} isReply />
                </div>
              ))}
              {/* 回覆輸入框 */}
              {replyTo === comment.id && (
                <div className="pl-8 flex gap-2 items-end">
                  <textarea
                    className="flex-1 resize-none rounded-xl border border-[#E4EAE9] bg-white px-3 py-2 text-sm text-text-dark placeholder:text-text-dark/40 focus:outline-none focus:border-logo-cyan transition-colors min-h-[40px]"
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

      {/* 留言輸入框 */}
      <div className="flex gap-2 items-end px-4 py-3 border-t border-[#E4EAE9]">
        {/* 選取中的反應指示 */}
        {selectedReaction && (
          <span className="mb-2 text-lg shrink-0" title={REACTION_CONFIG[selectedReaction].label}>
            {REACTION_CONFIG[selectedReaction].emoji}
          </span>
        )}
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-[#E4EAE9] bg-[#F2F7F7] px-4 py-2.5 text-sm text-text-dark placeholder:text-text-dark/40 focus:outline-none focus:border-logo-cyan transition-colors"
        />
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
