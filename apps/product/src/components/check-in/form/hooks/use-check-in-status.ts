import { useMemo } from "react";
import { CheckInStatus, type CheckInStatusType } from "@/constants/check-in-status";
import type { ICheckInStatusOptions } from "../../types";

/**
 * Hook 用於檢查打卡狀態
 */
export const useCheckInStatus = (options: ICheckInStatusOptions) => {
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
          return "實踐已完成";
        case CheckInStatus.alreadyCheckedIn:
          return "24 小時內已打過卡囉！";
        case CheckInStatus.available:
          return "打卡";
        default:
          return "打卡";
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
  }, [practiceStatus]);
};
