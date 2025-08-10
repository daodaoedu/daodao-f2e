import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import type { IdeaSchema, IdeaListResponseSchema } from '@/services/ideas/schema';

/**
 * Ideas 快取管理 Hook
 * 專門處理 SWR 快取的更新、添加、移除邏輯
 */
export function useIdeasCache() {
  const { mutate } = useSWRConfig();

  /**
   * 更新快取中的想法資料
   * @param updatedIdea 更新的想法資料（可以是部分資料）
   */
  const updateIdeaInCache = useCallback((updatedIdea: Partial<IdeaSchema> & { id: string }) => {
    // 更新列表快取中的項目
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/ideas'),
      (data: IdeaListResponseSchema | undefined) => {
        if (!data || !data.ideas) return data;

        return {
          ...data,
          ideas: data.ideas.map((idea) => (idea.id === updatedIdea.id ? { ...idea, ...updatedIdea } : idea)),
        };
      },
      { revalidate: false }
    );

    // 更新詳細頁快取
    mutate(
      `/api/ideas/${updatedIdea.id}`,
      (existingData: IdeaSchema | undefined) => {
        if (!existingData) return existingData;
        return { ...existingData, ...updatedIdea };
      },
      { revalidate: false }
    );
  }, [mutate]);

  /**
   * 新增想法到快取中
   * @param newIdea 新的想法資料
   * @param position 插入位置 ('start' | 'end')
   */
  const addIdeaToCache = useCallback((newIdea: IdeaSchema, position: 'start' | 'end' = 'start') => {
    // 添加到列表快取的開頭或結尾
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/ideas'),
      (data: IdeaListResponseSchema | undefined) => {
        if (!data) {
          return {
            ideas: [newIdea],
            pagination: {
              page: 1,
              pageSize: 20,
              totalCount: 1,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          };
        }

        const updatedIdeas = position === 'start'
          ? [newIdea, ...data.ideas]
          : [...data.ideas, newIdea];

        return {
          ...data,
          ideas: updatedIdeas,
          pagination: {
            ...data.pagination,
            totalCount: data.pagination.totalCount + 1,
            totalPages: Math.ceil((data.pagination.totalCount + 1) / data.pagination.pageSize),
          },
        };
      },
      { revalidate: false }
    );

    // 添加到詳細頁快取
    mutate(`/api/ideas/${newIdea.id}`, newIdea, { revalidate: false });
  }, [mutate]);

  /**
   * 從快取中移除想法
   * @param ideaId 要移除的想法 ID
   */
  const removeIdeaFromCache = useCallback((ideaId: string) => {
    // 從列表快取中移除項目
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/ideas'),
      (data: IdeaListResponseSchema | undefined) => {
        if (!data || !data.ideas) return data;

        return {
          ...data,
          ideas: data.ideas.filter((idea) => idea.id !== ideaId),
          pagination: {
            ...data.pagination,
            totalCount: Math.max(0, data.pagination.totalCount - 1),
            totalPages: Math.ceil(Math.max(0, data.pagination.totalCount - 1) / data.pagination.pageSize),
          },
        };
      },
      { revalidate: false }
    );

    // 清除詳細頁快取
    mutate(`/api/ideas/${ideaId}`, undefined, { revalidate: false });
  }, [mutate]);

  /**
   * 批量更新快取中的想法
   * @param updates 要更新的想法陣列
   */
  const batchUpdateIdeasInCache = useCallback((updates: Array<Partial<IdeaSchema> & { id: string }>) => {
    // 批量更新列表快取
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/ideas'),
      (data: IdeaListResponseSchema | undefined) => {
        if (!data || !data.ideas) return data;

        const updatesMap = new Map(updates.map((update) => [update.id, update]));

        return {
          ...data,
          ideas: data.ideas.map((idea) => {
            const update = updatesMap.get(idea.id);
            return update ? { ...idea, ...update } : idea;
          }),
        };
      },
      { revalidate: false }
    );

    // 批量更新詳細頁快取
    updates.forEach((update) => {
      mutate(
        `/api/ideas/${update.id}`,
        (existingData: IdeaSchema | undefined) => {
          if (!existingData) return existingData;
          return { ...existingData, ...update };
        },
        { revalidate: false }
      );
    });
  }, [mutate]);

  /**
   * 清除所有 Ideas 相關的快取
   */
  const clearIdeasCache = useCallback(() => {
    mutate(
      (key) => typeof key === 'string' && (key.startsWith('/ideas') || key.startsWith('/api/ideas')),
      undefined,
      { revalidate: false }
    );
  }, [mutate]);

  /**
   * 重新驗證指定的快取
   * @param ideaId 可選，如果提供則只重新驗證該想法的快取
   */
  const revalidateIdeasCache = useCallback((ideaId?: string) => {
    if (ideaId) {
      // 重新驗證特定想法的快取
      mutate(`/api/ideas/${ideaId}`);
    } else {
      // 重新驗證所有 Ideas 快取
      mutate((key) => typeof key === 'string' && key.startsWith('/ideas'));
    }
  }, [mutate]);

  /**
   * 樂觀更新想法的點讚狀態
   * @param ideaId 想法 ID
   * @param isLiked 新的點讚狀態
   * @param likeDelta 點讚數變化量（+1 或 -1）
   */
  const optimisticUpdateLike = useCallback((ideaId: string, isLiked: boolean, likeDelta: number) => {
    // 特殊處理 likeCount 的增量更新
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/ideas'),
      (data: IdeaListResponseSchema | undefined) => {
        if (!data || !data.ideas) return data;

        return {
          ...data,
          ideas: data.ideas.map((idea) => (idea.id === ideaId
            ? {
              ...idea,
              isLiked,
              likeCount: Math.max(0, idea.likeCount + likeDelta),
            }
            : idea)),
        };
      },
      { revalidate: false }
    );

    // 更新詳細頁快取
    mutate(
      `/api/ideas/${ideaId}`,
      (existingData: IdeaSchema | undefined) => {
        if (!existingData) return existingData;
        return {
          ...existingData,
          isLiked,
          likeCount: Math.max(0, existingData.likeCount + likeDelta),
        };
      },
      { revalidate: false }
    );
  }, [mutate]);

  /**
   * 樂觀更新想法的瀏覽數
   * @param ideaId 想法 ID
   * @param viewDelta 瀏覽數增量（通常是 +1）
   */
  const optimisticUpdateViewCount = useCallback((ideaId: string, viewDelta: number = 1) => {
    updateIdeaInCache({
      id: ideaId,
      viewCount: viewDelta, // 實際會在 updateIdeaInCache 中處理增量
    });

    // 但對於 viewCount，我們需要特殊處理增量
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/ideas'),
      (data: IdeaListResponseSchema | undefined) => {
        if (!data || !data.ideas) return data;

        return {
          ...data,
          ideas: data.ideas.map((idea) => (idea.id === ideaId
            ? { ...idea, viewCount: idea.viewCount + viewDelta }
            : idea)),
        };
      },
      { revalidate: false }
    );

    mutate(
      `/api/ideas/${ideaId}`,
      (existingData: IdeaSchema | undefined) => {
        if (!existingData) return existingData;
        return { ...existingData, viewCount: existingData.viewCount + viewDelta };
      },
      { revalidate: false }
    );
  }, [mutate]);

  return {
    // 基本 CRUD 操作
    updateIdeaInCache,
    addIdeaToCache,
    removeIdeaFromCache,
    batchUpdateIdeasInCache,

    // 快取管理
    clearIdeasCache,
    revalidateIdeasCache,

    // 樂觀更新
    optimisticUpdateLike,
    optimisticUpdateViewCount,
  };
}
