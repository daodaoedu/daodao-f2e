import type { CheckInStatusType } from "@/constants/check-in-status";
import type { MoodType } from "@/constants/mood";
import type { PracticeStatus } from "@/constants/practice-status";

/**
 * 打卡表單資料（用於表單輸入）
 */
export interface ICheckInFormData {
  mood: MoodType | null;
  tags: string[];
  description: string;
  media: File[];
  /** 編輯時要保留的既有圖片 URL */
  existingImageUrls?: string[];
}

/**
 * 打卡顯示資料（用於顯示打卡記錄）
 */
export interface ICheckInDisplayData {
  id: string;
  date: string;
  mood: MoodType | null;
  content: string;
  tags: string[];
  images?: string[];
  practiceTitle: string;
  /** 累計瀏覽數（同一使用者 24h 內只計一次） */
  viewCount?: number;
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
   * - {@link PracticeStatus}
   */
  practiceStatus?: string;
  /**
   * 最後打卡時間（已停用，不再限制打卡冷卻時間）
   * @deprecated 已移除 24 小時打卡限制
   */
  lastCheckInDate?: string | null;
  /**
   * 實踐開始日期 (ISO 格式字串，例如 "2026-01-01")
   * 用於檢查打卡日期是否早於開始日期
   */
  startDate?: string | null;
  /**
   * 實踐結束日期 (ISO 格式字串，例如 "2026-01-31")
   * 用於判斷實踐是否已到期，到期後顯示「觀看總結」按鈕
   */
  endDate?: string | null;
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
 * SVG 幾何資料
 */
export interface ISvgGeometry {
  width: number;
  height: number;
  path?: string;
  isCircle?: boolean;
  radius?: number;
}

/**
 * 物理引擎 body 位置資料
 */
export interface IBodyPosition {
  id: number;
  x: number;
  y: number;
  angle: number;
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
