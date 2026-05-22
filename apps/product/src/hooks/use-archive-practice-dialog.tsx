"use client";

import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { useCallback } from "react";

export enum ArchivePracticeResult {
  /** 實踐已成功封存 */
  Archived,
  /** 用戶在對話框取消了操作 */
  Cancelled,
}

/**
 * 使用全局 DialogManager 來顯示封存實踐對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openArchiveDialog } = useArchivePracticeDialog();
 *
 * // 當需要顯示對話框時
 * const result = await openArchiveDialog(practiceId, {
 *   onRestore: async () => {
 *     await restorePractice();
 *   },
 * });
 *
 * if (result === ArchivePracticeResult.Archived) {
 *   // 實踐已成功封存，執行後續處理（如重新載入列表等）
 *   router.refresh();
 * } else if (result === ArchivePracticeResult.Cancelled) {
 *   // 用戶在對話框取消了，不需要做任何事
 * }
 * ```
 */
export function useArchivePracticeDialog() {
  const t = useTranslations("practice");
  const { openInfoDialog } = useDialog();

  const openArchiveDialog = useCallback(
    async (options: { onRestore?: () => void | Promise<void> }): Promise<ArchivePracticeResult> => {
      // 先顯示確認對話框
      const result = await openInfoDialog({
        title: t("archive_dialog_title"),
        message: t("archive_dialog_message"),
        textAlign: "left",
        buttons: [
          { label: t("cancel_action"), value: "cancel", variant: "outline" },
          { label: t("archive_confirm"), value: "confirm", variant: "orange" },
        ],
      });

      // 如果用戶取消，直接返回
      if (result.value !== "confirm") {
        return ArchivePracticeResult.Cancelled;
      }

      // 用戶確認封存，立即返回並顯示 toast
      // 顯示 toast，帶有復原按鈕
      toast.success(
        <>
          {t("archive_success_prefix")}
          <Link href="/settings/archived" className="underline">
            {t("archive_success_link")}
          </Link>
        </>,
        {
          action: {
            label: t("restore"),
            onClick: () => {
              // 執行復原邏輯
              if (options?.onRestore) {
                options.onRestore();
              }
            },
          },
        }
      );

      // 立即返回，讓調用方可以立即執行動作
      return ArchivePracticeResult.Archived;
    },
    [openInfoDialog, t]
  );

  return { openArchiveDialog };
}
