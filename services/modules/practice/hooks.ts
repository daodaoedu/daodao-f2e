import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useCallback, useMemo } from 'react';
import { Practice, PracticeFilter, PracticeStats, CreatePracticeInput, UpdatePracticeInput, CheckInInput } from './schema';
import practiceAPI, { getPracticePathname } from './api';
import { searchPractices, sortPractices, calculateProgress } from './utils';

// SWR Fetcher
const fetcher = async (): Promise<Practice[]> => {
  const { PracticeStorage } = await import('./storage');
  return PracticeStorage.load();
};

// 主要的 Practice Hook
export function usePractices() {
  const { data: practices = [], error, isLoading, mutate } = useSWR(
    getPracticePathname(),
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const createMutation = useSWRMutation(getPracticePathname(), practiceAPI.create);
  const updateMutation = useSWRMutation(getPracticePathname(), practiceAPI.update);
  const deleteMutation = useSWRMutation(getPracticePathname(), practiceAPI.delete);
  const checkInMutation = useSWRMutation(getPracticePathname(), practiceAPI.checkIn);
  const exportMutation = useSWRMutation(getPracticePathname(), practiceAPI.exportData);
  const importMutation = useSWRMutation(getPracticePathname(), practiceAPI.importData);

  const createPractice = useCallback(async (input: CreatePracticeInput) => {
    const practice = await createMutation.trigger(input);
    await mutate();
    return practice;
  }, [createMutation, mutate]);

  const updatePractice = useCallback(async (id: string, updates: UpdatePracticeInput) => {
    const practice = await updateMutation.trigger({ id, ...updates });
    await mutate();
    return practice;
  }, [updateMutation, mutate]);

  const deletePractice = useCallback(async (id: string) => {
    await deleteMutation.trigger({ id });
    await mutate();
  }, [deleteMutation, mutate]);

  const checkIn = useCallback(async (input: CheckInInput) => {
    const checkInRecord = await checkInMutation.trigger(input);
    await mutate();
    return checkInRecord;
  }, [checkInMutation, mutate]);

  const exportData = useCallback(async () => {
    return exportMutation.trigger();
  }, [exportMutation]);

  const importData = useCallback(async (data: string) => {
    await importMutation.trigger({ data });
    await mutate();
  }, [importMutation, mutate]);

  // 計算統計資料
  const stats: PracticeStats = useMemo(() => {
    return {
      total: practices.length,
      active: practices.filter((p) => p.status === 'active').length,
      completed: practices.filter((p) => p.status === 'completed').length,
      paused: practices.filter((p) => p.status === 'paused').length,
      archived: practices.filter((p) => p.status === 'archived').length,
      totalCheckIns: practices.reduce((sum, p) => sum + (p.checkIns?.length || 0), 0),
      longestStreak: Math.max(0, ...practices.map((p) => p.streak)),
      averageProgress: practices.length > 0
        ? Math.round(practices.reduce((sum, p) => sum + calculateProgress(p.currentProgress, p.totalAmount), 0) / practices.length)
        : 0
    };
  }, [practices]);

  return {
    practices,
    stats,
    loading: isLoading,
    error: error?.message,
    createPractice,
    updatePractice,
    deletePractice,
    checkIn,
    exportData,
    importData,
    refreshPractices: mutate
  };
}

// 篩選的 Practice Hook
export function useFilteredPractices(filter: PracticeFilter) {
  const { practices } = usePractices();

  return useMemo(() => {
    let filtered = [...practices];

    // 搜尋過濾
    if (filter.searchTerm) {
      filtered = searchPractices(filtered, filter.searchTerm);
    }

    // 狀態過濾
    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter((practice) => filter.status!.includes(practice.status));
    }

    // 內容類型過濾
    if (filter.contentType && filter.contentType.length > 0) {
      filtered = filtered.filter((practice) => filter.contentType!.includes(practice.contentType));
    }

    // 動機類型過濾
    if (filter.motivationType && filter.motivationType.length > 0) {
      filtered = filtered.filter((practice) =>
        practice.motivationType && filter.motivationType!.includes(practice.motivationType)
      );
    }

    // 排序
    if (filter.sortBy) {
      filtered = sortPractices(filtered, filter.sortBy, filter.sortOrder);
    }

    return filtered;
  }, [practices, filter]);
}

// 單個 Practice Hook
export function usePractice(id: string | undefined) {
  const { practices, updatePractice, deletePractice, checkIn } = usePractices();

  const practice = useMemo(() => {
    return id ? practices.find((p) => p.id === id) : undefined;
  }, [practices, id]);

  const stats = useMemo(() => {
    if (!practice) return null;

    const checkIns = practice.checkIns || [];

    return {
      practice,
      checkIns,
      totalCheckIns: checkIns.length,
      completionRate: calculateProgress(practice.currentProgress, practice.totalAmount),
      streak: practice.streak,
      isCompleted: practice.currentProgress >= practice.totalAmount,
      canCheckInToday: !checkIns.some((c) => {
        const today = new Date().toISOString().split('T')[0];
        return c.date === today;
      })
    };
  }, [practice]);

  return {
    practice,
    stats,
    updatePractice,
    deletePractice,
    checkIn
  };
}

// 活躍的 Practice Hook
export function useActivePractices() {
  const { practices } = usePractices();

  return useMemo(() => {
    return practices.filter((p) => p.status === 'active');
  }, [practices]);
}

// Check-in 歷史 Hook
export function useCheckInHistory(practiceId: string | undefined) {
  const { practice } = usePractice(practiceId);

  return useMemo(() => {
    return practice?.checkIns || [];
  }, [practice]);
}
