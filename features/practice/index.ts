// 導出 Practice 功能相關的所有 hooks 和組件
export * from './hooks';

// 導出組件
export { default as TagList } from './components/Shared/TagList';
export type { TagListProps } from './components/Shared/TagList';

// 導出所有類型
export type {
  Practice,
  PracticeFilter,
  PracticeStats,
  CreatePracticeInput,
  UpdatePracticeInput,
  CheckInInput,
  CheckInRecord,
  MotivationType,
  ReminderFrequency,
  Resource,
  ResourceType,
  DashboardView
} from '@/services/practice/schema';

// 導出服務
export { CheckInService } from '@/services/practice/checkIn';
