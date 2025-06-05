import { useState, useCallback } from 'react';
import {
  usePractices,
  useFilteredPractices,
  usePractice,
  useActivePractices,
  useCheckInHistory,
} from '@/services/modules/practice';
import type { PracticeFilter, CreatePracticeInput } from '@/services/modules/practice';

// 主要的 Practice 管理 Hook
export function usePracticeManager() {
  const [filter, setFilter] = useState<PracticeFilter>({
    searchTerm: '',
    status: undefined,
    contentType: undefined,
    motivationType: undefined,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });

  const {
    practices,
    stats,
    loading,
    error,
    createPractice,
    updatePractice,
    deletePractice,
    checkIn,
    exportData,
    importData,
    refreshPractices
  } = usePractices();

  const { practices: filteredPractices } = useFilteredPractices(filter);

  const updateFilter = useCallback((newFilter: Partial<PracticeFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({
      searchTerm: '',
      status: undefined,
      contentType: undefined,
      motivationType: undefined,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
  }, []);

  // 轉換 PathInfo 為 CreatePracticeInput
  const pathInfoToPractice = useCallback((pathInfo: Record<string, unknown>, smallGoals: Array<{content: string}>, resources: Array<{name: string, url: string}>, tags: string[] = [], dailyGoalConfig: Record<string, unknown> | null = null): CreatePracticeInput => {
    // 使用共享的轉換函數
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    const { pathInfoToCreatePracticeInput } = require('@/services/modules/practice/utils');
    return pathInfoToCreatePracticeInput(pathInfo, smallGoals, resources, tags, dailyGoalConfig);
  }, []);

  const createPracticeFromPathInfo = useCallback(async (pathInfo: Record<string, unknown>, smallGoals: Array<{content: string}>, resources: Array<{name: string, url: string}>, tags: string[] = [], dailyGoalConfig: Record<string, unknown> | null = null) => {
    const practiceData = pathInfoToPractice(pathInfo, smallGoals, resources, tags, dailyGoalConfig);
    const practice = await createPractice(practiceData);
    return practice.id;
  }, [createPractice, pathInfoToPractice]);

  return {
    // 狀態
    practices,
    filteredPractices,
    filter,
    stats,
    loading,
    error,

    // 操作方法
    createPractice,
    updatePractice,
    deletePractice,
    checkIn,

    // 篩選和搜尋
    updateFilter,
    resetFilter,

    // 資料管理
    exportData,
    importData,
    refreshPractices,

    // 便利方法
    createPracticeFromPathInfo
  };
}

// 單個 Practice Hook
export function usePracticeDetail(id: string | undefined) {
  const { loading, error } = usePractices();
  const practiceData = usePractice(id);

  return {
    ...practiceData,
    loading,
    error
  };
}

// 活躍 Practice Hook
export function useActivePracticeList() {
  const { practices } = useActivePractices();
  return practices;
}

// Check-in 歷史 Hook
export function usePracticeCheckInHistory(practiceId: string | undefined) {
  return useCheckInHistory(practiceId);
}

// 進度計算 Hook
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
