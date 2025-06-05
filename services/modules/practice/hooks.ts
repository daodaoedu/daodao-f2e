import useSWR, { mutate } from 'swr';
import { PracticeStorage } from './storage';
import { CheckInService } from './checkIn';
import practiceAPI, { getPracticePathname } from './api';
import type {
  Practice,
  PracticeFilter,
  PracticeStats,
  CreatePracticeInput,
  UpdatePracticeInput,
  CheckInInput,
  CheckInRecord
} from './schema';

// ==================== 主要的 Practice Hooks ====================

// 獲取所有實踐的 Hook
export function usePractices() {
  const { data: practices = [], error, isLoading } = useSWR(
    getPracticePathname(),
    () => PracticeStorage.getAllPractices()
  );

  const { data: stats } = useSWR(
    'practice-stats',
    () => PracticeStorage.getPracticeStats()
  );

  // 建立實踐
  const createPractice = async (input: CreatePracticeInput) => {
    const result = await practiceAPI.create(getPracticePathname(), { arg: input });
    mutate(getPracticePathname());
    mutate('practice-stats');
    return result;
  };

  // 更新實踐
  const updatePractice = async (id: string, updates: UpdatePracticeInput) => {
    const result = await practiceAPI.update(getPracticePathname(), { arg: { id, ...updates } });
    mutate(getPracticePathname());
    mutate('practice-stats');
    return result;
  };

  // 刪除實踐
  const deletePractice = async (id: string) => {
    await practiceAPI.delete(getPracticePathname(), { arg: { id } });
    mutate(getPracticePathname());
    mutate('practice-stats');
  };

  // 簽到
  const checkIn = async (input: CheckInInput) => {
    const result = await practiceAPI.checkIn(getPracticePathname(), { arg: input });
    mutate(getPracticePathname());
    mutate('practice-stats');
    return result;
  };

  // 匯出資料
  const exportData = async () => {
    return practiceAPI.exportData('export-practices', { arg: undefined });
  };

  // 匯入資料
  const importData = async (data: string) => {
    const result = await practiceAPI.importData(getPracticePathname(), { arg: { data } });
    mutate(getPracticePathname());
    mutate('practice-stats');
    return result;
  };

  // 重新載入實踐
  const refreshPractices = () => {
    mutate(getPracticePathname());
    mutate('practice-stats');
  };

  return {
    practices,
    stats: stats || {
      total: 0,
      active: 0,
      completed: 0,
      paused: 0,
      archived: 0,
      totalCheckIns: 0,
      longestStreak: 0,
      averageProgress: 0
    },
    loading: isLoading,
    error: error?.message,
    createPractice,
    updatePractice,
    deletePractice,
    checkIn,
    exportData,
    importData,
    refreshPractices
  };
}

// ==================== 單個實踐的 Hook ====================

export function usePractice(id: string | undefined) {
  const { data: practice, error, isLoading } = useSWR(
    id ? getPracticePathname({ id }) : null,
    () => {
      if (!id) return null;
      return PracticeStorage.getPracticeById(id);
    }
  );

  const stats = practice ? {
    canCheckInToday: !CheckInService.hasCheckedInToday(practice),
    todayCheckIn: CheckInService.getTodayCheckIn(practice),
    checkInStats: CheckInService.getCheckInStats(practice),
    suggestions: CheckInService.getCheckInSuggestions(practice)
  } : undefined;

  return {
    practice,
    stats,
    loading: isLoading,
    error: error?.message
  };
}

// ==================== 篩選實踐的 Hook ====================

export function useFilteredPractices(filter: PracticeFilter) {
  const { data: filteredPractices = [], error, isLoading } = useSWR(
    ['filtered-practices', filter],
    () => PracticeStorage.filterPractices(filter)
  );

  return {
    practices: filteredPractices,
    loading: isLoading,
    error: error?.message
  };
}

// ==================== 活躍實踐的 Hook ====================

export function useActivePractices() {
  const activeFilter: PracticeFilter = {
    status: ['active'],
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  };

  const { data: activePractices = [], error, isLoading } = useSWR(
    'active-practices',
    () => PracticeStorage.filterPractices(activeFilter)
  );

  return {
    practices: activePractices,
    loading: isLoading,
    error: error?.message
  };
}

// ==================== 簽到歷史的 Hook ====================

export function useCheckInHistory(practiceId: string | undefined) {
  const { data: practice } = useSWR(
    practiceId ? getPracticePathname({ id: practiceId }) : null,
    () => {
      if (!practiceId) return null;
      return PracticeStorage.getPracticeById(practiceId);
    }
  );

  const checkInHistory = practice ? CheckInService.formatCheckInHistory(practice) : [];

  return {
    checkIns: checkInHistory,
    practice
  };
}

// ==================== 統計資料的 Hook ====================

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
      averageProgress: 0
    },
    loading: isLoading,
    error: error?.message
  };
}

// ==================== 進度計算的 Hook ====================

export function usePracticeProgress(practiceId: string | undefined) {
  const { practice } = usePractice(practiceId);

  if (!practice) {
    return {
      current: 0,
      total: 0,
      percentage: 0,
      isCompleted: false,
      remaining: 0
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
    remaining: Math.max(practice.totalAmount - practice.currentProgress, 0)
  };
}

// ==================== 簽到檢查的 Hook ====================

export function useCanCheckInToday(practiceId: string | undefined) {
  const { stats } = usePractice(practiceId);
  return stats?.canCheckInToday ?? false;
}

// ==================== 連續天數的 Hook ====================

export function usePracticeStreak(practiceId: string | undefined) {
  const { practice } = usePractice(practiceId);
  return practice?.streak ?? 0;
}

// ==================== 更新單個實踐的便利 Hook ====================

export function usePracticeUpdater(practiceId: string | undefined) {
  const updatePractice = async (updates: UpdatePracticeInput) => {
    if (!practiceId) return undefined;
    const result = await practiceAPI.update(getPracticePathname(), { arg: { id: practiceId, ...updates } });
    mutate(getPracticePathname({ id: practiceId }));
    mutate(getPracticePathname());
    mutate('practice-stats');
    return result;
  };

  const deletePractice = async () => {
    if (!practiceId) return undefined;
    await practiceAPI.delete(getPracticePathname(), { arg: { id: practiceId } });
    mutate(getPracticePathname());
    mutate('practice-stats');
    return undefined;
  };

  const checkIn = async (input: CheckInInput) => {
    if (!practiceId) return undefined;
    const result = await practiceAPI.checkIn(getPracticePathname(), { arg: input });
    mutate(getPracticePathname({ id: practiceId }));
    mutate(getPracticePathname());
    mutate('practice-stats');
    return result;
  };

  return {
    updatePractice: practiceId ? updatePractice : undefined,
    deletePractice: practiceId ? deletePractice : undefined,
    checkIn: practiceId ? checkIn : undefined
  };
}

// ==================== 型別匯出 ====================

export type {
  Practice,
  PracticeFilter,
  PracticeStats,
  CreatePracticeInput,
  UpdatePracticeInput,
  CheckInInput,
  CheckInRecord
};
