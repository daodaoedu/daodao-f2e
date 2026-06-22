import { useMemo } from "react";
import { CheckInStatus, type CheckInStatusType } from "@/constants/check-in-status";
import { useMobileTranslation } from "@/i18n";
import type { ICheckInStatusOptions } from "../../types";

/**
 * Hook 用於檢查打卡狀態 (Mobile)
 */
export const useCheckInStatus = (options: ICheckInStatusOptions) => {
  const t = useMobileTranslation("mobile.checkIn");
  const { practiceStatus } = options;

  return useMemo(() => {
    // 檢查實踐是否已完成
    const isPracticeCompleted = practiceStatus === "completed" || practiceStatus === "archived";

    // 不限制打卡冷卻時間
    const isCheckInLocked = false;

    // 決定最終狀態（優先級：已完成 > 冷卻中 > 可打卡）
    const getStatus = (): CheckInStatusType => {
      if (isPracticeCompleted) return CheckInStatus.practiceCompleted;
      if (isCheckInLocked) return CheckInStatus.alreadyCheckedIn;
      return CheckInStatus.available;
    };
    const status = getStatus();

    // 取得按鈕文字
    const getButtonLabel = (): string => {
      switch (status) {
        case CheckInStatus.practiceCompleted:
          return t("practice_completed");
        case CheckInStatus.alreadyCheckedIn:
          return t("already_checked_in");
        case CheckInStatus.available:
          return t("title");
        default:
          return t("title");
      }
    };

    // 是否可以點擊
    const canCheckIn = status === CheckInStatus.available;

    return {
      status,
      isPracticeCompleted,
      isCheckInLocked,
      canCheckIn,
      getButtonLabel,
    };
  }, [practiceStatus, t]);
};
