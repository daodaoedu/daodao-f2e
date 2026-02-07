import { useCallback } from "react";
import { Alert } from "react-native";

export enum DeleteCheckInResult {
  /** 打卡已成功刪除 */
  Deleted,
  /** 用戶點擊了復原按鈕 */
  Restored,
  /** 用戶在對話框取消了操作 */
  Cancelled,
}

/**
 * 顯示刪除打卡對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openDeleteDialog } = useDeleteCheckInDialog();
 *
 * // 當需要顯示對話框時
 * const result = await openDeleteDialog(checkInId);
 *
 * if (result === DeleteCheckInResult.Deleted) {
 *   // 打卡已成功刪除
 *   router.push("/practices");
 * }
 * ```
 */
export function useDeleteCheckInDialog() {
  const openDeleteDialog = useCallback(
    async (checkInId: string): Promise<DeleteCheckInResult> => {
      return new Promise((resolve) => {
        Alert.alert(
          "確定刪除這個打卡?",
          "確定要跟這個打卡說再見了嗎？一旦刪除，就無法復原囉。",
          [
            {
              text: "先不要",
              style: "cancel",
              onPress: () => {
                resolve(DeleteCheckInResult.Cancelled);
              },
            },
            {
              text: "確定刪除",
              style: "destructive",
              onPress: () => {
                // 顯示成功訊息並提供復原選項
                Alert.alert("打卡已成功刪除", "", [
                  {
                    text: "復原",
                    onPress: () => {
                      console.log("Restore check-in:", checkInId);
                      resolve(DeleteCheckInResult.Restored);
                    },
                  },
                  {
                    text: "確定",
                    style: "default",
                    onPress: () => {
                      resolve(DeleteCheckInResult.Deleted);
                    },
                  },
                ]);
              },
            },
          ]
        );
      });
    },
    []
  );

  return { openDeleteDialog };
}
