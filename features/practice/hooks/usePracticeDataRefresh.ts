import { invalidateAllCaches } from './utils';

// 數據更新監聽 Hook
export function usePracticeDataRefresh() {
  const refreshAll = () => {
    invalidateAllCaches();
  };

  const refreshPractice = (practiceId: string) => {
    invalidateAllCaches(practiceId);
  };

  return {
    refreshAll,
    refreshPractice
  };
}
