export { usePractices } from './usePractices';
export { usePractice } from './usePractice';
export { useFilteredPractices, useActivePractices } from './useFilteredPractices';
export { useCheckInHistory } from './useCheckInHistory';
export { usePracticeStats } from './usePracticeStats';
export { usePracticeProgress, useCanCheckInToday, usePracticeStreak } from './usePracticeProgress';
export { usePracticeUpdater } from './usePracticeUpdater';
export { usePracticeDataRefresh } from './usePracticeDataRefresh';
export { usePracticeManager } from './usePracticeManager';
export { useActivePracticeList } from './useActivePracticeList';
export { usePracticeDetail } from './usePracticeDetail';
export { usePracticeCheckInHistory } from './useCheckInPractice';

// Re-export types
export type {
  Practice,
  PracticeFilter,
  PracticeStats,
  CreatePracticeInput,
  UpdatePracticeInput,
  CheckInInput,
  CheckInRecord
} from '@/services/practice/schema';
