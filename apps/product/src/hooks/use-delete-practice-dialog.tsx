"use client";

import { useTranslations } from "@daodao/i18n";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { useCallback } from "react";

export enum DeletePracticeResult {
  /** 用戶按了「確定刪除」（尚未送出 DELETE） */
  Confirmed,
  /** 用戶在對話框取消了操作 */
  Cancelled,
}

/**
 * 使用全局 DialogManager 顯示「確定刪除這個實踐？」確認框。
 *
 * 只負責確認，不送 DELETE、也不顯示成功提示；呼叫方在 DELETE 成功後才顯示「刪除成功」（daodao#369）。
 *
 * @example
 * ```tsx
 * const { openDeleteDialog } = useDeletePracticeDialog();
 * const result = await openDeleteDialog();
 * if (result === DeletePracticeResult.Confirmed) {
 *   await deletePractice();
 *   toast.success(t("delete_success"));
 * }
 * ```
 */
export function useDeletePracticeDialog() {
  const t = useTranslations("practice");
  const { openWarningDialog } = useDialog();

  const openDeleteDialog = useCallback(async (): Promise<DeletePracticeResult> => {
    const result = await openWarningDialog({
      title: t("delete_dialog_title"),
      message: t("delete_dialog_message"),
      textAlign: "left",
      buttons: [
        { label: t("delete_confirm"), value: "confirm", variant: "outline" },
        { label: t("cancel_action"), value: "cancel", variant: "orange" },
      ],
    });

    return result.value === "confirm"
      ? DeletePracticeResult.Confirmed
      : DeletePracticeResult.Cancelled;
  }, [openWarningDialog, t]);

  return { openDeleteDialog };
}
