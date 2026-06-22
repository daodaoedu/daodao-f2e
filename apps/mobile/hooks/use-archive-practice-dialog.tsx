import { useCallback } from "react";
import { Alert } from "react-native";
import { useMobileTranslation } from "@/i18n";

export enum ArchivePracticeResult {
  /** 實踐已成功封存 */
  Archived,
  /** 用戶在對話框取消了操作 */
  Cancelled,
}

interface IArchiveDialogOptions {
  /** 復原回調 */
  onRestore?: () => void | Promise<void>;
}

/**
 * 顯示封存實踐對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openArchiveDialog } = useArchivePracticeDialog();
 *
 * // 當需要顯示對話框時
 * const result = await openArchiveDialog({
 *   onRestore: async () => {
 *     await restorePractice();
 *   },
 * });
 *
 * if (result === ArchivePracticeResult.Archived) {
 *   // 實踐已成功封存
 *   router.back();
 * }
 * ```
 */
export function useArchivePracticeDialog() {
  const t = useMobileTranslation("mobile.dialogs");
  const openArchiveDialog = useCallback(
    async (options?: IArchiveDialogOptions): Promise<ArchivePracticeResult> => {
      return new Promise((resolve) => {
        Alert.alert(t("archive_practice_title"), t("archive_practice_message"), [
          {
            text: t("not_now"),
            style: "cancel",
            onPress: () => {
              resolve(ArchivePracticeResult.Cancelled);
            },
          },
          {
            text: t("archive_confirm"),
            style: "destructive",
            onPress: () => {
              // 顯示成功訊息並提供復原選項
              Alert.alert(t("archive_success_title"), t("archive_success_message"), [
                {
                  text: t("restore"),
                  onPress: () => {
                    options?.onRestore?.();
                  },
                },
                {
                  text: t("confirm"),
                  style: "default",
                  onPress: () => {
                    resolve(ArchivePracticeResult.Archived);
                  },
                },
              ]);
            },
          },
        ]);
      });
    },
    [t]
  );

  return { openArchiveDialog };
}
