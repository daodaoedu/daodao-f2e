"use client";

import type { ChatMessageType } from "@daodao/api";
import { isOwnChatMessage } from "@daodao/api";
import type { MentionCandidate } from "@daodao/features-mention";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Spinner } from "@daodao/ui/components/spinner";
import { useEffect, useRef } from "react";
import type { TimelineItem } from "@/hooks/use-chat-timeline";
import { chatDayLabelParts } from "@/utils/chat-format";
import { decideChatScroll, isNearBottom } from "@/utils/chat-scroll";
import { ChatMessageItem } from "./chat-message-item";

interface ChatMessageListProps {
  timeline: TimelineItem[];
  isLoading: boolean;
  isHost: boolean;
  viewerUserId: number | null;
  mentionCandidates: MentionCandidate[];
  /** 進入聊天室當下的第一則未讀 ID；沒有未讀時 null */
  firstUnreadMessageId: number | null;
  onReply?: (message: ChatMessageType) => void;
  onEdit?: (message: ChatMessageType) => void;
  onDelete?: (message: ChatMessageType) => void;
  onMutate?: () => void;
}

export function ChatMessageList({
  timeline,
  isLoading,
  isHost,
  viewerUserId,
  mentionCandidates,
  firstUnreadMessageId,
  onReply,
  onEdit,
  onDelete,
  onMutate,
}: ChatMessageListProps) {
  const t = useTranslations("messages");
  const locale = useLocale();
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  // 進入聊天室時的第一則未讀；停在那裡直到使用者自己捲回底部（daodao#555）
  const anchoredRef = useRef(false);

  useEffect(() => {
    const messages = timeline.filter((i) => i.type === "message");
    const msgCount = messages.length;
    const last = messages[msgCount - 1];
    const scroller = bottomRef.current?.closest<HTMLElement>("[data-chat-scroll]");
    const prevCount = prevCountRef.current;
    const action = decideChatScroll({
      prevCount,
      nextCount: msgCount,
      firstUnreadMessageId,
      firstUnreadLoaded:
        firstUnreadMessageId !== null &&
        messages.some((i) => i.type === "message" && i.message.id === firstUnreadMessageId),
      anchored: anchoredRef.current,
      lastIsOwn: last?.type === "message" && isOwnChatMessage(last.message, viewerUserId),
    });
    if (msgCount !== prevCountRef.current) prevCountRef.current = msgCount;
    if (!scroller || action === "none") return;
    if (action === "first-unread") {
      const target = scroller.querySelector<HTMLElement>(
        `[data-chat-message="${firstUnreadMessageId}"]`
      );
      if (target) {
        // 只捲對話區自己的捲動容器；scrollIntoView 會連 window 一起捲，把聊天室標頭推出畫面
        const offset = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
        scroller.scrollTo({ top: scroller.scrollTop + offset - 16, behavior: "instant" });
        anchoredRef.current = true;
        return;
      }
    }
    anchoredRef.current = false;
    scroller.scrollTo({
      top: scroller.scrollHeight,
      behavior: prevCount === 0 ? "instant" : "smooth",
    });
  }, [timeline, firstUnreadMessageId, viewerUserId]);

  // 使用者自己捲回底部後，恢復「新訊息自動捲到底」
  useEffect(() => {
    const scroller = bottomRef.current?.closest<HTMLElement>("[data-chat-scroll]");
    if (!scroller) return;
    const onScroll = () => {
      if (anchoredRef.current && isNearBottom(scroller)) anchoredRef.current = false;
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-text-dark/40">
        <p className="text-sm">{t("timeline_empty")}</p>
      </div>
    );
  }

  return (
    // POC：訊息欄最寬 720px 置中、列間距 4px；日期分隔膠囊
    <div className="mx-auto flex max-w-[720px] flex-col gap-1">
      {timeline.map((item) => {
        if (item.type === "date-separator") {
          return (
            <div key={`date-${item.date}`} className="flex justify-center pt-3.5 pb-2.5">
              <span className="inline-flex items-center whitespace-nowrap rounded-full bg-[oklch(0.962_0.032_211.1)] px-3.5 py-1 text-xs text-[oklch(0.445_0.056_192/0.6)]">
                {t("date_divider", chatDayLabelParts(item.date, locale))}
              </span>
            </div>
          );
        }
        return (
          <ChatMessageItem
            key={item.message.id}
            message={item.message}
            isGroupStart={item.isGroupStart}
            isGroupEnd={item.isGroupEnd}
            isHost={isHost}
            viewerUserId={viewerUserId}
            mentionCandidates={mentionCandidates}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onMutate={onMutate}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
