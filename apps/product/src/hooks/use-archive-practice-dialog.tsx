"use client";

import { Link } from "@daodao/i18n/navigation";
import { toast } from "@daodao/ui/components/sonner";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { useCallback } from "react";

export enum ArchivePracticeResult {
  /** 實踐已成功封存 */
  Archived,
  /** 用戶點擊了復原按鈕 */
  Restored,
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
 * const result = await openArchiveDialog(practiceId);
 *
 * if (result === ArchivePracticeResult.Archived) {
 *   // 實踐已成功封存，執行後續處理（如重新載入列表等）
 *   router.refresh();
 * } else if (result === ArchivePracticeResult.Restored) {
 *   // 用戶點擊了復原，不需要做任何事
 * } else if (result === ArchivePracticeResult.Cancelled) {
 *   // 用戶在對話框取消了，不需要做任何事
 * }
 * ```
 */
export function useArchivePracticeDialog() {
  const { openInfoDialog } = useDialog();

  const openArchiveDialog = useCallback(
    async (practiceId: string): Promise<ArchivePracticeResult> => {
      // 先顯示確認對話框
      const result = await openInfoDialog({
        title: "即將封存這個實踐",
        message:
          "我們會幫你把實踐收在「封存」裡面，你會暫時看不到它，除非取消封存喔！",
        textAlign: "left",
        buttons: [
          { label: "先不要", value: "cancel", variant: "outline" },
          { label: "確定封存", value: "confirm", variant: "orange" },
        ],
      });

      // 如果用戶取消，直接返回
      if (result.value !== "confirm") {
        return ArchivePracticeResult.Cancelled;
      }

      // 用戶確認封存，顯示 toast 並返回 Promise
      return new Promise<ArchivePracticeResult>((resolve) => {
        const handleArchive = () => {
          console.log(practiceId);
          resolve(ArchivePracticeResult.Archived);
        };

        // 顯示 toast，帶有復原按鈕
        toast.success(
          <>
            實踐已成功封存，你可以在設定中觀看
            <Link href="/settings/archived" className="underline">
              已封存的內容
            </Link>
          </>,
          {
            action: {
              label: "復原",
              onClick: () => {
                // 用戶點擊復原，取消封存
                resolve(ArchivePracticeResult.Restored);
              },
            },
            onAutoClose: handleArchive,
            onDismiss: handleArchive,
          }
        );
      });
    },
    [openInfoDialog]
  );

  return { openArchiveDialog };
}
