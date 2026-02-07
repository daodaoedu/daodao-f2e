"use client";

import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { differenceInDays, format, parse } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useCallback } from "react";

export enum EarlyStartResult {
  /** 用戶確認提早開始 */
  Confirmed,
  /** 用戶取消了操作 */
  Cancelled,
}

interface UseEarlyStartDialogOptions {
  /** 原始開始日期 (yyyy-MM-dd 格式) */
  startDate: string;
}

/**
 * 使用全局 DialogManager 來顯示提早開始確認對話框的 Hook
 *
 * @example
 * ```tsx
 * const { openEarlyStartDialog } = useEarlyStartDialog({ startDate: "2024-01-20" });
 *
 * // 當需要顯示對話框時
 * const result = await openEarlyStartDialog();
 *
 * if (result === EarlyStartResult.Confirmed) {
 *   // 用戶確認提早開始，繼續打卡流程
 *   openCheckInSheet();
 * }
 * ```
 */
export function useEarlyStartDialog({ startDate }: UseEarlyStartDialogOptions) {
  const { openWarningDialog } = useDialog();

  const openEarlyStartDialog = useCallback(async (): Promise<EarlyStartResult> => {
    const today = new Date();
    const practiceStartDate = parse(startDate, "yyyy-MM-dd", new Date());

    // 計算提早天數
    const daysEarly = differenceInDays(practiceStartDate, today);

    // 格式化日期顯示
    const formattedStartDate = format(practiceStartDate, "M月d日 (EEEE)", { locale: zhTW });

    const result = await openWarningDialog({
      title: "確定要提早開始嗎？",
      message: (
        <div className="space-y-2">
          <p>
            這個實踐原定於 <span className="font-medium text-logo-cyan">{formattedStartDate}</span>{" "}
            開始，目前還有 {daysEarly} 天。
          </p>
          <p>如果現在打卡，實踐的起迄日會自動調整，結束日也會相應提前。</p>
        </div>
      ),
      textAlign: "left",
      buttons: [
        { label: "先不要", value: "cancel", variant: "outline" },
        { label: "確定開始", value: "confirm", variant: "orange" },
      ],
    });

    if (result.value === "confirm") {
      return EarlyStartResult.Confirmed;
    }

    return EarlyStartResult.Cancelled;
  }, [openWarningDialog, startDate]);

  return { openEarlyStartDialog };
}
