import type { MoodType } from "@/constants/mood";

/**
 * 打卡資料類型
 */
export interface CheckInData {
  /** 心情 */
  mood: MoodType;
  /** 描述文字 */
  description?: string;
  /** 標籤 */
  tags?: string[];
  /** 媒體 URLs */
  mediaUrls?: string[];
}

/**
 * 打卡記錄類型
 */
export interface CheckInRecord extends CheckInData {
  /** 打卡 ID */
  id: string;
  /** 實踐 ID */
  practiceId: string;
  /** 打卡時間 */
  createdAt: string;
  /** 更新時間 */
  updatedAt?: string;
}
