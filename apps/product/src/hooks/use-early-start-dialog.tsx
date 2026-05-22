"use client";

import { useLocale, useTranslations } from "@daodao/i18n";
import { useDialog } from "@daodao/ui/hooks/use-dialog";
import { differenceInDays, format, parse } from "date-fns";
import { enUS, zhTW } from "date-fns/locale";
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
  const t = useTranslations("check_in");
  const locale = useLocale();
  const { openWarningDialog } = useDialog();

  const openEarlyStartDialog = useCallback(async (): Promise<EarlyStartResult> => {
    const today = new Date();
    const practiceStartDate = parse(startDate, "yyyy-MM-dd", new Date());

    // 計算提早天數
    const daysEarly = differenceInDays(practiceStartDate, today);

    // 格式化日期顯示
    const formattedStartDate = format(
      practiceStartDate,
      locale === "en" ? "MMM d (EEEE)" : "PPP (EEEE)",
      { locale: locale === "en" ? enUS : zhTW }
    );

    const result = await openWarningDialog({
      title: t("early_start_title"),
      message: (
        <div className="space-y-2">
          <p>
            {t.rich("early_start_message", {
              date: () => <span className="font-medium text-logo-cyan">{formattedStartDate}</span>,
              days: daysEarly,
            })}
          </p>
          <p>{t("early_start_description")}</p>
        </div>
      ),
      textAlign: "left",
      buttons: [
        { label: t("cancel_action"), value: "cancel", variant: "outline" },
        { label: t("early_start_confirm"), value: "confirm", variant: "orange" },
      ],
    });

    if (result.value === "confirm") {
      return EarlyStartResult.Confirmed;
    }

    return EarlyStartResult.Cancelled;
  }, [openWarningDialog, startDate, locale, t]);

  return { openEarlyStartDialog };
}
