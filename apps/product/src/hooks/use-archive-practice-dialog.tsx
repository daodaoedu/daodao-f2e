"use client";

import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { useCallback } from "react";

/**
 * 使用全局 DialogManager 來顯示封存實踐對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openArchiveDialog } = useArchivePracticeDialog();
 *
 * // 當需要顯示對話框時
 * const result = await openArchiveDialog();
 * if (result.value === "confirm") {
 *   await handleArchive();
 * }
 * ```
 */
export function useArchivePracticeDialog() {
  const { openInfoDialog } = useDialog();

  const openArchiveDialog = useCallback(() => {
    return openInfoDialog({
      title: "即將封存這個實踐",
      message: "我們會幫你把實踐收在「封存」裡面，你會暫時看不到它，除非取消封存喔！",
      textAlign: "left",
      buttons: [
        { label: "先不要", value: "cancel", variant: "outline" },
        { label: "確定封存", value: "confirm", variant: "orange" },
      ],
    });
  }, [openInfoDialog]);

  return { openArchiveDialog };
}

