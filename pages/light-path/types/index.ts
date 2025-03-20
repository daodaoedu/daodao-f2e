import { ComponentType } from 'react';

export type ContentType = 'book' | 'video' | 'articles' | 'podcast' | 'custom';
export type MotivationType = 'career' | 'personal' | 'project' | 'required' | 'other' | '';
export type ReminderFrequency = 'daily' | 'every-other-day' | 'twice-weekly' | 'weekly';
export type MainView = 'setup' | 'dashboard';
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
  icon: ComponentType<any>;
}

export interface MotivationOption {
  id: MotivationType;
  label: string;
}
