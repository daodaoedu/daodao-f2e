"use client";

import type { ChatMessageType } from "@daodao/api";
import { markChatRoomRead, useChatMessages, useChatRoom } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Spinner } from "@daodao/ui/components/spinner";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";

export default function ChatRoomPage() {
  const t = useTranslations("messages");
  const params = useParams<{ roomId: string }>();
  const roomId = Number(params.roomId);

  const { data: room, isLoading: roomLoading } = useChatRoom(roomId || null);
  const {
    data: messagesData,
    isLoading: messagesLoading,
    mutate: mutateMessages,
  } = useChatMessages(roomId || null);
  const [replyTo, setReplyTo] = useState<ChatMessageType | null>(null);

  const messages = messagesData?.messages ?? [];

  // Mark room as read on mount and when messages update
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (roomId && lastMessage) {
      void markChatRoomRead(roomId, lastMessage.id);
    }
  }, [roomId, messages]);

  const handleReply = useCallback((message: ChatMessageType) => {
    setReplyTo(message);
  }, []);

  const handleClearReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleMessageSent = useCallback(() => {
    void mutateMessages();
  }, [mutateMessages]);

  if (roomLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen text-text-dark/50">
        <p className="text-sm">{t("empty")}</p>
      </div>
    );
  }

  const isReadOnly = room.contentState === "read_only";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <ChatHeader
        name={room.name}
        memberCount={room.memberCount}
        iconLabel={room.iconLabel}
        colorSeed={room.colorSeed}
      />

      {/* Messages */}
      <div className="flex-1 max-w-[640px] w-full mx-auto overflow-y-auto">
        <ChatMessageList
          messages={messages}
          isLoading={messagesLoading}
          onReply={handleReply}
          onLikeToggle={() => void mutateMessages()}
        />
      </div>

      {/* Input */}
      <div className="max-w-[640px] w-full mx-auto">
        <ChatInput
          roomId={roomId}
          replyTo={replyTo}
          onClearReply={handleClearReply}
          onMessageSent={handleMessageSent}
          disabled={isReadOnly}
        />
      </div>
    </div>
  );
}
