import { useMemo } from "react";
import { CheckInStatus, type CheckInStatusType } from "@/constants/check-in-status";
import type { ICheckInStatusOptions } from "../../types";

/**
 * 判斷實踐是否已到期
 * @param endDate 結束日期 (YYYY-MM-DD 格式)
 * @param practiceStatus 實踐狀態
 * @returns 是否已到期
 */
const checkIsExpired = (endDate?: string | null, practiceStatus?: string): boolean => {
  // 如果狀態是 completed，則視為已到期
  if (practiceStatus === "completed") return true;

  // 如果有結束日期，檢查是否已過期
  if (endDate) {
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999); // 設置為當天結束
    return new Date() > endDateTime;
  }

  return false;
};

/**
 * Hook 用於檢查打卡狀態
 */
export const useCheckInStatus = (options: ICheckInStatusOptions) => {
  const { practiceStatus, endDate } = options;

  return useMemo(() => {
    // 檢查實踐是否已完成（包含封存）
    const isPracticeCompleted = practiceStatus === "completed" || practiceStatus === "archived";

    // 檢查實踐是否已到期（可觀看總結）
    const isExpired = checkIsExpired(endDate, practiceStatus);

    // 不限制打卡冷卻時間
    const isCheckInLocked = false;

    // 決定最終狀態（優先級：已到期可觀看總結 > 已封存 > 冷卻中 > 可打卡）
    const getStatus = (): CheckInStatusType => {
      // 已到期且非封存狀態 -> 可觀看總結
      if (isExpired && practiceStatus !== "archived") {
        return CheckInStatus.viewSummary;
      }
      // 已封存 -> 實踐已完成（不可操作）
      if (practiceStatus === "archived") {
        return CheckInStatus.practiceCompleted;
      }
      if (isCheckInLocked) return CheckInStatus.alreadyCheckedIn;
      return CheckInStatus.available;
    };
    const status = getStatus();

    // 取得按鈕文字
    const getButtonLabel = (): string => {
      switch (status) {
        case CheckInStatus.viewSummary:
          return "觀看總結";
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

    // 是否可以點擊打卡（不包含觀看總結）
    const canCheckIn = status === CheckInStatus.available;

    // 是否可以點擊按鈕（包含打卡和觀看總結）
    const canClick = status === CheckInStatus.available || status === CheckInStatus.viewSummary;

    return {
      status,
      isPracticeCompleted,
      isExpired,
      isCheckInLocked,
      canCheckIn,
      canClick,
      getButtonLabel,
    };
  }, [practiceStatus, endDate]);
};
