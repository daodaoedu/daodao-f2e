"use client";

import { useDialog } from "./use-dialog";
import { useCallback } from "react";

/**
 * 顯示未儲存變更確認對話框的 Hook
 * 返回一個 Promise-based 的函數，可以像 window.confirm() 一樣使用
 *
 * @example
 * ```typescript
 * const confirmUnsavedChanges = useUnsavedChangesConfirm();
 *
 * // 使用方式
 * const shouldLeave = await confirmUnsavedChanges();
 * if (shouldLeave) {
 *   // 使用者確認離開
 *   router.push("/other-page");
 * }
 * ```
 */
export function useUnsavedChangesConfirm() {
  const { openWarningDialog } = useDialog();

  const confirmUnsavedChanges = useCallback((): Promise<boolean> => {
    return openWarningDialog({
      title: "尚未儲存你的資料",
      message: "確定要先離開這裡嗎？已經編輯的資料將無法被儲存。",
      textAlign: "left",
      buttons: [
        { label: "繼續編輯", value: "continue", variant: "outline" },
        { label: "確定離開", value: "leave", variant: "orange" },
      ],
      strict: false,
      customConfig: {
        dismissible: false,
        closeOnEscape: false,
        showCloseButton: true,
      },
    }).then((result) => result.value === "leave");
  }, [openWarningDialog]);

  return confirmUnsavedChanges;
}

