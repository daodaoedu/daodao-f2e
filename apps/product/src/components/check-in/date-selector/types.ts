import type { ICheckInDate, ICheckInDisplayData } from "../types";

/**
 * CheckInDateSelector 組件 Props
 */
export interface ICheckInDateSelectorProps {
  checkInDates: ICheckInDate[];
  checkIns: Record<string, ICheckInDisplayData>;
  practiceId: string;
  activeCheckInId: string;
  /** 目前打卡的日期（yyyy-MM-dd），用於同日多筆打卡時正確高亮日期按鈕 */
  activeDate?: string;
  /** 標題（整合到日期選擇器中，用於 mobile 版本同步顯示/隱藏） */
  title?: string;
  /** 關閉按鈕的目標路由 */
  closeActionTo?: string;
}
