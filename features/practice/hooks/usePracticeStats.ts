import useSWR from 'swr';
import { PracticeStorage } from '@/services/practice/storage';

// 統計資料的 Hook
export function usePracticeStats() {
  const { data: stats, error, isLoading } = useSWR(
    'practice-stats',
    () => PracticeStorage.getPracticeStats()
  );

  return {
    stats: stats || {
      total: 0,
      active: 0,
      completed: 0,
      paused: 0,
      archived: 0,
      totalCheckIns: 0,
      longestStreak: 0,
      averageProgress: 0,
    },
    loading: isLoading,
    error: error?.message,
  };
}
