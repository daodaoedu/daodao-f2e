import type { ICheckInDate, ICheckInDisplayData } from "../types";

/**
 * CheckInDateSelector 組件 Props
 */
export interface ICheckInDateSelectorProps {
  checkInDates: ICheckInDate[];
  checkIns: Record<string, ICheckInDisplayData>;
  practiceId: string;
  activeCheckInId: string;
  onCheckInSelect?: (checkInId: string) => void;
  /** 頂部標題（如「Check-in Detail」），對齊 product 的 nav 標題 */
  title?: string;
  /** 右側關閉按鈕點擊回調（對齊 product 的 X 關閉） */
  onClose?: () => void;
}
