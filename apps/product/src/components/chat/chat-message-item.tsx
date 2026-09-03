"use client";

import type { ChatMessageType } from "@daodao/api";
import { likeChatMessage, unlikeChatMessage } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useLocale } from "@daodao/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { cn } from "@daodao/ui/lib/utils";
import { Heart } from "lucide-react";
import { useCallback, useState } from "react";
import { formatRelativeTime } from "@/utils/format-time";

// ============================================================================
// Helpers
// ============================================================================

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

function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] ?? "bg-[#C8FFF2]";
}

// ============================================================================
// Types
// ============================================================================

interface ChatMessageItemProps {
  message: ChatMessageType;
  onReply?: (message: ChatMessageType) => void;
  onLikeToggle?: () => void;
}

// ============================================================================
// System Message
// ============================================================================

function SystemMessage({ message }: { message: ChatMessageType }) {
  const locale = useLocale();

  return (
    <div className="flex justify-center py-2">
      <div className="bg-[#F2F7F7] rounded-full px-4 py-1.5">
        <p className="text-xs text-text-dark/60 text-center">{message.body}</p>
        <p className="text-[10px] text-text-dark/40 text-center mt-0.5">
          {formatRelativeTime(message.createdAt, locale)}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Text Message
// ============================================================================

export function ChatMessageItem({ message, onReply, onLikeToggle }: ChatMessageItemProps) {
  const t = useTranslations("messages");
  const locale = useLocale();
  const [liked, setLiked] = useState(message.likedByMe);
  const [likeCount, setLikeCount] = useState(message.likeCount);

  // Handle system messages
  if (message.kind === "system") {
    return <SystemMessage message={message} />;
  }

  const author = message.author;
  const authorName = author?.nickname ?? "";

  const handleLikeToggle = useCallback(async () => {
    const prevLiked = liked;
    const prevCount = likeCount;
    // optimistic update
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    try {
      if (prevLiked) {
        await unlikeChatMessage(message.roomId, message.id);
      } else {
        await likeChatMessage(message.roomId, message.id);
      }
      onLikeToggle?.();
    } catch {
      // rollback
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  }, [liked, likeCount, message.roomId, message.id, onLikeToggle]);

  return (
    <div className="flex gap-2.5 items-start group px-4 py-1.5 hover:bg-[#F7FBFB] transition-colors">
      {/* Author Avatar */}
      <Avatar className="size-9 shrink-0 mt-0.5">
        {author?.avatar && <AvatarImage src={author.avatar} alt={authorName} />}
        <AvatarFallback
          className={cn("text-sm font-medium text-text-dark", getAvatarColor(authorName || "?"))}
        >
          {authorName.slice(0, 1) || "?"}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Author + Time */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-text-dark truncate">
            {authorName}
            {author?.isHost && (
              <span className="ml-1 text-[10px] font-normal text-logo-cyan bg-logo-cyan/10 rounded px-1 py-0.5">
                Host
              </span>
            )}
          </span>
          <span className="text-[11px] text-text-dark/40 shrink-0">
            {formatRelativeTime(message.createdAt, locale)}
          </span>
          {message.editedAt && (
            <span className="text-[10px] text-text-dark/30 italic">({t("message_edited")})</span>
          )}
        </div>

        {/* Reply Preview */}
        {message.replyTo && (
          <div className="mb-1 border-l-2 border-logo-cyan/40 pl-2 py-0.5 bg-[#F2F7F7] rounded-r">
            {message.replyTo.isDeleted ? (
              <p className="text-xs text-text-dark/40 italic">{t("reply_to_deleted")}</p>
            ) : (
              <>
                <p className="text-[11px] font-medium text-text-dark/60">
                  {message.replyTo.authorName}
                </p>
                <p className="text-xs text-text-dark/50 truncate">
                  {message.replyTo.bodyPreview}
                </p>
              </>
            )}
          </div>
        )}

        {/* Message Body */}
        <p className="text-sm text-text-dark leading-5 whitespace-pre-wrap break-words">
          {message.body}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1">
          {/* Like */}
          <button
            type="button"
            onClick={handleLikeToggle}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              liked ? "text-red-400" : "text-text-dark/30 hover:text-red-400"
            )}
          >
            <Heart className={cn("size-3.5", liked && "fill-current")} />
            {likeCount > 0 && <span>{t("like_count", { count: likeCount })}</span>}
          </button>

          {/* Reply */}
          {onReply && (
            <button
              type="button"
              onClick={() => onReply(message)}
              className="text-xs text-text-dark/30 hover:text-logo-cyan transition-colors opacity-0 group-hover:opacity-100"
            >
              {t("reply_to", { name: authorName })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
