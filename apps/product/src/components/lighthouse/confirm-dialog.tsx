"use client";

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
import { LIGHTHOUSE_SCOPE } from "./lighthouse-scope";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 破壞性動作（刪除／封存）用紅色確認鈕 */
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
}

/**
 * 燈塔共用確認框：取代 window.confirm（遮罩點擊、Escape 皆視為取消）。
 * 標題／說明由呼叫端給，按鈕文案預設「取消」「確定」。
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  busy = false,
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) {
  const t = useTranslations("lighthouse");
  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent
        overlayClassName="bg-[#0F3036]/30"
        className={cn(
          "w-[min(440px,92vw)] sm:max-w-none rounded-[28px] border-0 bg-white p-6",
          LIGHTHOUSE_SCOPE
        )}
      >
        <DialogHeader className="items-start text-left">
          <DialogTitle className="text-left text-xl font-semibold text-[#0D3036]">
            {title}
          </DialogTitle>
          <DialogDescription
            className={cn("text-left text-sm text-[#5A7B79]", !description && "sr-only")}
          >
            {description ?? title}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-[#CDEBE8]"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel ?? t("cancel")}
          </Button>
          <Button
            type="button"
            className={cn(
              "rounded-full",
              destructive &&
                "bg-[#C03A3A] text-white hover:bg-[#A63232] focus-visible:outline-[#C03A3A]"
            )}
            disabled={busy}
            onClick={() => void onConfirm()}
          >
            {confirmLabel ?? t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
