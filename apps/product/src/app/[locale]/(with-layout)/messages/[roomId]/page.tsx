"use client";

import type { ChatMessageType } from "@daodao/api";
import {
  chatDeltaAfter,
  deleteChatMessage,
  isOwnChatMessage,
  markChatRoomRead,
  selectChatDelta,
  selectChatHistory,
  selectChatPins,
  selectChatRoom,
  useChatMessageDelta,
  useChatMessageHistory,
  useChatPins,
  useChatRoom,
  useMyChatRooms,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { Spinner } from "@daodao/ui/components/spinner";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatDeleteConfirmDialog } from "@/components/chat/chat-delete-confirm-dialog";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatLayout } from "@/components/chat/chat-layout";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { MemberPanel } from "@/components/chat/member-panel";
import { PinBanner, usePinBannerState } from "@/components/chat/pin-banner";
import { PinPanel } from "@/components/chat/pin-panel";
import { SearchBar } from "@/components/chat/search-bar";
import { useChatTimeline } from "@/hooks/use-chat-timeline";
import { useServerErrorMessage } from "@/lib/server-error/use-server-error-message";
import { runOptimisticDelete } from "@/utils/chat-optimistic-delete";

export default function ChatRoomPage() {
  const t = useTranslations("messages");
  const { errorMessage, locale } = useServerErrorMessage();
  const params = useParams<{ roomId: string }>();
  const roomId = Number(params.roomId);

  const {
    data: roomData,
    isLoading: roomLoading,
    error: roomError,
    mutate: mutateRoom,
  } = useChatRoom(roomId || null);
  const room = selectChatRoom(roomData);
  // 訊息 author.userId 是內部 users.id；/users/me 只給 UUID，所以用聊天室詳情的 viewerUserId 判斷本人訊息
  const viewerUserId = room?.viewerUserId ?? null;
  const { mutate: mutateRooms } = useMyChatRooms();
  const { data: pinsData, mutate: mutatePins } = useChatPins(roomId || null);

  const {
    data: historyData,
    isLoading: historyLoading,
    mutate: mutateHistory,
  } = useChatMessageHistory(roomId || null);

  const historyMessages: ChatMessageType[] = useMemo(
    () => selectChatHistory(historyData),
    [historyData]
  );

  const latestId = chatDeltaAfter(historyData !== undefined, historyMessages);
  // 用 state 而不是 ref：設定後要觸發重繪，增量輪詢才會啟動（空聊天室沒有其他東西會觸發重繪）
  const [since, setSince] = useState<string | null>(null);
  useEffect(() => {
    if (historyData) {
      setSince((prev) => prev ?? new Date().toISOString());
    }
  }, [historyData]);

  const { data: deltaData } = useChatMessageDelta(roomId || null, latestId, since);

  const delta = useMemo(() => selectChatDelta(deltaData), [deltaData]);

  // 本機剛刪除的訊息：立刻從時間軸拿掉，不等輪詢；刪除失敗時移出集合、訊息放回
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<number>>(() => new Set());
  const timeline = useChatTimeline(historyMessages, delta, hiddenIds);

  const [replyTo, setReplyTo] = useState<ChatMessageType | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessageType | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPins, setShowPins] = useState(false);

  const isHost = room?.viewerRole === "host";
  const pinnedCount = selectChatPins(pinsData).length;

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
    // 置頂／取消置頂後，置頂 banner 與標頭置頂鈕要跟著更新
    void mutatePins();
    // 聊天室列表的最後一則預覽（POC「你：…」）立即更新，不等 30 秒輪詢
    void mutateRooms();
  }, [mutateHistory, mutatePins, mutateRooms]);

  const handleDelete = useCallback(
    async (message: ChatMessageType) => {
      await runOptimisticDelete({
        hide: () => setHiddenIds((prev) => new Set(prev).add(message.id)),
        restore: () =>
          setHiddenIds((prev) => {
            const next = new Set(prev);
            next.delete(message.id);
            return next;
          }),
        request: () => deleteChatMessage(message.roomId, message.id),
        // 刪掉的可能是置頂訊息：一併重抓置頂（banner、置頂面板、置頂數）
        onSuccess: handleMutate,
        onError: (error) => toast.error(errorMessage(error, t("delete_failed"))),
      });
    },
    [handleMutate, t, errorMessage]
  );

  // 刪除前先確認（FR-MSG-018、POC「刪除訊息／無法復原」）；確認後才跑樂觀刪除
  const [deleteTarget, setDeleteTarget] = useState<ChatMessageType | null>(null);
  const [timelinePane, setTimelinePane] = useState<HTMLDivElement | null>(null);
  const pinBanner = usePinBannerState(roomId);
  const handleConfirmDelete = useCallback(
    (message: ChatMessageType) => {
      setDeleteTarget(null);
      void handleDelete(message);
    },
    [handleDelete]
  );

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
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="flex max-w-sm flex-col items-center gap-4 text-center" role="alert">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-text-dark">{t("room_unavailable")}</h2>
              <p className="text-sm text-text-dark/70">
                {errorMessage(roomError, t("room_load_failed"))}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <CustomLink href="/messages" locale={locale}>
                  {t("back_to_rooms")}
                </CustomLink>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  void mutateRoom();
                  void mutateHistory();
                  void mutatePins();
                  void mutateRooms();
                }}
              >
                {t("retry_loading")}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col flex-1 min-h-0">
          <ChatHeader
            roomId={roomId}
            name={room.name}
            memberCount={room.memberCount}
            colorSeed={room.colorSeed}
            pinnedCount={pinnedCount}
            pinnedHighlighted={pinBanner.visible}
            membersOpen={showMembers}
            searchOpen={showSearch}
            onToggleSearch={() => togglePanel("search")}
            onToggleMembers={() => togglePanel("members")}
            onTogglePins={() => togglePanel("pins")}
          />
          {showSearch && (
            <SearchBar roomId={roomId} isOpen={showSearch} onClose={() => setShowSearch(false)} />
          )}
          {pinBanner.visible && (
            <PinBanner
              pin={pinBanner.latestPin}
              onOpenPinPanel={() => togglePanel("pins")}
              onDismiss={pinBanner.dismiss}
            />
          )}
          {/* 時間軸區塊：刪除確認框的遮罩只蓋這一塊（POC） */}
          <div ref={setTimelinePane} className="relative flex min-h-0 flex-1" data-chat-pane>
            <div className="min-w-0 flex-1 overflow-y-auto px-7 pt-6 pb-2" data-chat-scroll>
              <ChatMessageList
                timeline={timeline}
                isLoading={historyLoading}
                isHost={isHost}
                viewerUserId={viewerUserId}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                onMutate={handleMutate}
              />
            </div>
            {/* POC：成員／置頂面板與遮罩都在時間軸區塊內 */}
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
          <ChatInput
            roomId={roomId}
            replyTo={replyTo}
            editingMessage={editingMessage}
            onClearReply={() => setReplyTo(null)}
            onClearEdit={() => setEditingMessage(null)}
            onMessageSent={handleMutate}
            onMessageEdited={handleMutate}
          />
          <ChatDeleteConfirmDialog
            message={deleteTarget}
            isOwn={deleteTarget !== null && isOwnChatMessage(deleteTarget, viewerUserId)}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleConfirmDelete}
            container={timelinePane}
          />
        </div>
      )}
    </ChatLayout>
  );
}
