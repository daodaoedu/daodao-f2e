export type PracticeStatus = "active" | "completed" | "archived";
export type TaskStatus = "draft" | "not-started" | "in-progress" | "completed";
export type PracticeFrequency = "daily" | "weekly" | "custom";
export type PracticeTheme = "yellow" | "blue" | "pink" | "green";

// 合併狀態類型以支援所有可能的狀態值
export type CombinedStatus = PracticeStatus | TaskStatus;

export interface Practice {
  id: string;
  title: string;
  description?: string;
  frequency: PracticeFrequency;
  targetDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  status: CombinedStatus;
  practiceStatus?: PracticeStatus;
  tags: string[];
  color?: string;
  icon?: string;
  theme?: PracticeTheme;
  isCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
  lastCheckInAt?: string;
  todayCheckedIn: boolean;
}

export interface CheckIn {
  id: string;
  practiceId: string;
  note?: string;
  createdAt: string;
}

export interface PracticeStats {
  totalPractices: number;
  activePractices: number;
  completedToday: number;
  totalToday: number;
  currentStreak: number;
  totalCheckIns: number;
}

export interface PracticesResponse {
  practices: Practice[];
  stats: PracticeStats;
}
