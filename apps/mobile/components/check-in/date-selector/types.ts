import type { ICheckInDate, ICheckInDisplayData } from "../types";

/**
 * CheckInDateSelector 組件 Props
 */
export interface ICheckInDateSelectorProps {
  checkInDates: ICheckInDate[];
  checkIns: Record<string, ICheckInDisplayData>;
  practiceId: string;
  activeCheckInId: string;
  /** 目前打卡的日期（yyyy-MM-dd）；用於同日多筆打卡時仍正確高亮，對齊 product */
  activeDate?: string;
  onCheckInSelect?: (checkInId: string) => void;
  /** 頂部標題（如「Check-in Detail」），對齊 product 的 nav 標題 */
  title?: string;
  /** 右側關閉按鈕點擊回調（對齊 product 的 X 關閉） */
  onClose?: () => void;
  /** nav 是否隱藏（向下捲動時），對齊 product 的 hide-on-scroll */
  hidden?: boolean;
  /** nav 高度變化回調（供外層 ScrollView 設定 paddingTop，避免內容被覆蓋） */
  onHeightChange?: (height: number) => void;
}
