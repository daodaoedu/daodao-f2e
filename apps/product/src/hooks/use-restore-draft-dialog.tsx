"use client";

import type { DraftData } from "@daodao/shared";
import { useTranslations } from "@daodao/i18n";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { useCallback } from "react";
import type { FieldValues } from "react-hook-form";

interface UseRestoreDraftDialogOptions<TFormValues extends FieldValues> {
  /** 暫存資料 */
  draft: DraftData<TFormValues> | null;
}

/**
 * 使用全局 DialogManager 來顯示恢復暫存資料對話框的 Hook
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
export function useRestoreDraftDialog<TFormValues extends FieldValues>({
  draft,
}: UseRestoreDraftDialogOptions<TFormValues>) {
  const { openInfoDialog } = useDialog();
  const t = useTranslations("dialog");

  const openRestoreDialog = useCallback(() => {
    if (!draft) {
      return Promise.resolve({ value: "skip", index: -1 });
    }

    return openInfoDialog({
      title: t("restore_draft_title"),
      message: t("restore_draft_message"),
      textAlign: "center",
      containerClassName: "pt-4 pb-16",
      buttons: [
        { label: t("restore_draft_discard_btn"), value: "discard", variant: "outline" },
        { label: t("restore_draft_restore_btn"), value: "restore", variant: "orange" },
      ],
      strict: true,
    });
  }, [draft, openInfoDialog, t]);

  return { openRestoreDialog };
}
