import { useCallback } from "react";
import { Alert } from "react-native";

interface DraftData<T> {
  data: T;
  savedAt: string;
}

interface UseRestoreDraftDialogOptions<TFormValues> {
  /** 暫存資料 */
  draft: DraftData<TFormValues> | null;
}

interface DialogResult {
  value: string;
  index: number;
}

/**
 * 顯示恢復暫存資料對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openRestoreDialog } = useRestoreDraftDialog({ draft });
 *
 * // 當需要顯示對話框時
 * const result = await openRestoreDialog();
 * if (result.value === "restore") {
 *   await handleRestore();
 * } else if (result.value === "discard") {
 *   await handleDiscard();
 * }
 * ```
 */
export function useRestoreDraftDialog<TFormValues>({
  draft,
}: UseRestoreDraftDialogOptions<TFormValues>) {
  const openRestoreDialog = useCallback((): Promise<DialogResult> => {
    if (!draft) {
      return Promise.resolve({ value: "skip", index: -1 });
    }

    return new Promise((resolve) => {
      Alert.alert("恢復暫存資料", "偵測到您有未完成的資料，是否要恢復？", [
        {
          text: "重新開始",
          style: "cancel",
          onPress: () => {
            resolve({ value: "discard", index: 0 });
          },
        },
        {
          text: "恢復資料",
          style: "default",
          onPress: () => {
            resolve({ value: "restore", index: 1 });
          },
        },
      ]);
    });
  }, [draft]);

  return { openRestoreDialog };
}
