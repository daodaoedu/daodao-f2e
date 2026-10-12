"use client";

import type { ChatMessageType } from "@daodao/api";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Spinner } from "@daodao/ui/components/spinner";
import { useEffect, useRef } from "react";
import type { TimelineItem } from "@/hooks/use-chat-timeline";
import { chatDayLabelParts } from "@/utils/chat-format";
import { ChatMessageItem } from "./chat-message-item";

interface ChatMessageListProps {
  timeline: TimelineItem[];
  isLoading: boolean;
  isHost: boolean;
  viewerUserId: number | null;
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
  onReply,
  onEdit,
  onDelete,
  onMutate,
}: ChatMessageListProps) {
  const t = useTranslations("messages");
  const locale = useLocale();
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const msgCount = timeline.filter((i) => i.type === "message").length;
    if (msgCount > 0 && msgCount !== prevCountRef.current) {
      // 只捲對話區自己的捲動容器；scrollIntoView 會連 window 一起捲，把聊天室標頭推出畫面
      const scroller = bottomRef.current?.closest<HTMLElement>("[data-chat-scroll]");
      scroller?.scrollTo({
        top: scroller.scrollHeight,
        behavior: prevCountRef.current === 0 ? "instant" : "smooth",
      });
      prevCountRef.current = msgCount;
    }
  }, [timeline]);

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
        <p className="text-sm">{t("empty")}</p>
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
