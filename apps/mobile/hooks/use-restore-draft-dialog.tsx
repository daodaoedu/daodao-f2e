import { useCallback } from "react";
import { Alert } from "react-native";
import { useMobileTranslation } from "@/i18n";

interface IDraftData<T> {
  data: T;
  savedAt: string;
}

interface IUseRestoreDraftDialogOptions<TFormValues> {
  /** 暫存資料 */
  draft: IDraftData<TFormValues> | null;
}

interface IDialogResult {
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
}: IUseRestoreDraftDialogOptions<TFormValues>) {
  const t = useMobileTranslation("mobile.dialogs");
  const openRestoreDialog = useCallback((): Promise<IDialogResult> => {
    if (!draft) {
      return Promise.resolve({ value: "skip", index: -1 });
    }

    return new Promise((resolve) => {
      Alert.alert(t("restore_draft_title"), t("restore_draft_message"), [
        {
          text: t("restart"),
          style: "cancel",
          onPress: () => {
            resolve({ value: "discard", index: 0 });
          },
        },
        {
          text: t("restore_draft_confirm"),
          style: "default",
          onPress: () => {
            resolve({ value: "restore", index: 1 });
          },
        },
      ]);
    });
  }, [draft, t]);

  return { openRestoreDialog };
}
