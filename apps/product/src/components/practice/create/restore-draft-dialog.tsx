"use client";

import type { DraftData } from "@daodao/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Button } from "@daodao/ui/components/button";
import type { FieldValues } from "react-hook-form";

interface RestoreDraftDialogProps<TFormValues extends FieldValues> {
  /** 是否顯示對話框 */
  open: boolean;
  /** 暫存資料 */
  draft: DraftData<TFormValues> | null;
  /** 標題 */
  title?: string;
  /** 描述文字 */
  description?: string;
  /** 恢復按鈕文字 */
  restoreButtonText?: string;
  /** 清除按鈕文字 */
  discardButtonText?: string;
  /** 自訂預覽內容的渲染函數 */
  renderPreview?: (draft: DraftData<TFormValues>) => React.ReactNode;
  /** 恢復資料的回調 */
  onRestore: () => void;
  /** 清除資料的回調 */
  onDiscard: () => void;
}

/**
 * 恢復暫存資料確認對話框
 */
export function RestoreDraftDialog<TFormValues extends FieldValues>({
  open,
  draft,
  title = "恢復暫存資料",
  description = "偵測到您有未完成的資料，是否要恢復？",
  restoreButtonText = "恢復資料",
  discardButtonText = "重新開始",
  renderPreview,
  onRestore,
  onDiscard,
}: RestoreDraftDialogProps<TFormValues>) {
  if (!draft) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDiscard()}>
      <DialogContent
        from="bottom"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {renderPreview
          ? renderPreview(draft)
          : draft.formValues &&
            typeof draft.formValues === "object" &&
            "name" in draft.formValues &&
            draft.formValues.name && (
              <div className="mb-6 rounded-lg bg-bg-gray p-4">
                <p className="text-xs text-text-dark mb-1">名稱</p>
                <p className="text-sm font-medium text-text-dark">
                  {String(draft.formValues.name)}
                </p>
              </div>
            )}

        <DialogFooter className="flex-row gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onDiscard}
            className="flex-1 sm:flex-initial"
          >
            {discardButtonText}
          </Button>
          <Button type="button" onClick={onRestore} className="flex-1 sm:flex-initial">
            {restoreButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
