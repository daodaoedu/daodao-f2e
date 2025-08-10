import { useState, useCallback } from 'react';
import {
  type PracticeFilter,
  type CreatePracticeInput,
} from '@/services/practice';
import { usePractices } from './usePractices';
import { useFilteredPractices } from './useFilteredPractices';

export function usePracticeManager() {
  const [filter, setFilter] = useState<PracticeFilter>({
    searchTerm: '',
    status: undefined,
    contentType: undefined,
    motivationType: undefined,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
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
    refreshPractices,
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
      sortOrder: 'desc',
    });
  }, []);

  // 轉換 PathInfo 為 CreatePracticeInput
  const pathInfoToPractice = useCallback((pathInfo: Record<string, unknown>, practiceAction: string, resources: Array<{name: string, url: string}>, tags: string[] = [], dailyGoalConfig: Record<string, unknown> | null = null): CreatePracticeInput => {
    // 使用共享的轉換函數
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    const { pathInfoToCreatePracticeInput } = require('@/services/practice/utils');
    return pathInfoToCreatePracticeInput(pathInfo, practiceAction, resources, tags, dailyGoalConfig);
  }, []);

  const createPracticeFromPathInfo = useCallback(async (pathInfo: Record<string, unknown>, practiceAction: string, resources: Array<{name: string, url: string}>, tags: string[] = [], dailyGoalConfig: Record<string, unknown> | null = null) => {
    const practiceData = pathInfoToPractice(pathInfo, practiceAction, resources, tags, dailyGoalConfig);
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
    createPracticeFromPathInfo,
  };
}

export type UsePracticeManagerResult = ReturnType<typeof usePracticeManager>;
