import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { IdeaSchema, UpdateIdeaSchema, DeleteIdeaSchema } from '@/services/modules/ideas/schema';
import ideaAPI from '@/services/modules/ideas/api';

interface UseIdeaProps {
  ideaId: string;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

interface UseIdeaResult {
  data?: IdeaSchema;
  isLoading: boolean;
  error: string | null;
  mutate: () => void;
  update: {
    trigger: (data: UpdateIdeaSchema) => Promise<IdeaSchema>;
    isMutating: boolean;
    error: string | null;
  };
  remove: {
    trigger: (data: { ideaId: string }) => Promise<void>;
    isMutating: boolean;
    error: string | null;
  };
}

export const useIdea = ({
  ideaId,
  onUpdated,
  onDeleted,
}: UseIdeaProps): UseIdeaResult => {
  // SWR Key for this specific idea
  const swrKey = useMemo(() => {
    return ideaId ? `idea-${ideaId}` : null;
  }, [ideaId]);

  // 獲取單個 Idea 資料
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<IdeaSchema>(
    swrKey,
    async () => {
      if (!ideaId) throw new Error('Idea ID is required');
      return ideaAPI.getById(ideaId);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // 更新 Idea 的 mutation
  const updateMutation = useSWRMutation(
    swrKey,
    ideaAPI.update,
    {
      onSuccess: (updatedIdea) => {
        // 更新本地快取
        mutate(updatedIdea, false);
        onUpdated?.();
      },
      onError: (err: Error) => {
        console.error('更新 Idea 失敗:', err);
      },
    }
  );

  // 刪除 Idea 的 mutation
  const deleteMutation = useSWRMutation(
    swrKey,
    ideaAPI.delete,
    {
      onSuccess: () => {
        // 清除本地快取
        mutate(undefined, false);
        onDeleted?.();
      },
      onError: (err: Error) => {
        console.error('刪除 Idea 失敗:', err);
      },
    }
  );

  return {
    data,
    isLoading,
    error,
    mutate,
    update: {
      trigger: updateMutation.trigger,
      isMutating: updateMutation.isMutating,
      error: updateMutation.error?.message || null,
    },
    remove: {
      trigger: (ideaData: { ideaId: string }) =>
        deleteMutation.trigger({ id: ideaData.ideaId } as DeleteIdeaSchema),
      isMutating: deleteMutation.isMutating,
      error: deleteMutation.error?.message || null,
    },
  };
};

export default useIdea;
