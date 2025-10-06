import useSWR from 'swr';
import type {
  Practice,
  PracticeFilter,
} from './schema';
import { getPracticePathname } from './api';

export interface PracticeListData {
  data: Practice[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// 獲取 Practice 列表
export function usePractices(filter?: PracticeFilter) {
  const key = filter ? `${getPracticePathname()}?${JSON.stringify(filter)}` : getPracticePathname();

  const { data, error, isLoading, mutate } = useSWR<PracticeListData>(
    key,
    async () => {
      // 使用真實的 Practice API
      const { practiceAPI } = await import('./api');
      return await practiceAPI.readList(filter);
    }
  );

  return {
    practices: data?.data || [],
    pagination: data?.pagination,
    error,
    isLoading,
    mutate,
  };
}

// 獲取單一 Practice
export function usePractice(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Practice>(
    id ? getPracticePathname({ id }) : null,
    async () => {
      const { practiceAPI } = await import('./api');
      return await practiceAPI.read(id!);
    }
  );

  return {
    practice: data,
    error,
    isLoading,
    mutate,
  };
}