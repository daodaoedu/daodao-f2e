"use client";

import { useDialogManager } from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { useCallback } from "react";
import { Image } from "@daodao/ui/components/image";
import WarningPng from "@daodao/assets/images/dialog/warning.png";

interface UseDeletePracticeDialogOptions {
  /** 標題 */
  title?: React.ReactNode;
  /** 描述文字 */
  description?: React.ReactNode;
  /** 取消按鈕文字 */
  cancelButtonText?: string;
  /** 確認按鈕文字 */
  confirmButtonText?: string;
  /** 自訂預覽內容的渲染函數 */
  content?: React.ReactNode;
  /** 確認刪除的回調 */
  onConfirm: () => void;
  /** 取消的回調 */
  onCancel?: () => void;
}

const DEFAULT_CONTENT = (
  <div className="p-4">
    {/* TODO: 當 delete.png 準備好後，替換為 DeletePng */}
    <Image src={WarningPng} alt="delete" width={172} height={172} className="mx-auto pb-8" />
    <p className="text-left text-text-dark">
      確定要跟這個主題說再見了嗎？一旦刪除，就無法復原囉。
    </p>
  </div>
);

/**
 * 使用全局 DialogManager 來顯示刪除實踐對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openDeleteDialog } = useDeletePracticeDialog({
 *   onConfirm: handleDelete,
 *   onCancel: handleCancel,
 * });
 *
 * // 當需要顯示對話框時
 * openDeleteDialog();
 * ```
 */
export function useDeletePracticeDialog({
  title = "確定刪除這個實踐？",
  description,
  cancelButtonText = "先不要",
  confirmButtonText = "確定刪除",
  content = DEFAULT_CONTENT,
  onConfirm,
  onCancel,
}: UseDeletePracticeDialogOptions) {
  const { open } = useDialogManager();

  const openDeleteDialog = useCallback(() => {
    open({
      title,
      description,
      content,
      actions: [
        {
          label: confirmButtonText,
          variant: "outline",
          onClick: onConfirm,
        },
        {
          label: cancelButtonText,
          onClick: onCancel || (() => {}),
        },
      ],
      from: "bottom",
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  }, [
    title,
    description,
    cancelButtonText,
    confirmButtonText,
    content,
    onConfirm,
    onCancel,
    open,
  ]);

  return { openDeleteDialog };
}

