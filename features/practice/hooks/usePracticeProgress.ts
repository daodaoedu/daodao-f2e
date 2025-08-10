import { usePractice } from './usePractice';

// 進度計算 Hook
export function usePracticeProgress(practiceId: string | undefined) {
  const { practice } = usePractice(practiceId);

  if (!practice) {
    return {
      current: 0,
      total: 0,
      percentage: 0,
      isCompleted: false,
      remaining: 0,
    };
  }

  const percentage = practice.totalAmount > 0
    ? Math.min(Math.round((practice.currentProgress / practice.totalAmount) * 100), 100)
    : 0;

  return {
    current: practice.currentProgress,
    total: practice.totalAmount,
    percentage,
    isCompleted: practice.currentProgress >= practice.totalAmount,
    remaining: Math.max(practice.totalAmount - practice.currentProgress, 0),
  };
}

// 檢查今日是否可簽到 Hook
export function useCanCheckInToday(practiceId: string | undefined) {
  const { stats } = usePractice(practiceId);
  return stats?.canCheckInToday ?? false;
}

// 連續天數 Hook
export function usePracticeStreak(practiceId: string | undefined) {
  const { practice } = usePractice(practiceId);
  return practice?.streak ?? 0;
}
