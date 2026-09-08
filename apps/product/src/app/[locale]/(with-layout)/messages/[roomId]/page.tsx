"use client";

import type { ChatMessageType } from "@daodao/api";
import {
  markChatRoomRead,
  useCurrentUser,
  useChatMessageDelta,
  useChatMessageHistory,
  useChatPins,
  useChatRoom,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Spinner } from "@daodao/ui/components/spinner";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatLayout } from "@/components/chat/chat-layout";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { MemberPanel } from "@/components/chat/member-panel";
import { PinBanner } from "@/components/chat/pin-banner";
import { PinPanel } from "@/components/chat/pin-panel";
import { useChatTimeline } from "@/hooks/use-chat-timeline";

export default function ChatRoomPage() {
  const t = useTranslations("messages");
  const params = useParams<{ roomId: string }>();
  const roomId = Number(params.roomId);

  const { data: userData } = useCurrentUser();
  const currentUserId = userData?.data?.id ? Number(userData.data.id) : 0;
  const { data: room, isLoading: roomLoading } = useChatRoom(roomId || null);
  const { data: pinsData } = useChatPins(roomId || null);

  const {
    data: historyData,
    isLoading: historyLoading,
    mutate: mutateHistory,
  } = useChatMessageHistory(roomId || null);

  const historyMessages: ChatMessageType[] = useMemo(
    () => historyData?.messages ?? [],
    [historyData],
  );

  const latestId = historyMessages.length > 0 ? historyMessages[historyMessages.length - 1]!.id : null;
  const sinceRef = useRef<string | null>(null);
  useEffect(() => {
    if (historyData && !sinceRef.current) {
      sinceRef.current = new Date().toISOString();
    }
  }, [historyData]);

  const { data: deltaData } = useChatMessageDelta(roomId || null, latestId, sinceRef.current);

  const delta = useMemo(() => {
    if (!deltaData) return null;
    return {
      messages: deltaData.messages ?? [],
      changed: deltaData.changed ?? [],
      deletedIds: deltaData.deletedIds ?? [],
    };
  }, [deltaData]);

  const timeline = useChatTimeline(historyMessages, delta);

  const [replyTo, setReplyTo] = useState<ChatMessageType | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessageType | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPins, setShowPins] = useState(false);

  const isHost = room?.viewerRole === "host";
  const pinnedCount = pinsData ? (Array.isArray(pinsData) ? pinsData.length : 0) : 0;

  useEffect(() => {
    const allMessages = timeline.filter((i) => i.type === "message");
    const last = allMessages[allMessages.length - 1];
    if (roomId && last && last.type === "message") {
      void markChatRoomRead(roomId, last.message.id);
    }
  }, [roomId, timeline]);

  const handleReply = useCallback((message: ChatMessageType) => {
    setEditingMessage(null);
    setReplyTo(message);
  }, []);

  const handleEdit = useCallback((message: ChatMessageType) => {
    setReplyTo(null);
    setEditingMessage(message);
  }, []);

  const handleMutate = useCallback(() => {
    void mutateHistory();
  }, [mutateHistory]);

  const togglePanel = useCallback((panel: "search" | "members" | "pins") => {
    setShowSearch(panel === "search" ? (v) => !v : false);
    setShowMembers(panel === "members" ? (v) => !v : false);
    setShowPins(panel === "pins" ? (v) => !v : false);
  }, []);

  return (
    <ChatLayout roomId={roomId}>
      {roomLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="size-6" />
        </div>
      ) : !room ? (
        <div className="flex flex-1 items-center justify-center text-text-dark/50">
          <p className="text-sm">{t("empty")}</p>
        </div>
      ) : (
        <div className="relative flex flex-col flex-1 min-h-0">
          <ChatHeader
            name={room.name}
            memberCount={room.memberCount}
            iconLabel={room.iconLabel}
            colorSeed={room.colorSeed}
            pinnedCount={pinnedCount}
            onToggleSearch={() => togglePanel("search")}
            onToggleMembers={() => togglePanel("members")}
            onTogglePins={() => togglePanel("pins")}
          />
          <PinBanner roomId={roomId} onOpenPinPanel={() => togglePanel("pins")} />
          <div className="flex-1 overflow-y-auto">
            <ChatMessageList
              timeline={timeline}
              isLoading={historyLoading}
              isHost={isHost}
              currentUserId={currentUserId}
              onReply={handleReply}
              onEdit={handleEdit}
              onMutate={handleMutate}
            />
          </div>
          <ChatInput
            roomId={roomId}
            replyTo={replyTo}
            editingMessage={editingMessage}
            onClearReply={() => setReplyTo(null)}
            onClearEdit={() => setEditingMessage(null)}
            onMessageSent={handleMutate}
            onMessageEdited={handleMutate}
          />
          <PinPanel
            roomId={roomId}
            isOpen={showPins}
            onClose={() => setShowPins(false)}
            isHost={isHost}
          />
          <MemberPanel
            roomId={roomId}
            isOpen={showMembers}
            onClose={() => setShowMembers(false)}
          />
        </div>
      )}
    </ChatLayout>
  );
}
