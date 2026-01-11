"use client";

import type { DraftData } from "@daodao/shared";
import { useDialogManager } from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { useCallback } from "react";
import type { FieldValues } from "react-hook-form";
import { Image } from "@daodao/ui/components/image";
import InfoPng from "@daodao/assets/images/dialog/info.png";

interface UseRestoreDraftDialogOptions<TFormValues extends FieldValues> {
  /** 暫存資料 */
  draft: DraftData<TFormValues> | null;
  /** 恢復資料的回調 */
  onRestore: () => void;
  /** 清除資料的回調 */
  onDiscard: () => void;
}

const DIALOG_CONTENT = (
  <div className="pt-4 pb-16">
    <Image src={InfoPng} alt="info" width={172} height={172} className="mx-auto pb-8" />
    <p className="text-center">偵測到您有未完成的資料，是否要恢復？</p>
  </div>
);

const DIALOG_TITLE = "恢復暫存資料";
const RESTORE_BUTTON_TEXT = "恢復資料";
const DISCARD_BUTTON_TEXT = "重新開始";

/**
 * 使用全局 DialogManager 來顯示恢復暫存資料對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openRestoreDialog } = useRestoreDraftDialog({
 *   draft,
 *   onRestore: handleRestore,
 *   onDiscard: handleDiscard,
 * });
 *
 * // 當需要顯示對話框時
 * openRestoreDialog();
 * ```
 */
export function useRestoreDraftDialog<TFormValues extends FieldValues>({
  draft,
  onRestore,
  onDiscard,
}: UseRestoreDraftDialogOptions<TFormValues>) {
  const { open } = useDialogManager();

  const openRestoreDialog = useCallback(() => {
    if (!draft) return;

    open({
      title: DIALOG_TITLE,
      content: DIALOG_CONTENT,
      actions: [
        {
          label: DISCARD_BUTTON_TEXT,
          variant: "outline",
          onClick: onDiscard,
        },
        {
          label: RESTORE_BUTTON_TEXT,
          onClick: onRestore,
        },
      ],
      from: "bottom",
      dismissible: false,
      closeOnEscape: false,
      showCloseButton: false,
    });
  }, [draft, onRestore, onDiscard, open]);

  return { openRestoreDialog };
}
