import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import commentAPI, { getCommentPathname, CommentSWRKey } from './api';
import { CommentType, CommentSchema } from './schema';

interface UseCommentListProps {
  targetType: CommentType;
  targetId: number | string;
  disableSearch?: boolean;
}

export function useComments({
  targetType,
  targetId,
  disableSearch,
}: UseCommentListProps) {
  const swrKey: CommentSWRKey = [
    getCommentPathname(),
    { targetType, targetId },
  ];

  const swr = useSWR<CommentSchema[]>(disableSearch ? null : swrKey);

  const createMutation = useSWRMutation(swrKey, commentAPI.create);

  const updateMutation = useSWRMutation(swrKey, commentAPI.update);

  const deleteMutation = useSWRMutation(swrKey, commentAPI.delete);

  return {
    ...swr,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
