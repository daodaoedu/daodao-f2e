import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  createComment,
  CreateCommentRequest,
  deleteComment,
  getCommentEndpoint,
  updateComment,
  UpdateCommentRequest,
  CommentSchema,
  CommentType,
} from '@/services/comments';
import { HttpError } from '@/services/core';

export type CommentMutateKey =
  | [string, { targetType: CommentType; targetId: number }]
  | null;

interface UseCommentOptions {
  targetType?: CommentType;
  targetId?: number;
  id?: number;
  mutateKey?: CommentMutateKey;
  onCreated?: (data: CommentSchema) => void;
  onUpdated?: (data: CommentSchema) => void;
  onDeleted?: () => void;
}

type CreateCommentArg = Omit<CreateCommentRequest, 'targetType' | 'targetId'>;
type UpdateCommentArg = Omit<UpdateCommentRequest, 'targetType' | 'targetId'>;

export default function useComment({
  targetType,
  targetId,
  id,
  mutateKey,
  onCreated,
  onUpdated,
  onDeleted,
}: UseCommentOptions) {
  const swrKey: CommentMutateKey =
    id && targetId && targetType
      ? [getCommentEndpoint({ id }), { targetType, targetId }]
      : null;

  const { mutate, ...swr } = useSWR<Comment>(swrKey);

  const create = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateCommentArg }) => {
      if (!targetId || !targetType) {
        throw new HttpError(400, { message: '目標不存在' });
      }
      return createComment({ ...arg, targetType, targetId });
    },
    { onSuccess: onCreated }
  );

  const update = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateCommentArg }) => updateComment({ ...arg }),
    { onSuccess: onUpdated }
  );

  const remove = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: number }) => deleteComment(arg),
    { onSuccess: onDeleted }
  );

  return {
    ...swr,
    mutate,
    create,
    update,
    remove,
  };
}
