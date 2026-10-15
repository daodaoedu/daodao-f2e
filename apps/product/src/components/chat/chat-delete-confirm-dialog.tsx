"use client";

import type { ChatMessageType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";

interface ChatDeleteConfirmDialogProps {
  /** 待確認刪除的訊息；null 時關閉 */
  message: ChatMessageType | null;
  /** 是否為自己的訊息（決定文案：刪除訊息／刪除 {name} 的訊息） */
  isOwn: boolean;
  onCancel: () => void;
  onConfirm: (message: ChatMessageType) => void;
  /** 對話時間軸區塊（relative）；POC 遮罩只蓋這一塊，框置中於此 */
  container?: HTMLElement | null;
}

/** 刪除訊息確認框（FR-MSG-018，POC 訊息.dc.html「刪除訊息／無法復原」） */
export function ChatDeleteConfirmDialog({
  message,
  isOwn,
  onCancel,
  onConfirm,
  container,
}: ChatDeleteConfirmDialogProps) {
  const t = useTranslations("messages");
  const name = message?.author?.nickname ?? t("deleted_user");

  return (
    <Dialog open={message !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        showCloseButton={false}
        portalContainer={container}
        overlayClassName={cn("bg-[rgba(15,48,54,0.35)]", container && "absolute z-[39]")}
        className={cn(
          "w-[300px] max-w-[calc(100%-40px)] gap-0 rounded-2xl border-0 bg-white px-[22px] pt-[22px] pb-[18px] shadow-[0_18px_44px_rgba(15,48,54,0.22)] sm:max-w-[calc(100%-40px)]",
          container && "absolute z-40"
        )}
        data-chat-delete-dialog
      >
        <DialogHeader className="gap-0 pt-0 text-left">
          <DialogTitle className="mb-1.5 text-left text-[15px] leading-[normal] font-bold text-[oklch(0.287_0.041_210.8)]">
            {isOwn ? t("delete_confirm_title") : t("delete_confirm_title_other", { name })}
          </DialogTitle>
          <DialogDescription className="mb-[18px] text-[13px] leading-[1.7] text-[oklch(0.445_0.056_192/0.75)]">
            {isOwn ? t("delete_confirm_message") : t("delete_confirm_message_other")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="h-auto rounded-full border border-[#E4EAE9] bg-white px-4 py-2 text-[13px] font-normal text-[oklch(0.445_0.056_192)] hover:bg-[oklch(0.962_0.032_211.1)] hover:text-[oklch(0.445_0.056_192)]"
          >
            {t("delete_cancel")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => message && onConfirm(message)}
            className="h-auto rounded-full border-0 bg-[oklch(0.58_0.16_25)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[oklch(0.52_0.16_25)] hover:text-white"
          >
            {t("delete_confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
