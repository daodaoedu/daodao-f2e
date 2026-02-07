/**
 * 實踐狀態運行時常數
 */
export const PracticeStatus = {
  draft: "draft",
  notStarted: "not_started",
  active: "active",
  completed: "completed",
  archived: "archived",
} as const;

/**
 * 實踐狀態類型
 */
export type PracticeStatus = (typeof PracticeStatus)[keyof typeof PracticeStatus];
