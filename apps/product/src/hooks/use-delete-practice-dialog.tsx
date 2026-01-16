"use client";

import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { useCallback } from "react";

export enum DeletePracticeResult {
  /** 實踐已成功刪除 */
  Deleted,
  /** 用戶點擊了復原按鈕 */
  Restored,
  /** 用戶在對話框取消了操作 */
  Cancelled,
}

/**
 * 使用全局 DialogManager 來顯示刪除實踐對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openDeleteDialog } = useDeletePracticeDialog();
 *
 * // 當需要顯示對話框時
 * const result = await openDeleteDialog(practiceId);
 * 
 * if (result === DeletePracticeResult.Deleted) {
 *   // 實踐已成功刪除，執行後續處理（如重新載入列表、導航等）
 *   router.push("/practices");
 * } else if (result === DeletePracticeResult.Restored) {
 *   // 用戶點擊了復原，不需要做任何事
 * } else if (result === DeletePracticeResult.Cancelled) {
 *   // 用戶在對話框取消了，不需要做任何事
 * }
 * ```
 */
export function useDeletePracticeDialog() {
  const { openWarningDialog } = useDialog();

  const openDeleteDialog = useCallback(
    async (practiceId: string): Promise<DeletePracticeResult> => {
      // 先顯示確認對話框
      const result = await openWarningDialog({
        title: "確定刪除這個實踐？",
        message: "確定要跟這個主題說再見了嗎？一旦刪除，就無法復原囉。",
        textAlign: "left",
        buttons: [
          { label: "確定刪除", value: "confirm", variant: "outline" },
          { label: "先不要", value: "cancel", variant: "orange" },
        ],
      });

      // 如果用戶取消，直接返回
      if (result.value !== "confirm") {
        return DeletePracticeResult.Cancelled;
      }

      // 用戶確認刪除，顯示 toast 並返回 Promise
      return new Promise<DeletePracticeResult>((resolve) => {
        const handleDelete = () => {
          console.log(practiceId);
          resolve(DeletePracticeResult.Deleted);
        };

        // 顯示 toast，帶有復原按鈕
        toast.success("實踐已成功刪除", {
          action: {
            label: "復原",
            onClick: () => {
              // 用戶點擊復原，取消刪除
              resolve(DeletePracticeResult.Restored);
            },
          },
          onAutoClose: handleDelete,
          onDismiss: handleDelete,
        });
      });
    },
    [openWarningDialog]
  );

  return { openDeleteDialog };
}

