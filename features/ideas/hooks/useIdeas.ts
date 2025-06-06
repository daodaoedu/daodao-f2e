import { useState, useCallback, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { ideaAPI, getIdeaPathname, buildIdeaQueryString } from '@/services/modules/ideas';
import type { IdeaQuerySchema, IdeaListResponseSchema, IdeaSchema } from '@/services/modules/ideas';
import { useIdeasContext } from '../contexts';

// 防抖助手函數
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface UseIdeasOptions {
  initialParams?: Partial<IdeaQuerySchema>;
  autoFetch?: boolean;
}

interface UseIdeasReturn {
  // Data
  ideas: IdeaSchema[];
  total: number;
  totalPages: number;
  currentPage: number;

  // State
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;

  // Actions
  refetch: () => void;
  loadMore: () => Promise<void>;
  updateParams: (newParams: Partial<IdeaQuerySchema>) => void;
  refresh: () => Promise<void>;

  // Current params
  params: IdeaQuerySchema;
}

/**
 * 處理Ideas列表相關邏輯的Hook
 * Phase 2: 效能優化版本
 */
export const useIdeas = ({
  initialParams = {},
  autoFetch = true,
}: UseIdeasOptions = {}): UseIdeasReturn => {
  const { state: contextState } = useIdeasContext();

  const [params, setParams] = useState<IdeaQuerySchema>(() => ({
    page: 1,
    pageSize: 10,
    visibility: 'public',
    sortBy: 'createdDate',
    sortOrder: 'desc',
    ...initialParams,
  }));

  const [allIdeas, setAllIdeas] = useState<IdeaSchema[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 為搜尋進行防抖處理
  const debouncedSearch = useDebounce(params.search || '', 300);

  // 優化的 SWR key 生成，使用防抖後的搜尋參數
  const optimizedParams = useMemo(() => ({
    ...params,
    search: debouncedSearch,
  }), [params, debouncedSearch]);

  const swrKey = useMemo(() => {
    return autoFetch
      ? `${getIdeaPathname()}?${buildIdeaQueryString(optimizedParams)}`
      : null;
  }, [autoFetch, optimizedParams]);

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<IdeaListResponseSchema>(
    swrKey,
    () => ideaAPI.list(optimizedParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 2000, // 避免重複請求
    }
  );

  // 優化的數據更新邏輯
  useEffect(() => {
    if (data?.data) {
      if (optimizedParams.page === 1) {
        // 重置搜尋/篩選 - 結合本地想法
        const combinedIdeas = [...contextState.localIdeas, ...data.data];
        setAllIdeas(combinedIdeas);
      } else {
        // 分頁追加
        setAllIdeas((prev) => [...prev, ...data.data]);
      }
    } else if (optimizedParams.page === 1) {
      // 如果沒有遠程數據，只顯示本地想法
      setAllIdeas(contextState.localIdeas);
    }
  }, [data, optimizedParams.page, contextState.localIdeas]);

  // 優化的篩選和排序邏輯
  const filteredIdeas = useMemo(() => {
    let filtered = allIdeas;

    // 應用搜索篩選
    if (optimizedParams.search) {
      const searchLower = optimizedParams.search.toLowerCase();
      filtered = filtered.filter((idea) =>
        idea.title.toLowerCase().includes(searchLower) ||
        idea.content.toLowerCase().includes(searchLower) ||
        idea.authorName.toLowerCase().includes(searchLower) ||
        idea.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // 應用標籤篩選
    if (optimizedParams.tags && optimizedParams.tags.length > 0) {
      filtered = filtered.filter((idea) =>
        optimizedParams.tags!.some((tag) => idea.tags.includes(tag))
      );
    }

    // 應用可見性篩選
    if (optimizedParams.visibility && optimizedParams.visibility !== 'all') {
      filtered = filtered.filter((idea) => idea.visibility === optimizedParams.visibility);
    }

    return filtered;
  }, [allIdeas, optimizedParams.search, optimizedParams.tags, optimizedParams.visibility]);

  // 單獨的排序邏輯，避免在篩選中進行複雜計算
  const sortedIdeas = useMemo(() => {
    const sorted = [...filteredIdeas];

    sorted.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (optimizedParams.sortBy) {
        case 'createdDate':
          aValue = new Date(a.createdDate).getTime();
          bValue = new Date(b.createdDate).getTime();
          break;
        case 'updatedDate':
          aValue = new Date(a.updatedDate).getTime();
          bValue = new Date(b.updatedDate).getTime();
          break;
        case 'likeCount':
          aValue = a.likeCount;
          bValue = b.likeCount;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (optimizedParams.sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return sorted;
  }, [filteredIdeas, optimizedParams.sortBy, optimizedParams.sortOrder]);

  const updateParams = useCallback((newParams: Partial<IdeaQuerySchema>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      page: newParams.page ?? 1, // Reset to page 1 for new searches
    }));
  }, []);

  // 計算衍生狀態
  const derivedState = useMemo(() => ({
    hasMore: data ? (optimizedParams.page * optimizedParams.pageSize) < (data.pagination?.totalCount || 0) : false,
    errorMessage: error?.message || null,
    totalCount: data?.pagination?.totalCount || sortedIdeas.length,
    totalPages: data?.pagination?.totalPages || Math.ceil(sortedIdeas.length / optimizedParams.pageSize),
  }), [data, optimizedParams.page, optimizedParams.pageSize, error, sortedIdeas.length]);

  const loadMore = useCallback(async () => {
    if (!data || isLoadingMore || !derivedState.hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = optimizedParams.page + 1;
      setParams((prev) => ({ ...prev, page: nextPage }));
    } catch (err) {
      console.error('Failed to load more ideas:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [data, isLoadingMore, optimizedParams.page, derivedState.hasMore]);

  const refresh = useCallback(async () => {
    setAllIdeas([]);
    setParams((prev) => ({ ...prev, page: 1 }));
    await mutate();
  }, [mutate]);

  const refetch = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    // Data - return sorted ideas instead of allIdeas
    ideas: sortedIdeas,
    total: derivedState.totalCount,
    totalPages: derivedState.totalPages,
    currentPage: optimizedParams.page,

    // State
    isLoading: isLoading || isLoadingMore,
    error: derivedState.errorMessage,
    hasMore: derivedState.hasMore,

    // Actions
    refetch,
    loadMore,
    updateParams,
    refresh,

    // Current params
    params: optimizedParams,
  };
};
