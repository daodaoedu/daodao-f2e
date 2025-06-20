import useSWR from 'swr';
import { PracticeStorage } from '@/services/practice/storage';
import type { PracticeFilter } from '@/services/practice/schema';

// 篩選實踐的 Hook
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

// 活躍實踐的 Hook
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
