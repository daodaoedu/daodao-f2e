import { useState, useCallback } from 'react';
import useSWR from 'swr';
import type {
  IdeaSearchParamsSchema,
} from '@/services/ideas';
import { ideaAPI, buildIdeaQueryString } from '@/services/ideas';

// Ideas 列表 Hook
export function useIdeas(params?: IdeaSearchParamsSchema) {
  // 建構 SWR key
  const queryString = buildIdeaQueryString(params);
  const swrKey = `/ideas${queryString}`;

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => ideaAPI.readList(params),
    {
      dedupingInterval: 60000, // 1 分鐘內不重複獲取
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  return {
    ideas: data?.ideas ?? [],
    pagination: data?.pagination,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
    isEmpty: !isLoading && (!data?.ideas || data.ideas.length === 0),
  };
}

// 單一想法 Hook
export function useIdea(ideaId: string) {
  const swrKey = ideaId ? `/ideas/${ideaId}` : null;

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => ideaAPI.read(ideaId),
    {
      dedupingInterval: 30000, // 30 秒內不重複獲取
      revalidateOnFocus: false,
    }
  );

  return {
    idea: data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// Ideas 搜尋 Hook
export function useIdeaSearch(initialParams?: IdeaSearchParamsSchema) {
  const [searchParams, setSearchParams] = useState<IdeaSearchParamsSchema>(
    initialParams ?? {
      visibility: 'public',
      sortBy: 'createdDate',
      sortOrder: 'desc'
    }
  );

  const { ideas, pagination, isLoading, isError, refresh } = useIdeas(searchParams);

  const updateSearch = useCallback((newParams: Partial<IdeaSearchParamsSchema>) => {
    setSearchParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchParams({
      visibility: 'public',
      sortBy: 'createdDate',
      sortOrder: 'desc'
    });
  }, []);

  return {
    ideas,
    pagination,
    searchParams,
    isLoading,
    isError,
    updateSearch,
    clearSearch,
    refresh,
  };
}

// Ideas 快取更新工具 Hook
// 使用新的快取管理 hook
