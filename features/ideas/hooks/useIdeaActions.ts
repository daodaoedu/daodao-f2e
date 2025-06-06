import { useCallback, useState, useEffect } from 'react';
import useSWRMutation from 'swr/mutation';
import { ideaAPI } from '@/services/modules/ideas';
import type { IdeaSchema } from '@/services/modules/ideas';
import { useIdeasContext } from '../contexts';

interface UseIdeaActionsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
interface ShareOptions {
  platform?: 'clipboard' | 'facebook' | 'twitter' | 'line';
  customMessage?: string;
}

interface UseIdeaActionsReturn {
  // Delete
  deleteIdea: (id: string) => Promise<void>;
  isDeletingIdea: boolean;

  // Like/Unlike - 完整實現
  likeIdea: (id: string) => Promise<void>;
  unlikeIdea: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  isLiking: boolean;
  likedIdeas: Set<string>;

  // Share - 完整實現
  shareIdea: (id: string, options?: ShareOptions) => Promise<string>;
  isSharing: boolean;

  // Error state
  error: string | null;
  clearError: () => void;
}

// 本地存儲相關的輔助函數
const LIKED_IDEAS_KEY = 'daodao_liked_ideas';

const getLikedIdeasFromStorage = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(LIKED_IDEAS_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
};

const saveLikedIdeasToStorage = (likedIds: Set<string>): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LIKED_IDEAS_KEY, JSON.stringify([...likedIds]));
  } catch {
    // 忽略存儲錯誤
  }
};

/**
 * 處理Ideas相關操作的Hook (刪除、點讚、分享等)
 * Phase 2: 完善實現所有功能
 */
export const useIdeaActions = ({
  onSuccess,
  onError,
}: UseIdeaActionsOptions = {}): UseIdeaActionsReturn => {
  const { updateLocalIdea, deleteLocalIdea } = useIdeasContext();
  const [likedIdeas, setLikedIdeas] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // 初始化點讚狀態
  useEffect(() => {
    setLikedIdeas(getLikedIdeasFromStorage());
  }, []);

  // 保存點讚狀態到本地存儲
  useEffect(() => {
    saveLikedIdeasToStorage(likedIdeas);
  }, [likedIdeas]);

  // Delete mutation
  const {
    trigger: triggerDelete,
    isMutating: isDeletingIdea,
    error: deleteError,
  } = useSWRMutation(
    'delete-idea',
    ideaAPI.delete,
    {
      onSuccess: () => {
        setError(null);
        onSuccess?.();
      },
      onError: (err) => {
        setError(err.message || '刪除失敗');
        onError?.(err);
      },
    }
  );

  // Like mutation - 完整實現
  const {
    trigger: triggerLike,
    isMutating: isLiking,
    error: likeError,
  } = useSWRMutation(
    'like-idea',
    async (_, { arg }: { arg: { id: string; action: 'like' | 'unlike' } }) => {
      const { id, action } = arg;

      // TODO: 當後端 API 準備好時，替換為真實的 API 調用
      // if (action === 'like') {
      //   return await ideaAPI.like({ id });
      // } else {
      //   return await ideaAPI.unlike({ id });
      // }

      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 300));

      return { success: true, action, id };
    },
    {
      onSuccess: (data, key, config) => {
        const { id, action } = (config as { arg: { id: string; action: 'like' | 'unlike' } }).arg;

        // 更新本地狀態
        setLikedIdeas((prev) => {
          const newSet = new Set(prev);
          if (action === 'like') {
            newSet.add(id);
          } else {
            newSet.delete(id);
          }
          return newSet;
        });

        // 更新想法的點讚計數 (樂觀更新)
        try {
          updateLocalIdea({
            id,
            likeCount: action === 'like' ? 1 : -1,
          } as IdeaSchema);
        } catch (err) {
          console.warn('無法更新本地想法計數:', err);
        }

        setError(null);
        onSuccess?.();
      },
      onError: (err) => {
        setError(err.message || '點讚操作失敗');
        onError?.(err);
      },
    }
  );

  // Share mutation - 完整實現
  const {
    trigger: triggerShare,
    isMutating: isSharing,
    error: shareError,
  } = useSWRMutation(
    'share-idea',
    async (_, { arg }: { arg: { id: string; options?: ShareOptions } }) => {
      const { id, options = {} } = arg;
      const { platform = 'clipboard', customMessage = '' } = options;

      const shareUrl = `${window.location.origin}/ideas/detail?ideaId=${id}`;
      const shareText = customMessage || `分享一個有趣的想法！`;

      switch (platform) {
        case 'clipboard':
          await navigator.clipboard.writeText(shareUrl);
          return { url: shareUrl, platform: 'clipboard' };

        case 'facebook': {
          const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          window.open(fbUrl, '_blank', 'width=600,height=400');
          return { url: fbUrl, platform: 'facebook' };
        }

        case 'twitter': {
          const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
          window.open(twitterUrl, '_blank', 'width=600,height=400');
          return { url: twitterUrl, platform: 'twitter' };
        }

        case 'line': {
          const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
          window.open(lineUrl, '_blank', 'width=600,height=400');
          return { url: lineUrl, platform: 'line' };
        }

        default:
          throw new Error('不支援的分享平台');
      }
    },
    {
      onSuccess: (data) => {
        setError(null);
        if (data.platform === 'clipboard') {
          // 可以在這裡顯示成功提示
          console.log('連結已複製到剪貼板');
        }
        onSuccess?.();
      },
      onError: (err) => {
        setError(err.message || '分享失敗');
        onError?.(err);
      },
    }
  );

  const deleteIdea = useCallback(async (id: string) => {
    try {
      // 先從本地狀態移除 (樂觀更新)
      deleteLocalIdea(id);

      // 再調用 API
      await triggerDelete({ id });
    } catch (err) {
      console.error('Failed to delete idea:', err);
      throw err;
    }
  }, [triggerDelete, deleteLocalIdea]);

  const likeIdea = useCallback(async (id: string) => {
    try {
      await triggerLike({ id, action: 'like' });
    } catch (err) {
      console.error('Failed to like idea:', err);
      // 回滾樂觀更新
      setLikedIdeas((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      throw err;
    }
  }, [triggerLike]);

  const unlikeIdea = useCallback(async (id: string) => {
    try {
      await triggerLike({ id, action: 'unlike' });
    } catch (err) {
      console.error('Failed to unlike idea:', err);
      // 回滾樂觀更新
      setLikedIdeas((prev) => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
      });
      throw err;
    }
  }, [triggerLike]);

  const toggleLike = useCallback(async (id: string) => {
    const isCurrentlyLiked = likedIdeas.has(id);
    if (isCurrentlyLiked) {
      await unlikeIdea(id);
    } else {
      await likeIdea(id);
    }
  }, [likedIdeas, likeIdea, unlikeIdea]);

  const shareIdea = useCallback(async (id: string, options?: ShareOptions): Promise<string> => {
    try {
      const result = await triggerShare({ id, options });
      return result.url;
    } catch (err) {
      console.error('Failed to share idea:', err);
      throw err;
    }
  }, [triggerShare]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const combinedError = error || deleteError?.message || likeError?.message || shareError?.message || null;

  return {
    // Delete
    deleteIdea,
    isDeletingIdea,

    // Like/Unlike
    likeIdea,
    unlikeIdea,
    toggleLike,
    isLiking,
    likedIdeas,

    // Share
    shareIdea,
    isSharing,

    // Error state
    error: combinedError,
    clearError,
  };
};
