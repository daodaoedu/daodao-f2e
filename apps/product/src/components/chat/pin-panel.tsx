"use client";

import type { ChatPinnedMessageType } from "@daodao/api";
import { unpinChatMessage, useChatPins } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { format } from "date-fns";
import { Pin, X } from "lucide-react";
import { useCallback } from "react";
import { toast } from "@daodao/ui/components/sonner";

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
      const msg =
        response.error && typeof response.error === "object" && "message" in response.error
          ? String(response.error.message)
          : t("send_failed");
      toast.error(msg);
      return;
    }
    onUnpin();
  }, [roomId, pin.id, onUnpin, t]);

  const authorName = pin.author?.nickname ?? t("deleted_user");
  const avatar = pin.author?.avatar;
  const pinnedTime = pin.pinnedAt ? format(new Date(pin.pinnedAt), "MM/dd HH:mm") : "";

  return (
    <div className="flex gap-2 p-3 border-b border-border last:border-b-0">
      <div className="size-8 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 overflow-hidden">
        {avatar ? (
          <img src={avatar} alt="" className="size-full object-cover" />
        ) : (
          authorName.charAt(0)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-medium text-text-dark truncate">{authorName}</span>
          <span className="text-text-dark/40 shrink-0">{pinnedTime}</span>
        </div>
        <p className="text-sm text-text-dark/80 line-clamp-2 mt-0.5">{pin.body}</p>
        {isHost && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-text-dark/50 hover:text-red-500 mt-1"
            onClick={handleUnpin}
          >
            {t("unpin_action")}
          </Button>
        )}
      </div>
    </div>
  );
}

export function PinPanel({ roomId, isOpen, onClose, isHost }: PinPanelProps) {
  const t = useTranslations("messages");
  const { data: pins, mutate } = useChatPins(roomId);

  const pinList = Array.isArray(pins) ? pins : [];

  const handleUnpin = useCallback(() => {
    void mutate();
  }, [mutate]);

  return (
    <>
      {isOpen && (
        <div
          className="absolute inset-0 bg-black/20 z-10"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={-1}
          aria-label="Close"
        />
      )}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-[320px] bg-white shadow-lg z-20 flex flex-col transition-transform duration-200",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-1.5">
            <Pin className="size-4 text-text-dark/60" />
            <h3 className="text-sm font-medium text-text-dark">
              {t("pin_panel_count", { count: pinList.length })}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {pinList.length === 0 ? (
            <p className="text-sm text-text-dark/40 text-center py-8">
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
      </div>
    </>
  );
}
