"use client";

import type { ChatMessageType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Spinner } from "@daodao/ui/components/spinner";
import { useEffect, useRef } from "react";
import type { TimelineItem } from "@/hooks/use-chat-timeline";
import { ChatMessageItem } from "./chat-message-item";

interface ChatMessageListProps {
  timeline: TimelineItem[];
  isLoading: boolean;
  isHost: boolean;
  currentUserId: number;
  onReply?: (message: ChatMessageType) => void;
  onEdit?: (message: ChatMessageType) => void;
  onMutate?: () => void;
}

export function ChatMessageList({
  timeline,
  isLoading,
  isHost,
  currentUserId,
  onReply,
  onEdit,
  onMutate,
}: ChatMessageListProps) {
  const t = useTranslations("messages");
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
    <div className="flex flex-col py-2">
      {timeline.map((item) => {
        if (item.type === "date-separator") {
          return (
            <div key={`date-${item.date}`} className="flex justify-center py-3">
              <span className="text-[11px] text-text-dark/40 bg-[#F2F7F7] rounded-full px-3 py-1">
                {item.date}
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
            currentUserId={currentUserId}
            onReply={onReply}
            onEdit={onEdit}
            onMutate={onMutate}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
