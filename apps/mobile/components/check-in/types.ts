import type { CheckInStatusType } from "../../constants/check-in-status";
import type { MoodType } from "../../constants/mood";

/**
 * 打卡表單資料（用於表單輸入）
 */
export interface ICheckInFormData {
  mood: MoodType | null;
  tags: string[];
  description: string;
  mediaUris: string[];
}

/**
 * 打卡顯示資料（用於顯示打卡記錄）
 */
export interface ICheckInDisplayData {
  id: string;
  date: string;
  mood: MoodType;
  content: string;
  tags: string[];
  images?: string[];
  practiceTitle: string;
}

/**
 * 打卡日期資料
 */
export interface ICheckInDate {
  id: string;
  date: string;
  hasCheckIn?: boolean;
  /** 該日打卡次數（用於決定按鈕顏色深淺） */
  checkInCount?: number;
}

export type { CheckInStatusType };

/**
 * 打卡狀態選項
 */
export interface ICheckInStatusOptions {
  /**
   * 實踐狀態
   */
  practiceStatus?: string;
  /**
   * 最後打卡時間（已停用，不再限制打卡冷卻時間）
   * @deprecated 已移除 24 小時打卡限制
   */
  lastCheckInDate?: string | null;
}

/**
 * 心情統計資料
 */
export interface IMoodStat {
  mood: MoodType;
  count: number;
}

/**
 * 想法標籤統計資料
 */
export interface IThoughtTag {
  tag: string;
  count: number;
}

/**
 * 打卡項目資料（用於打卡堆疊）
 */
export interface ICheckInItem {
  id: string;
  date: string;
  mood: MoodType;
  content: string;
}
