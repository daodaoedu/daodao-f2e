import type { ICheckInDate, ICheckInDisplayData } from "../types";

/**
 * CheckInDateSelector 組件 Props
 */
export interface ICheckInDateSelectorProps {
  checkInDates: ICheckInDate[];
  checkIns: Record<string, ICheckInDisplayData>;
  practiceId: string;
  activeCheckInId: string;
}
