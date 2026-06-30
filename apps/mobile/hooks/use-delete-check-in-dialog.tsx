import { useCallback } from "react";
import { Alert } from "react-native";
import { useMobileTranslation } from "@/i18n";

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
  const t = useMobileTranslation("mobile.dialogs");
  const openDeleteDialog = useCallback(
    async (checkInId: string): Promise<DeleteCheckInResult> => {
      return new Promise((resolve) => {
        Alert.alert(t("delete_checkin_title"), t("delete_checkin_message"), [
          {
            text: t("not_now"),
            style: "cancel",
            onPress: () => {
              resolve(DeleteCheckInResult.Cancelled);
            },
          },
          {
            text: t("delete_confirm"),
            style: "destructive",
            onPress: () => {
              // 顯示成功訊息並提供復原選項
              Alert.alert(t("delete_checkin_success"), "", [
                {
                  text: t("restore"),
                  onPress: () => {
                    console.log("Restore check-in:", checkInId);
                    resolve(DeleteCheckInResult.Restored);
                  },
                },
                {
                  text: t("confirm"),
                  style: "default",
                  onPress: () => {
                    resolve(DeleteCheckInResult.Deleted);
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

  return { openDeleteDialog };
}
