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
  /** 標題 */
  title?: React.ReactNode;
  /** 描述文字 */
  description?: React.ReactNode;
  /** 恢復按鈕文字 */
  restoreButtonText?: string;
  /** 清除按鈕文字 */
  discardButtonText?: string;
  /** 自訂預覽內容的渲染函數 */
  content?: React.ReactNode;
  /** 恢復資料的回調 */
  onRestore: () => void;
  /** 清除資料的回調 */
  onDiscard: () => void;
}

const DEFAULT_CONTENT = (
  <div className="pt-4 pb-16">
    <Image src={InfoPng} alt="info" width={172} height={172} className="mx-auto pb-8" />
    <p className="text-center">偵測到您有未完成的資料，是否要恢復？</p>
  </div>
);

/**
 * 使用全局 DialogManager 來顯示恢復暫存資料對話框的 Hook
 *
 * @example
 * ```tsx
 * const { showRestoreDialog } = useRestoreDraftDialog({
 *   draft,
 *   onRestore: handleRestore,
 *   onDiscard: handleDiscard,
 * });
 *
 * // 當需要顯示對話框時
 * if (showRestoreDialog) {
 *   showRestoreDialog();
 * }
 * ```
 */
export function useRestoreDraftDialog<TFormValues extends FieldValues>({
  draft,
  title = "恢復暫存資料",
  description,
  restoreButtonText = "恢復資料",
  discardButtonText = "重新開始",
  content = DEFAULT_CONTENT,
  onRestore,
  onDiscard,
}: UseRestoreDraftDialogOptions<TFormValues>) {
  const { open } = useDialogManager();

  const openRestoreDialog = useCallback(() => {
    if (!draft) return;

    open({
      title,
      description,
      content,
      actions: [
        {
          label: discardButtonText,
          variant: "outline",
          onClick: onDiscard,
        },
        {
          label: restoreButtonText,
          onClick: onRestore,
        },
      ],
      from: "bottom",
      dismissible: false,
      closeOnEscape: false,
      showCloseButton: false,
    });
  }, [
    draft,
    title,
    description,
    restoreButtonText,
    discardButtonText,
    onRestore,
    onDiscard,
    open,
  ]);

  return { openRestoreDialog };
}
