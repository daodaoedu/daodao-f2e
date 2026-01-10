"use client";

import { useDialogManager } from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { useCallback } from "react";
import { Image } from "@daodao/ui/components/image";
// TODO: 需要添加封存插圖（橙色角色和燈泡）
// 圖片路徑：packages/assets/images/dialog/archive.png
import InfoPng from "@daodao/assets/images/dialog/info.png";

interface UseArchivePracticeDialogOptions {
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
  /** 確認封存的回調 */
  onConfirm: () => void;
  /** 取消的回調 */
  onCancel?: () => void;
}

const DEFAULT_CONTENT = (
  <div className="p-4">
    {/* TODO: 當 archive.png 準備好後，替換為 ArchivePng */}
    <Image src={InfoPng} alt="archive" width={172} height={172} className="mx-auto pb-8" />
    <p className="text-left text-text-dark">
      我們會幫你把實踐收在「封存」裡面，你會暫時看不到它，除非取消封存喔！
    </p>
  </div>
);

/**
 * 使用全局 DialogManager 來顯示封存實踐對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openArchiveDialog } = useArchivePracticeDialog({
 *   onConfirm: handleArchive,
 *   onCancel: handleCancel,
 * });
 *
 * // 當需要顯示對話框時
 * openArchiveDialog();
 * ```
 */
export function useArchivePracticeDialog({
  title = "即將封存這個實踐",
  description,
  cancelButtonText = "先不要",
  confirmButtonText = "確定封存",
  content = DEFAULT_CONTENT,
  onConfirm,
  onCancel,
}: UseArchivePracticeDialogOptions) {
  const { open } = useDialogManager();

  const openArchiveDialog = useCallback(() => {
    open({
      title,
      description,
      content,
      actions: [
        {
          label: cancelButtonText,
          variant: "outline",
          onClick: onCancel || (() => {}),
        },
        {
          label: confirmButtonText,
          onClick: onConfirm,
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

  return { openArchiveDialog };
}

