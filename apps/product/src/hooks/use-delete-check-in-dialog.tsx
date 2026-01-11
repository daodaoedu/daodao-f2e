"use client";

import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { useCallback } from "react";

/**
 * 使用全局 DialogManager 來顯示刪除打卡對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openDeleteDialog } = useDeleteCheckInDialog();
 *
 * // 當需要顯示對話框時
 * const result = await openDeleteDialog();
 * if (result.value === "confirm") {
 *   await handleDelete();
 * }
 * ```
 */
export function useDeleteCheckInDialog() {
  const { openWarningDialog } = useDialog();

  const openDeleteDialog = useCallback(() => {
    return openWarningDialog({
      title: "確定刪除這個打卡?",
      message: "確定要跟這個打卡說再見了嗎？一旦刪除，就無法復原囉。",
      textAlign: "left",
      buttons: [
        { label: "確定刪除", value: "confirm", variant: "outline" },
        { label: "先不要", value: "cancel", variant: "orange" },
      ],
    });
  }, [openWarningDialog]);

  return { openDeleteDialog };
}

