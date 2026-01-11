"use client";

import { useDialogManager } from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { useCallback } from "react";
import { Image } from "@daodao/ui/components/image";
import InfoPng from "@daodao/assets/images/dialog/info.png";

interface UseArchivePracticeDialogOptions {
  /** 確認封存的回調 */
  onConfirm: () => void;
  /** 取消的回調 */
  onCancel?: () => void;
}

const DIALOG_CONTENT = (
  <div className="p-4">
    {/* TODO: 當 archive.png 準備好後，替換為 ArchivePng */}
    <Image src={InfoPng} alt="archive" width={172} height={172} className="mx-auto pb-8" />
    <p className="text-left text-text-dark">
      我們會幫你把實踐收在「封存」裡面，你會暫時看不到它，除非取消封存喔！
    </p>
  </div>
);

const DIALOG_TITLE = "即將封存這個實踐";
const CANCEL_BUTTON_TEXT = "先不要";
const CONFIRM_BUTTON_TEXT = "確定封存";

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
  onConfirm,
  onCancel,
}: UseArchivePracticeDialogOptions) {
  const { open } = useDialogManager();

  const openArchiveDialog = useCallback(() => {
    open({
      title: DIALOG_TITLE,
      content: DIALOG_CONTENT,
      actions: [
        {
          label: CANCEL_BUTTON_TEXT,
          variant: "outline",
          onClick: onCancel || (() => {}),
        },
        {
          label: CONFIRM_BUTTON_TEXT,
          onClick: onConfirm,
        },
      ],
      from: "bottom",
      dismissible: true,
      closeOnEscape: true,
      showCloseButton: true,
    });
  }, [onConfirm, onCancel, open]);

  return { openArchiveDialog };
}

