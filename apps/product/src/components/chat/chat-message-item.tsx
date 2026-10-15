"use client";

import type { ChatMessageType } from "@daodao/api";
import {
  isOwnChatMessage,
  likeChatMessage,
  pinChatMessage,
  unlikeChatMessage,
  unpinChatMessage,
} from "@daodao/api";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { Heart, MoreHorizontal, Pencil, Pin, PinOff, Reply, Shield, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { formatChatClock } from "@/hooks/use-chat-timeline";
import { formatRelativeTime } from "@/utils/format-time";
import { ChatAvatar } from "./chat-avatar";

// POC 訊息.dc.html 的色票：TEAL = oklch(0.711 0.12 190.6)、SLATE = oklch(0.445 0.056 192)
const ACTION_BUTTON =
  "size-[26px] rounded-full text-[oklch(0.445_0.056_192/0.6)] hover:bg-[oklch(0.962_0.032_211.1)] hover:text-[oklch(0.445_0.056_192)] [&_svg]:size-[15px]";
const MENU_ITEM =
  "gap-2 rounded-[8px] px-2.5 py-[7px] text-[13px] whitespace-nowrap [&_svg]:size-3.5";

interface ChatMessageItemProps {
  message: ChatMessageType;
  isGroupStart: boolean;
  isGroupEnd: boolean;
  isHost: boolean;
  /** 當前使用者的內部 users.id（聊天室詳情 viewerUserId）；未載入時 null */
  viewerUserId: number | null;
  onReply?: (message: ChatMessageType) => void;
  onEdit?: (message: ChatMessageType) => void;
  /** 要求刪除（由頁面先跳確認框，確認後才真的刪） */
  onDelete?: (message: ChatMessageType) => void;
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
  isHost,
  viewerUserId,
  onReply,
  onEdit,
  onDelete,
  onMutate,
}: ChatMessageItemProps) {
  const t = useTranslations("messages");
  const [liked, setLiked] = useState(message.likedByMe);
  const [likeCount, setLikeCount] = useState(message.likeCount);

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

  const handlePin = useCallback(async () => {
    try {
      if (message.isPinned) await unpinChatMessage(message.roomId, message.id);
      else await pinChatMessage(message.roomId, message.id);
      onMutate?.();
    } catch {
      toast.error(t("send_failed"));
    }
  }, [message.roomId, message.id, message.isPinned, onMutate, t]);

  if (message.kind === "system") return <SystemMessage message={message} />;

  const author = message.author;
  const authorName = author?.nickname ?? t("deleted_user");
  const isOwn = isOwnChatMessage(message, viewerUserId);
  const canEdit = isOwn && message.kind === "text";
  const canDelete = isOwn || isHost;
  const canPin = isHost;
  const grouped = !isGroupStart;
  const time = formatChatClock(message.createdAt);

  return (
    // POC：本人訊息靠右（FR-MSG-009）、同作者連續訊息群組化只第一則有頭像與名稱（FR-MSG-010）
    <div
      data-own-message={isOwn || undefined}
      data-chat-message={message.id}
      className={cn(
        "group flex items-start gap-2.5",
        isOwn ? "justify-end" : "justify-start",
        grouped ? "py-0.5" : "pt-2 pb-0.5"
      )}
    >
      {grouped ? (
        <span className={cn("w-8 shrink-0", isOwn && "order-2")} />
      ) : (
        <ChatAvatar src={author?.avatar} alt={authorName} className={cn(isOwn && "order-2")} />
      )}

      <div className={cn("flex min-w-0 max-w-[76%] flex-col", isOwn ? "items-end" : "items-start")}>
        {/* 名稱只在他人訊息的群組第一則顯示；發起人加盾牌（FR-MSG-011） */}
        {!grouped && !isOwn && (
          <div className="mb-[5px] flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-[oklch(0.287_0.041_210.8)]">
              {authorName}
            </span>
            {author?.isHost && (
              <span
                role="img"
                aria-label={t("host_badge")}
                title={t("host_badge")}
                className="inline-flex shrink-0 text-[oklch(0.711_0.12_190.6)]"
              >
                <Shield className="size-[13px] fill-current stroke-none" />
              </span>
            )}
          </div>
        )}

        <div className={cn("relative flex max-w-full", isOwn ? "justify-end" : "justify-start")}>
          {/* Bubble */}
          <div
            data-chat-bubble
            className={cn(
              "border px-4 py-[11px] text-sm leading-[1.75] break-words shadow-[0_1px_2px_rgba(15,48,54,0.04)] transition-[box-shadow,border-color] duration-[140ms]",
              "group-hover:border-[oklch(0.711_0.12_190.6)] group-hover:shadow-[0_0_0_2px_oklch(0.711_0.12_190.6/0.22)]",
              isOwn
                ? "rounded-[18px_18px_4px_18px] border-[oklch(0.711_0.12_190.6)] bg-[oklch(0.711_0.12_190.6)] text-white"
                : "rounded-[18px_18px_18px_4px] border-[#E4EAE9] bg-white text-[oklch(0.445_0.056_192)]"
            )}
          >
            {message.replyTo && (
              <div
                className={cn(
                  "-mx-2.5 -mt-[3px] mb-1 overflow-hidden rounded-[8px] border-l-[3px] px-2.5 pt-[5px] pb-1.5",
                  isOwn
                    ? "border-white bg-white/[0.18]"
                    : "border-[oklch(0.711_0.12_190.6)] bg-[oklch(0.962_0.032_211.1/0.75)]"
                )}
              >
                {message.replyTo.isDeleted ? (
                  <span
                    className={cn(
                      "block text-[12.5px] italic leading-[1.5]",
                      isOwn ? "text-white/[0.82]" : "text-[oklch(0.445_0.056_192/0.62)]"
                    )}
                  >
                    {t("reply_to_deleted")}
                  </span>
                ) : (
                  <>
                    <span
                      className={cn(
                        "mb-px block truncate text-xs font-semibold",
                        isOwn ? "text-white" : "text-[oklch(0.711_0.12_190.6)]"
                      )}
                    >
                      {message.replyTo.authorName}
                    </span>
                    <span
                      className={cn(
                        "line-clamp-2 block text-[12.5px] leading-[1.5] break-words",
                        isOwn ? "text-white/[0.82]" : "text-[oklch(0.445_0.056_192/0.62)]"
                      )}
                    >
                      {message.replyTo.bodyPreview}
                    </span>
                  </>
                )}
              </div>
            )}
            <span className="block whitespace-pre-wrap">{message.body}</span>
          </div>

          {/* Hover action bar：POC 位置，本人靠右上、他人靠左上，蓋在氣泡上緣（時間在氣泡下方，不會被蓋到） */}
          <div
            data-chat-actions
            className={cn(
              "invisible absolute -top-[17px] z-[5] flex items-center gap-0.5 rounded-full border border-[#E4EAE9] bg-white p-[3px] shadow-[0_4px_14px_rgba(15,48,54,0.12)] group-hover:visible focus-within:visible has-[[data-chat-menu]]:visible",
              isOwn ? "right-1.5" : "left-1.5"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className={cn(ACTION_BUTTON, liked && "text-[oklch(0.711_0.12_190.6)]")}
              aria-label={t("like_action")}
              aria-pressed={liked}
              onClick={handleLikeToggle}
            >
              <Heart className={cn(liked && "fill-current")} />
            </Button>
            {onReply && (
              <Button
                variant="ghost"
                size="icon"
                className={ACTION_BUTTON}
                aria-label={t("reply_action")}
                onClick={() => onReply(message)}
              >
                <Reply />
              </Button>
            )}
            {canEdit && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className={ACTION_BUTTON}
                aria-label={t("edit_action")}
                onClick={() => onEdit(message)}
              >
                <Pencil />
              </Button>
            )}
            {(canDelete || canPin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={ACTION_BUTTON}
                    aria-label={t("more_actions")}
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  data-chat-menu
                  align={isOwn ? "end" : "start"}
                  sideOffset={5}
                  className={cn(
                    "z-[6] mt-0 flex min-w-[104px] flex-col rounded-[12px] border-[#E4EAE9] p-1 shadow-[0_8px_22px_rgba(15,48,54,0.14)]",
                    // 選單與操作列同邊對齊（POC right/left: 6px）
                    isOwn ? "-right-1" : "-left-[60px]"
                  )}
                >
                  {canPin && (
                    <DropdownMenuItem
                      onClick={handlePin}
                      className={cn(MENU_ITEM, "text-[oklch(0.445_0.056_192)]")}
                    >
                      {message.isPinned ? <PinOff /> : <Pin />}
                      {message.isPinned ? t("unpin_action") : t("pin_action")}
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete?.(message)}
                      className={cn(
                        MENU_ITEM,
                        "text-[oklch(0.58_0.16_25/0.85)] focus:text-[oklch(0.58_0.16_25/0.85)]"
                      )}
                    >
                      <Trash2 />
                      {t("delete_action")}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Footer：反應 pill＋時間；本人訊息反轉，時間靠右（FR-MSG-013「・已編輯」） */}
        <div
          className={cn(
            "mt-[5px] flex items-center gap-2.5",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}
        >
          {likeCount > 0 && (
            <button
              type="button"
              onClick={handleLikeToggle}
              className={cn(
                "inline-flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-[9px] text-xs",
                liked
                  ? "border-[oklch(0.711_0.12_190.6)] bg-[oklch(0.962_0.032_211.1)] text-[oklch(0.711_0.12_190.6)]"
                  : "border-[#E4EAE9] bg-white text-[oklch(0.445_0.056_192/0.7)]"
              )}
            >
              <Heart className={cn("size-[13px]", liked && "fill-current")} />
              {likeCount}
            </button>
          )}
          <span data-chat-time className="text-[11px] text-[oklch(0.445_0.056_192/0.4)]">
            {time}
            {message.editedAt && `・${t("message_edited")}`}
          </span>
        </div>
      </div>
    </div>
  );
}
