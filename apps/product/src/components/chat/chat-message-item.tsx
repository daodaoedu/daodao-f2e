"use client";

import type { ChatMessageType } from "@daodao/api";
import {
  deleteChatMessage,
  likeChatMessage,
  pinChatMessage,
  unlikeChatMessage,
  unpinChatMessage,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { useLocale } from "@daodao/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@daodao/ui/components/avatar";
import { Button } from "@daodao/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import {
  Heart,
  MessageSquareReply,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { formatRelativeTime } from "@/utils/format-time";

const AVATAR_COLORS = [
  "bg-[#FFD6C8]", "bg-[#C8FFE4]", "bg-[#C8DCFF]", "bg-[#FFC8F0]",
  "bg-[#FEFFC8]", "bg-[#C8FFF2]", "bg-[#E4C8FF]", "bg-[#FFE4C8]", "bg-[#C8F0FF]",
];

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? "bg-[#C8FFF2]";
}

interface ChatMessageItemProps {
  message: ChatMessageType;
  isGroupStart: boolean;
  isGroupEnd: boolean;
  isHost: boolean;
  currentUserId: number;
  onReply?: (message: ChatMessageType) => void;
  onEdit?: (message: ChatMessageType) => void;
  onMutate?: () => void;
}

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

export function ChatMessageItem({
  message,
  isGroupStart,
  isGroupEnd,
  isHost,
  currentUserId,
  onReply,
  onEdit,
  onMutate,
}: ChatMessageItemProps) {
  const t = useTranslations("messages");
  const locale = useLocale();
  const [liked, setLiked] = useState(message.likedByMe);
  const [likeCount, setLikeCount] = useState(message.likeCount);
  const [deleting, setDeleting] = useState(false);

  if (message.kind === "system") return <SystemMessage message={message} />;

  const author = message.author;
  const authorName = author?.nickname ?? t("deleted_user");
  const isOwn = author?.userId === currentUserId;
  const canEdit = isOwn && message.kind === "text";
  const canDelete = isOwn || isHost;
  const canPin = isHost;

  const handleLikeToggle = useCallback(async () => {
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);
    try {
      if (prevLiked) await unlikeChatMessage(message.roomId, message.id);
      else await likeChatMessage(message.roomId, message.id);
      onMutate?.();
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  }, [liked, likeCount, message.roomId, message.id, onMutate]);

  const handleDelete = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const response = await deleteChatMessage(message.roomId, message.id);
      if (response.error) {
        const msg = response.error && typeof response.error === "object" && "message" in response.error
          ? String(response.error.message) : t("send_failed");
        toast.error(msg);
        return;
      }
      onMutate?.();
    } catch {
      toast.error(t("send_failed"));
    } finally {
      setDeleting(false);
    }
  }, [deleting, message.roomId, message.id, onMutate, t]);

  const handlePin = useCallback(async () => {
    try {
      if (message.isPinned) await unpinChatMessage(message.roomId, message.id);
      else await pinChatMessage(message.roomId, message.id);
      onMutate?.();
    } catch {
      toast.error(t("send_failed"));
    }
  }, [message.roomId, message.id, message.isPinned, onMutate, t]);

  return (
    <div
      className={cn(
        "relative flex gap-2.5 items-start group px-4 hover:bg-[#F7FBFB] transition-colors",
        isGroupStart ? "pt-2" : "pt-0.5",
        isGroupEnd ? "pb-1.5" : "pb-0.5",
      )}
    >
      {/* Avatar — only show on group start */}
      {isGroupStart ? (
        <Avatar className="size-9 shrink-0 mt-0.5">
          {author?.avatar && <AvatarImage src={author.avatar} alt={authorName} />}
          <AvatarFallback className={cn("text-sm font-medium text-text-dark", getAvatarColor(authorName))}>
            {authorName.slice(0, 1) || "?"}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="size-9 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        {/* Author + Time — only on group start */}
        {isGroupStart && (
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-text-dark truncate">
              {authorName}
              {author?.isHost && (
                <span className="ml-1 text-[10px] font-normal text-amber-600 bg-amber-50 rounded px-1 py-0.5">
                  🛡️ {t("host_badge")}
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
        )}

        {/* Reply Preview */}
        {message.replyTo && (
          <div className="mb-1 border-l-2 border-logo-cyan/40 pl-2 py-0.5 bg-[#F2F7F7] rounded-r">
            {message.replyTo.isDeleted ? (
              <p className="text-xs text-text-dark/40 italic">{t("reply_to_deleted")}</p>
            ) : (
              <>
                <p className="text-[11px] font-medium text-text-dark/60">{message.replyTo.authorName}</p>
                <p className="text-xs text-text-dark/50 truncate">{message.replyTo.bodyPreview}</p>
              </>
            )}
          </div>
        )}

        {/* Body */}
        <p className="text-sm text-text-dark leading-5 whitespace-pre-wrap break-words">{message.body}</p>

        {/* Like pill (always visible when count > 0) */}
        {likeCount > 0 && (
          <button
            type="button"
            onClick={handleLikeToggle}
            className={cn(
              "inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs transition-colors",
              liked ? "bg-red-50 text-red-400" : "bg-gray-100 text-text-dark/40 hover:bg-red-50 hover:text-red-400",
            )}
          >
            <Heart className={cn("size-3", liked && "fill-current")} />
            {likeCount}
          </button>
        )}
      </div>

      {/* Hover action bar */}
      <div className="absolute -top-3 right-3 flex items-center gap-0.5 bg-white border border-gray-200 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="size-7" onClick={handleLikeToggle}>
          <Heart className={cn("size-3.5", liked ? "fill-red-400 text-red-400" : "text-gray-400")} />
        </Button>
        {onReply && (
          <Button variant="ghost" size="icon" className="size-7" onClick={() => onReply(message)}>
            <MessageSquareReply className="size-3.5 text-gray-400" />
          </Button>
        )}
        {canEdit && onEdit && (
          <Button variant="ghost" size="icon" className="size-7" onClick={() => onEdit(message)}>
            <Pencil className="size-3.5 text-gray-400" />
          </Button>
        )}
        {(canDelete || canPin) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <MoreHorizontal className="size-3.5 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              {canPin && (
                <DropdownMenuItem onClick={handlePin}>
                  {message.isPinned ? <PinOff className="size-4 mr-2" /> : <Pin className="size-4 mr-2" />}
                  {message.isPinned ? t("unpin_action") : t("pin_action")}
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                  <Trash2 className="size-4 mr-2" />
                  {t("delete_action")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
