import { useCallback } from "react";
import { Alert } from "react-native";

export enum ArchivePracticeResult {
  /** 實踐已成功封存 */
  Archived,
  /** 用戶在對話框取消了操作 */
  Cancelled,
}

interface ArchiveDialogOptions {
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
  const openArchiveDialog = useCallback(
    async (options?: ArchiveDialogOptions): Promise<ArchivePracticeResult> => {
      return new Promise((resolve) => {
        Alert.alert(
          "即將封存這個實踐",
          "我們會幫你把實踐收在「封存」裡面，你會暫時看不到它，除非取消封存喔！",
          [
            {
              text: "先不要",
              style: "cancel",
              onPress: () => {
                resolve(ArchivePracticeResult.Cancelled);
              },
            },
            {
              text: "確定封存",
              style: "destructive",
              onPress: () => {
                // 顯示成功訊息並提供復原選項
                Alert.alert("實踐已成功封存", "你可以在設定中觀看已封存的內容", [
                  {
                    text: "復原",
                    onPress: () => {
                      options?.onRestore?.();
                    },
                  },
                  {
                    text: "確定",
                    style: "default",
                    onPress: () => {
                      resolve(ArchivePracticeResult.Archived);
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

  return { openArchiveDialog };
}
