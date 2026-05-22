"use client";

import { useTranslations } from "@daodao/i18n";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { useCallback } from "react";

export enum DeleteCheckInResult {
  /** 打卡已成功刪除 */
  Deleted,
  /** 用戶點擊了復原按鈕 */
  Restored,
  /** 用戶在對話框取消了操作 */
  Cancelled,
}

/**
 * 使用全局 DialogManager 來顯示刪除打卡對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openDeleteDialog } = useDeleteCheckInDialog();
 *
 * // 當需要顯示對話框時
 * const result = await openDeleteDialog(checkInId);
 *
 * if (result === DeleteCheckInResult.Deleted) {
 *   // 打卡已成功刪除，執行後續處理（如重新載入列表、導航等）
 *   router.push("/practices");
 * } else if (result === DeleteCheckInResult.Restored) {
 *   // 用戶點擊了復原，不需要做任何事
 * } else if (result === DeleteCheckInResult.Cancelled) {
 *   // 用戶在對話框取消了，不需要做任何事
 * }
 * ```
 */
export function useDeleteCheckInDialog() {
  const t = useTranslations("check_in");
  const { openWarningDialog } = useDialog();

  const openDeleteDialog = useCallback(
    async (checkInId: string): Promise<DeleteCheckInResult> => {
      // 先顯示確認對話框
      const result = await openWarningDialog({
        title: t("delete_dialog_title"),
        message: t("delete_dialog_message"),
        textAlign: "left",
        buttons: [
          { label: t("delete_confirm"), value: "confirm", variant: "outline" },
          { label: t("cancel_action"), value: "cancel", variant: "orange" },
        ],
      });

      // 如果用戶取消，直接返回
      if (result.value !== "confirm") {
        return DeleteCheckInResult.Cancelled;
      }

      // 用戶確認刪除，顯示 toast 並返回 Promise
      return new Promise<DeleteCheckInResult>((resolve) => {
        const handleDelete = () => {
          console.log(checkInId);
          resolve(DeleteCheckInResult.Deleted);
        };

        // 顯示 toast，帶有復原按鈕
        toast.success(t("delete_success"), {
          action: {
            label: t("restore"),
            onClick: () => {
              // 用戶點擊復原，取消刪除
              resolve(DeleteCheckInResult.Restored);
            },
          },
          onAutoClose: handleDelete,
          onDismiss: handleDelete,
        });
      });
    },
    [openWarningDialog, t]
  );

  return { openDeleteDialog };
}
