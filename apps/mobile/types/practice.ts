export type PracticeStatusType = "active" | "completed" | "archived";
export type TaskStatusType = "draft" | "not-started" | "in-progress" | "completed";
export type PracticeFrequencyType = "daily" | "weekly" | "custom";
export type PracticeThemeType = "yellow" | "blue" | "pink" | "green";

// 合併狀態類型以支援所有可能的狀態值
export type CombinedStatusType = PracticeStatusType | TaskStatusType;

export interface IPractice {
  id: string;
  title: string;
  description?: string;
  frequency: PracticeFrequencyType;
  targetDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  status: CombinedStatusType;
  practiceStatus?: PracticeStatusType;
  tags: string[];
  color?: string;
  icon?: string;
  theme?: PracticeThemeType;
  isCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
  lastCheckInAt?: string;
  todayCheckedIn: boolean;
  // 詳情頁對齊 product 所需欄位
  frequencyMinDays?: number;
  frequencyMaxDays?: number;
  sessionDurationMinutes?: number;
  practiceTimePeriods?: string[];
  startDate?: string | null;
  endDate?: string | null;
  progressPercentage?: number;
  durationDays?: number;
  resources?: IPracticeResource[];
}

export interface IPracticeResource {
  id: string;
  name: string;
  url?: string;
}

export interface ICheckIn {
  id: string;
  practiceId: string;
  note?: string;
  createdAt: string;
}

export interface IPracticeStats {
  totalPractices: number;
  activePractices: number;
  completedToday: number;
  totalToday: number;
  currentStreak: number;
  totalCheckIns: number;
}

export interface IPracticesResponse {
  practices: IPractice[];
  stats: IPracticeStats;
}
