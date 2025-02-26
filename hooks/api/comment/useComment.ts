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
import { HttpError } from '@/services/httpClient';

export type CommentMutateKey =
  | [string, { targetType: CommentType; targetId: number }]
  | null;

interface UseCommentOptions {
  targetType: CommentType;
  targetId?: number;
  id?: number;
  mutateKey?: CommentMutateKey;
  onCreated?: (data: CommentSchema) => void;
  onUpdated?: (data: CommentSchema) => void;
  onDeleted?: () => void;
}

export default function useComment({
  targetType,
  targetId,
  id,
  mutateKey,
  onCreated,
  onUpdated,
  onDeleted,
}: UseCommentOptions) {
  const swrKey: CommentMutateKey = id && targetId
    ? [getCommentEndpoint({ id }), { targetType, targetId }]
    : null;

  const { mutate, ...swr } = useSWR<Comment>(swrKey);

  const create = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateCommentRequest }) => {
      if (!targetId) {
        throw new HttpError(400, { message: '目標不存在' });
      }
      return createComment({ ...arg, targetType, targetId });
    },
    { onSuccess: onCreated }
  );

  const update = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateCommentRequest }) => updateComment({ ...arg }),
    { onSuccess: onUpdated }
  );

  const remove = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: { id: number } }) => deleteComment(arg.id),
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
