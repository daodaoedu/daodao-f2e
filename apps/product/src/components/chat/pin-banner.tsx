"use client";

import { useChatPins } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { getStorage, StorageEnum } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { Pin, X } from "lucide-react";
import { useCallback, useMemo } from "react";

interface PinBannerProps {
  roomId: number;
  onOpenPinPanel: () => void;
}

const dismissedStorage = getStorage<Record<number, number>>(StorageEnum.ChatPinBannerDismissed);

export function PinBanner({ roomId, onOpenPinPanel }: PinBannerProps) {
  const t = useTranslations("messages");
  const { data: pins } = useChatPins(roomId);

  const latestPin = Array.isArray(pins) ? pins[0] : undefined;
  const latestPinId = latestPin?.id ?? 0;

  const isDismissed = useMemo(() => {
    const stored = dismissedStorage.get();
    return stored?.[roomId] === latestPinId;
  }, [roomId, latestPinId]);

  const handleDismiss = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const stored = dismissedStorage.get() ?? {};
      dismissedStorage.set({ ...stored, [roomId]: latestPinId });
    },
    [roomId, latestPinId]
  );

  if (!latestPin || isDismissed) return null;

  const authorName = latestPin.author?.nickname ?? t("deleted_user");
  const bodyPreview =
    latestPin.body.length > 60 ? `${latestPin.body.slice(0, 60)}...` : latestPin.body;

  return (
    <button
      type="button"
      onClick={onOpenPinPanel}
      className="flex items-center gap-2 w-full px-3 py-2 bg-yellow-50 border-l-4 border-yellow-400 text-left hover:bg-yellow-100/80 transition-colors"
    >
      <Pin className="size-4 shrink-0 text-yellow-600" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-yellow-800 truncate">
          {t("pin_banner", { name: authorName })}
        </p>
        <p className="text-xs text-yellow-700/80 truncate">{bodyPreview}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200/50"
        onClick={handleDismiss}
        aria-label={t("delete_cancel")}
      >
        <X className="size-3.5" />
      </Button>
    </button>
  );
}
