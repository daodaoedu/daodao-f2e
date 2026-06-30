import { useCallback } from "react";
import { Alert } from "react-native";
import { useMobileTranslation } from "@/i18n";

export enum DeletePracticeResult {
  /** 實踐已成功刪除 */
  Deleted,
  /** 用戶在對話框取消了操作 */
  Cancelled,
}

/**
 * 顯示刪除實踐對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openDeleteDialog } = useDeletePracticeDialog();
 *
 * // 當需要顯示對話框時
 * const result = await openDeleteDialog();
 *
 * if (result === DeletePracticeResult.Deleted) {
 *   // 實踐已成功刪除
 *   router.push("/practices");
 * }
 * ```
 */
export function useDeletePracticeDialog() {
  const t = useMobileTranslation("mobile.dialogs");
  const openDeleteDialog = useCallback(async (): Promise<DeletePracticeResult> => {
    return new Promise((resolve) => {
      Alert.alert(t("delete_practice_title"), t("delete_practice_message"), [
        {
          text: t("not_now"),
          style: "cancel",
          onPress: () => {
            resolve(DeletePracticeResult.Cancelled);
          },
        },
        {
          text: t("delete_confirm"),
          style: "destructive",
          onPress: () => {
            resolve(DeletePracticeResult.Deleted);
          },
        },
      ]);
    });
  }, [t]);

  return { openDeleteDialog };
}
