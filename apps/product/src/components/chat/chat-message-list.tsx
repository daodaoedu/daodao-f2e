"use client";

import type { ChatMessageType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Spinner } from "@daodao/ui/components/spinner";
import { useEffect, useRef } from "react";
import { ChatMessageItem } from "./chat-message-item";

// ============================================================================
// Types
// ============================================================================

interface ChatMessageListProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onReply?: (message: ChatMessageType) => void;
  onLikeToggle?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function ChatMessageList({ messages, isLoading, onReply, onLikeToggle }: ChatMessageListProps) {
  const t = useTranslations("messages");
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  // Scroll to bottom on initial load and when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && messages.length !== prevMessageCountRef.current) {
      bottomRef.current?.scrollIntoView({
        behavior: prevMessageCountRef.current === 0 ? "instant" : "smooth",
      });
      prevMessageCountRef.current = messages.length;
    }
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-text-dark/40">
        <p className="text-sm">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-2">
      {messages.map((message) => (
        <ChatMessageItem
          key={message.id}
          message={message}
          onReply={onReply}
          onLikeToggle={onLikeToggle}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
