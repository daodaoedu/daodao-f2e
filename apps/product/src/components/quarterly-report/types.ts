import type { MoodType } from "@/constants/mood";

export interface QuarterlyReportUser {
  name: string;
  age: number;
  transition: string;
}

export interface QuarterlyReportQuarter {
  year: number;
  quarter: number;
  totalDays: number;
}

export interface QuarterlyReportStats {
  activeDays: number;
  topics: number;
  interactions: number;
  friends: number;
}

export interface QuarterlyReportMonth {
  month: number;
  activeDays: number;
  topics: number;
  highlights: string[];
}

export interface QuarterlyReportMilestone {
  date: string;
  title: string;
  description: string;
}

export interface QuarterlyReportFriend {
  name: string;
  isCore: boolean;
}

export interface QuarterlyReportLearningDimension {
  dimension: string;
  score: number;
}

export interface QuarterlyReportMoodPoint {
  week: number;
  mood: MoodType;
  score: number;
}

export interface QuarterlyReportAction {
  title: string;
  description: string;
}

export interface QuarterlyReportData {
  user: QuarterlyReportUser;
  quarter: QuarterlyReportQuarter;
  stats: QuarterlyReportStats;
  months: QuarterlyReportMonth[];
  milestones: QuarterlyReportMilestone[];
  friends: QuarterlyReportFriend[];
  learningRadar: QuarterlyReportLearningDimension[];
  moodCurve: QuarterlyReportMoodPoint[];
  actions: QuarterlyReportAction[];
}
