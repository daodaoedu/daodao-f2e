"use client";

import { selectChatPins, useChatPins } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { getStorage, StorageEnum } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { Pin, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const dismissedStorage = getStorage<Record<number, number>>(StorageEnum.ChatPinBannerDismissed);

/**
 * 置頂 banner 是否被收起（per-viewer，記最新置頂 id；有新置頂會重新顯示，FR-MSG-019）。
 * 頁面與標頭共用（POC：banner 顯示時標頭置頂鈕為黃底）。
 */
export function usePinBannerState(roomId: number) {
  const { data: pins } = useChatPins(roomId);
  const latestPin = selectChatPins(pins)[0];
  const latestPinId = latestPin?.id ?? 0;
  const [dismissedId, setDismissedId] = useState<number | undefined>(undefined);

  useEffect(() => {
    setDismissedId(dismissedStorage.get()?.[roomId]);
  }, [roomId]);

  const dismiss = useCallback(() => {
    const stored = dismissedStorage.get() ?? {};
    dismissedStorage.set({ ...stored, [roomId]: latestPinId });
    setDismissedId(latestPinId);
  }, [roomId, latestPinId]);

  const visible = !!latestPin && dismissedId !== latestPinId;
  return { latestPin, visible, dismiss };
}

interface PinBannerProps {
  pin: ReturnType<typeof usePinBannerState>["latestPin"];
  onOpenPinPanel: () => void;
  onDismiss: () => void;
}

/** 置頂訊息 banner（POC 訊息.dc.html：淡黃底、作者＋內容一行、右側收起） */
export function PinBanner({ pin, onOpenPinPanel, onDismiss }: PinBannerProps) {
  const t = useTranslations("messages");
  if (!pin) return null;
  const authorName = pin.author?.nickname ?? t("deleted_user");

  return (
    <div
      data-chat-pin-banner
      className="flex shrink-0 items-center gap-2.5 border-b border-[#E4EAE9] bg-[oklch(0.908_0.186_102.5/0.18)] px-7 py-2.5"
    >
      <Pin className="size-4 shrink-0 text-[oklch(0.445_0.056_192/0.7)]" aria-hidden />
      <button
        type="button"
        onClick={onOpenPinPanel}
        className="flex min-w-0 flex-1 cursor-pointer items-baseline gap-2 border-0 bg-transparent p-0 text-left"
      >
        <span className="shrink-0 text-[11.5px] font-semibold text-[oklch(0.445_0.056_192/0.55)]">
          {authorName}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-[oklch(0.445_0.056_192/0.85)]">
          {pin.body}
        </span>
      </button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDismiss}
        aria-label={t("dismiss_pinned")}
        className="size-7 shrink-0 rounded-full text-[oklch(0.445_0.056_192/0.5)] hover:bg-white/60 hover:text-[oklch(0.445_0.056_192/0.5)] [&_svg]:size-4"
      >
        <X />
      </Button>
    </div>
  );
}
