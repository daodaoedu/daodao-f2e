// 服務層主入口 - 保持向後相容
import { ComponentType } from 'react';

// 重新匯出所有類型
export * from './types';
export * from './utils';
export * from './storage';

// 向後相容的類型定義
export type ContentType = 'book' | 'video' | 'articles' | 'podcast' | 'custom';
export type MotivationType = 'career' | 'personal' | 'project' | 'required' | 'other' | '';
export type ReminderFrequency = 'daily' | 'every-other-day' | 'twice-weekly' | 'weekly';
export type MainView = 'setup' | 'dashboard' | 'list';
export type DashboardView = 'main' | 'checkin' | 'history';

export interface PathInfo {
  title: string;
  contentType: ContentType;
  totalAmount: string;
  currentProgress: string;
  targetDate: string;
  notes: string;
  motivationType: MotivationType;
  customMotivation: string;
  lastCheckin: string;
  isPublic: boolean;
  reminderEnabled: boolean;
  reminderFrequency: ReminderFrequency;
  streak: number;
  lastStreakDate: string;
}

export interface CheckInEntry {
  date: string;
  time: string;
  progress: string;
  note: string;
}

export interface ContentTypeOption {
  id: ContentType;
  label: string;
  icon: ComponentType<{className?: string}>;
}

export interface MotivationOption {
  id: MotivationType;
  label: string;
}