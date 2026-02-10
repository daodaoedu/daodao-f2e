import { differenceInHours, isSameDay, isValid, parse, parseISO } from "date-fns";
import { useMemo } from "react";
import { CheckInStatus, type CheckInStatusType } from "@/constants/check-in-status";
import type { ICheckInStatusOptions } from "../../types";

const CHECK_IN_COOLDOWN_HOURS = 24;

/**
 * 檢查距離上次打卡是否未滿 24 小時
 * 支援 ISO 8601 時間戳 (e.g., "2024-01-20T09:00:00.000Z") 和日期字串 (e.g., "2024-01-20")
 * - ISO 時間戳：精確計算是否未滿 24 小時
 * - 日期字串：退回使用「是否為同一天」的判斷
 */
const isWithinCooldown = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;

  try {
    // ISO 8601 時間戳（包含 "T"）：精確計算 24 小時
    if (dateString.includes("T")) {
      const checkInTime = parseISO(dateString);
      if (!isValid(checkInTime)) return false;

      const now = new Date();
      return differenceInHours(now, checkInTime) < CHECK_IN_COOLDOWN_HOURS;
    }

    // 日期字串 (yyyy-MM-dd)：退回使用同一天判斷
    const checkInDate = parse(dateString, "yyyy-MM-dd", new Date());
    if (!isValid(checkInDate)) return false;

    const today = new Date();
    return isSameDay(checkInDate, today);
  } catch {
    return false;
  }
};

/**
 * Hook 用於檢查打卡狀態
 */
export const useCheckInStatus = (options: ICheckInStatusOptions) => {
  const { practiceStatus, lastCheckInDate } = options;

  return useMemo(() => {
    // 檢查實踐是否已完成
    const isPracticeCompleted = practiceStatus === "completed" || practiceStatus === "archived";

    // 檢查距離上次打卡是否未滿 24 小時
    const isTodayCheckedIn = isWithinCooldown(lastCheckInDate);

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
