import useSWR from 'swr';
import { PracticeStorage } from '@/services/practice/storage';
import practiceAPI, { getPracticePathname } from '@/services/practice/api';
import type { CreatePracticeInput, UpdatePracticeInput, CheckInInput } from '@/services/practice/schema';
import { invalidateAllCaches } from './utils';

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
    invalidateAllCaches();
    return result;
  };

  // 更新實踐
  const updatePractice = async (id: string, updates: UpdatePracticeInput) => {
    const result = await practiceAPI.update(getPracticePathname(), { arg: { id, ...updates } });
    invalidateAllCaches(id);
    return result;
  };

  // 刪除實踐
  const deletePractice = async (id: string) => {
    await practiceAPI.delete(getPracticePathname(), { arg: { id } });
    invalidateAllCaches(id);
  };

  // 簽到
  const checkIn = async (input: CheckInInput) => {
    const result = await practiceAPI.checkIn(getPracticePathname(), { arg: input });
    invalidateAllCaches(input.practiceId);
    return result;
  };

  // 匯出資料
  const exportData = async () => practiceAPI.exportData('export-practices', { arg: undefined });

  // 匯入資料
  const importData = async (data: string) => {
    const result = await practiceAPI.importData(getPracticePathname(), { arg: { data } });
    invalidateAllCaches();
    return result;
  };

  // 重新載入實踐
  const refreshPractices = () => {
    invalidateAllCaches();
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
      averageProgress: 0,
    },
    loading: isLoading,
    error: error?.message,
    createPractice,
    updatePractice,
    deletePractice,
    checkIn,
    exportData,
    importData,
    refreshPractices,
  };
}
