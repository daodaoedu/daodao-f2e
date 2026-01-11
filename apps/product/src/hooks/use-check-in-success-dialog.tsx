"use client";

import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { useCallback } from "react";

/**
 * 使用全局 DialogManager 來顯示打卡成功對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openSuccessDialog } = useCheckInSuccessDialog();
 *
 * // 當需要顯示對話框時
 * const result = await openSuccessDialog();
 * if (result.value === "share") {
 *   await handleShare();
 * } else if (result.value === "complete") {
 *   await handleComplete();
 * }
 * ```
 */
export function useCheckInSuccessDialog() {
  const { openSuccessDialog: openDialog } = useDialog();

  const openSuccessDialog = useCallback(() => {
    return openDialog({
      title: "打卡成功!",
      message: (
        <div className="space-y-1">
          <p>恭喜，你又成功行動了一次！</p>
          <p>歡迎分享你的心得，和你有相同實踐的人會</p>
          <p>很想知道喔！</p>
        </div>
      ),
      textAlign: "left",
      buttons: [
        { label: "分享心得", value: "share", variant: "outline" },
        { label: "完成", value: "complete", variant: "orange" },
      ],
    });
  }, [openDialog]);

  return { openSuccessDialog };
}

