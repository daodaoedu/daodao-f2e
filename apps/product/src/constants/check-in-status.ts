/**
 * 打卡狀態運行時常數
 */
export const CheckInStatus = {
  available: "available",
  alreadyCheckedIn: "already-checked-in",
  practiceCompleted: "practice-completed",
  /** 實踐已到期，可觀看總結 */
  viewSummary: "view-summary",
} as const;

/**
 * 打卡狀態類型
 */
export type CheckInStatusType = (typeof CheckInStatus)[keyof typeof CheckInStatus];
