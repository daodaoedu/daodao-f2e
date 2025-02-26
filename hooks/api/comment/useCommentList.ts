import useSWR from 'swr';
import {
  getCommentEndpoint,
  CommentSchema,
  CommentType,
} from '@/services/comments';

import useComment, { CommentMutateKey } from './useComment';

interface UseCommentListOptions {
  targetType: CommentType;
  targetId?: number;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useCommentList({
  targetType,
  targetId,
  onCreated,
  onUpdated,
  onDeleted,
}: UseCommentListOptions) {
  const swrKey: CommentMutateKey = targetId
    ? [getCommentEndpoint(), { targetType, targetId }]
    : null;

  const { mutate, ...swr } = useSWR<CommentSchema[]>(swrKey);

  const mutations = useComment({
    mutateKey: swrKey,
    targetType,
    targetId,
    onCreated,
    onUpdated,
    onDeleted,
  });

  return {
    ...mutations,
    ...swr,
    mutate,
  };
}
