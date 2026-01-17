"use client";

import type { DraftData } from "@daodao/shared";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { useCallback } from "react";
import type { FieldValues } from "react-hook-form";

interface UseRestoreDraftDialogOptions<TFormValues extends FieldValues> {
  /** 暫存資料 */
  draft: DraftData<TFormValues> | null;
}

/**
 * 使用全局 DialogManager 來顯示恢復暫存資料對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openRestoreDialog } = useRestoreDraftDialog({ draft });
 *
 * // 當需要顯示對話框時
 * const result = await openRestoreDialog();
 * if (result.value === "restore") {
 *   await handleRestore();
 * } else if (result.value === "discard") {
 *   await handleDiscard();
 * }
 * ```
 */
export function useRestoreDraftDialog<TFormValues extends FieldValues>({
  draft,
}: UseRestoreDraftDialogOptions<TFormValues>) {
  const { openInfoDialog } = useDialog();

  const openRestoreDialog = useCallback(() => {
    if (!draft) {
      return Promise.resolve({ value: "skip", index: -1 });
    }

    return openInfoDialog({
      title: "恢復暫存資料",
      message: "偵測到您有未完成的資料，是否要恢復？",
      textAlign: "center",
      containerClassName: "pt-4 pb-16",
      buttons: [
        { label: "重新開始", value: "discard", variant: "outline" },
        { label: "恢復資料", value: "restore", variant: "orange" },
      ],
      strict: true,
    });
  }, [draft, openInfoDialog]);

  return { openRestoreDialog };
}
