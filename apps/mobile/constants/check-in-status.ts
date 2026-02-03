/**
 * 打卡狀態運行時常數
 */
export const CheckInStatus = {
  available: "available",
  alreadyCheckedIn: "already-checked-in",
  practiceCompleted: "practice-completed",
} as const;

/**
 * 打卡狀態類型
 */
export type CheckInStatusType = (typeof CheckInStatus)[keyof typeof CheckInStatus];
