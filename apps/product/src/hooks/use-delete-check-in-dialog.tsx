"use client";

import { useDialogManager } from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { useCallback } from "react";
import { Image } from "@daodao/ui/components/image";
import WarningPng from "@daodao/assets/images/dialog/warning.png";

interface UseDeleteCheckInDialogOptions {
  /** 確認刪除的回調 */
  onConfirm: () => void;
  /** 取消的回調 */
  onCancel?: () => void;
}

const DIALOG_CONTENT = (
  <div className="p-4">
    <Image src={WarningPng} alt="delete" width={172} height={172} className="mx-auto pb-8" />
    <p className="text-left text-text-dark">
      確定要跟這個打卡說再見了嗎？一旦刪除，就無法復原囉。
    </p>
  </div>
);

const DIALOG_TITLE = "確定刪除這個打卡?";
const CONFIRM_BUTTON_TEXT = "確定刪除";
const CANCEL_BUTTON_TEXT = "先不要";

/**
 * 使用全局 DialogManager 來顯示刪除打卡對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openDeleteDialog } = useDeleteCheckInDialog({
 *   onConfirm: handleDelete,
 *   onCancel: handleCancel,
 * });
 *
 * // 當需要顯示對話框時
 * openDeleteDialog();
 * ```
 */
export function useDeleteCheckInDialog({
  onConfirm,
  onCancel,
}: UseDeleteCheckInDialogOptions) {
  const { open } = useDialogManager();

  const openDeleteDialog = useCallback(() => {
    open({
      title: DIALOG_TITLE,
      content: DIALOG_CONTENT,
      actions: [
        {
          label: CONFIRM_BUTTON_TEXT,
          variant: "outline",
          onClick: onConfirm,
        },
        {
          label: CANCEL_BUTTON_TEXT,
          variant: "orange",
          onClick: onCancel || (() => {}),
        },
      ],
      from: "bottom",
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  }, [onConfirm, onCancel, open]);

  return { openDeleteDialog };
}

