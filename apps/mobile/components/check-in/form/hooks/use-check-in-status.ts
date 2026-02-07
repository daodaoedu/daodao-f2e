import { useMemo } from "react";
import { CheckInStatus, type CheckInStatusType } from "@/constants/check-in-status";
import type { ICheckInStatusOptions } from "../../types";

/**
 * 檢查指定日期是否為今天
 */
const isDateToday = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;

  try {
    // 解析 "yyyy-MM-dd" 格式的日期
    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month || !day) return false;

    const checkInDate = new Date(year, month - 1, day);
    if (Number.isNaN(checkInDate.getTime())) return false;

    const today = new Date();
    return (
      checkInDate.getFullYear() === today.getFullYear() &&
      checkInDate.getMonth() === today.getMonth() &&
      checkInDate.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
};

/**
 * Hook 用於檢查打卡狀態 (Mobile)
 */
export const useCheckInStatus = (options: ICheckInStatusOptions) => {
  const { practiceStatus, lastCheckInDate } = options;

  return useMemo(() => {
    // 檢查實踐是否已完成
    const isPracticeCompleted = practiceStatus === "completed" || practiceStatus === "archived";

    // 檢查今天是否已打卡
    const isTodayCheckedIn = isDateToday(lastCheckInDate);

    // 決定最終狀態（優先級：已完成 > 今天已打卡 > 可打卡）
    const getStatus = (): CheckInStatusType => {
      if (isPracticeCompleted) return CheckInStatus.practiceCompleted;
      if (isTodayCheckedIn) return CheckInStatus.alreadyCheckedIn;
      return CheckInStatus.available;
    };
    const status = getStatus();

    // 取得按鈕文字
    const getButtonLabel = (): string => {
      switch (status) {
        case CheckInStatus.practiceCompleted:
          return "實踐已完成";
        case CheckInStatus.alreadyCheckedIn:
          return "今天已打過卡囉！";
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
      isTodayCheckedIn,
      canCheckIn,
      getButtonLabel,
    };
  }, [practiceStatus, lastCheckInDate]);
};
