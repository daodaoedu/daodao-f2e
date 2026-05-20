"use client";

import { useCallback } from "react";
import { useDialog } from "./use-dialog";

export type LeaveWithDraftChoice = "save-draft" | "leave" | "continue";

/**
 * Shows an unsaved-changes dialog with an explicit "Save Draft" option.
 * Returns the user's choice as a Promise.
 *
 * @example
 * ```typescript
 * const confirmLeaveWithDraft = useLeaveWithDraftConfirm();
 *
 * const choice = await confirmLeaveWithDraft();
 * if (choice === "save-draft") {
 *   saveDraft();
 *   router.replace("/");
 * } else if (choice === "leave") {
 *   router.replace("/");
 * }
 * // "continue" → do nothing
 * ```
 */
export function useLeaveWithDraftConfirm() {
  const { openWarningDialog } = useDialog();

  return useCallback((): Promise<LeaveWithDraftChoice> => {
    return openWarningDialog<"continue" | "save-draft" | "leave">({
      title: "尚未儲存你的資料",
      message: "您有尚未儲存的變更，確定要離開嗎？",
      textAlign: "left",
      buttons: [
        { label: "繼續編輯", value: "continue", variant: "outline" },
        { label: "儲存草稿", value: "save-draft", variant: "default" },
        { label: "確定離開", value: "leave", variant: "orange" },
      ],
      strict: false,
      customConfig: {
        dismissible: false,
        closeOnEscape: false,
        showCloseButton: true,
      },
    }).then((result) => {
      if (result.value === "save-draft") return "save-draft";
      if (result.value === "leave") return "leave";
      return "continue";
    });
  }, [openWarningDialog]);
}
