import { useCallback } from "react";
import { Alert } from "react-native";

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
  const openDeleteDialog = useCallback(async (): Promise<DeletePracticeResult> => {
    return new Promise((resolve) => {
      Alert.alert("確定刪除這個實踐？", "確定要跟這個主題說再見了嗎？一旦刪除，就無法復原囉。", [
        {
          text: "先不要",
          style: "cancel",
          onPress: () => {
            resolve(DeletePracticeResult.Cancelled);
          },
        },
        {
          text: "確定刪除",
          style: "destructive",
          onPress: () => {
            resolve(DeletePracticeResult.Deleted);
          },
        },
      ]);
    });
  }, []);

  return { openDeleteDialog };
}
