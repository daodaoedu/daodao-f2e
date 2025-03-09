import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { HttpError } from '@/services/core';
import {
  CommentType,
  CommentSchema,
  CreateCommentSchema,
  UpdateCommentSchema,
} from '@/services/modules/comments/schema';

import generateCommentApi from './api';

interface UseCommentListOptions {
  targetType?: CommentType;
  targetId?: number;
  disableSearch?: boolean;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

type CreateCommentArg = Omit<CreateCommentSchema, 'targetType' | 'targetId'>;
type UpdateCommentArg = Omit<UpdateCommentSchema, 'targetType' | 'targetId'>;

export default function useCommentService({
  targetType,
  targetId,
  disableSearch,
  onCreated,
  onUpdated,
  onDeleted,
}: UseCommentListOptions) {
  const commentApi = useMemo(generateCommentApi, []);

  const swrKey =
    targetId && targetType
      ? [commentApi.getEndpoint(), { targetType, targetId }]
      : null;

  const swr = useSWR<CommentSchema[]>(disableSearch ? null : swrKey);

  const createMutation = useSWRMutation(
    swrKey,
    (_, { arg }: { arg: CreateCommentArg }) => {
      if (!targetId || !targetType) {
        throw new HttpError(400, { message: '目標不存在' });
      }
      return commentApi.create({ ...arg, targetType, targetId });
    },
    { onSuccess: onCreated }
  );

  const updateMutation = useSWRMutation(
    swrKey,
    (_, { arg }: { arg: UpdateCommentArg }) => commentApi.update(arg),
    { onSuccess: onUpdated }
  );

  const deleteMutation = useSWRMutation(
    swrKey,
    (_, { arg }: { arg: number }) => commentApi.delete(arg),
    { onSuccess: onDeleted }
  );

  return {
    ...swr,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
