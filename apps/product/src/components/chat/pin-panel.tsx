"use client";

import type { ChatPinnedMessageType } from "@daodao/api";
import { selectChatErrorMessage, selectChatPins, unpinChatMessage, useChatPins } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { X } from "lucide-react";
import { useCallback } from "react";
import { chatShortDate } from "@/utils/chat-format";

interface PinPanelProps {
  roomId: number;
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
}

function PinnedItem({
  pin,
  isHost,
  roomId,
  onUnpin,
}: {
  pin: ChatPinnedMessageType;
  isHost: boolean;
  roomId: number;
  onUnpin: () => void;
}) {
  const t = useTranslations("messages");

  const handleUnpin = useCallback(async () => {
    const response = await unpinChatMessage(roomId, pin.id);
    if (response.error) {
      toast.error(selectChatErrorMessage(response.error, t("send_failed")));
      return;
    }
    onUnpin();
  }, [roomId, pin.id, onUnpin, t]);

  const authorName = pin.author?.nickname ?? t("deleted_user");

  return (
    <div
      data-chat-pin-item
      className="rounded-2xl border border-[#E4EAE9] bg-[oklch(0.992_0.011_182.9)] px-3.5 py-3"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[oklch(0.287_0.041_210.8)]">
          {authorName}
        </span>
        <span className="shrink-0 text-[11px] text-[oklch(0.445_0.056_192/0.4)]">
          {chatShortDate(pin.createdAt)}
        </span>
      </div>
      <p className="m-0 text-[13px] leading-[1.7] break-words whitespace-pre-wrap text-[oklch(0.445_0.056_192/0.9)]">
        {pin.body}
      </p>
      {isHost && (
        <Button
          variant="ghost"
          onClick={handleUnpin}
          className="mt-[9px] h-auto rounded-none border-0 bg-transparent p-0 text-xs font-normal text-[oklch(0.445_0.056_192/0.5)] hover:bg-transparent hover:text-[oklch(0.58_0.16_25)]"
        >
          {t("unpin_action")}
        </Button>
      )}
    </div>
  );
}

/** 置頂訊息面板（POC 訊息.dc.html：右側 320px、淡遮罩、卡片列表、開啟時才渲染） */
export function PinPanel({ roomId, isOpen, onClose, isHost }: PinPanelProps) {
  const t = useTranslations("messages");
  const { data: pins, mutate } = useChatPins(roomId);

  const pinList = selectChatPins(pins);

  const handleUnpin = useCallback(() => {
    void mutate();
  }, [mutate]);

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        className="absolute inset-0 z-[29] cursor-pointer border-0 bg-[rgba(15,48,54,0.25)] p-0"
        onClick={onClose}
        aria-label={t("pin_panel_title")}
      />
      <aside
        aria-label={t("pin_panel_title")}
        data-chat-pin-panel
        className="absolute top-0 right-0 z-30 flex h-full w-[320px] flex-col border-l border-[#E4EAE9] bg-white shadow-[-8px_0_24px_rgba(15,48,54,0.12)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#E4EAE9] px-5 pt-[18px] pb-3">
          <p className="m-0 text-[13px] font-bold text-[oklch(0.287_0.041_210.8)]">
            {t("pin_panel_count", { count: pinList.length })}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 rounded-full text-[oklch(0.445_0.056_192/0.5)] hover:bg-[oklch(0.962_0.032_211.1)] hover:text-[oklch(0.445_0.056_192/0.5)] [&_svg]:size-4"
            onClick={onClose}
            aria-label={t("delete_cancel")}
          >
            <X />
          </Button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3.5 pt-2.5 pb-[18px]">
          {pinList.length === 0 ? (
            <p className="mx-1.5 my-5 text-[13px] leading-[1.8] text-[oklch(0.445_0.056_192/0.5)]">
              {t("pin_panel_empty")}
            </p>
          ) : (
            pinList.map((pin) => (
              <PinnedItem
                key={pin.id}
                pin={pin}
                isHost={isHost}
                roomId={roomId}
                onUnpin={handleUnpin}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
}
