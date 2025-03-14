import type { MutationFetcher } from 'swr/mutation';

import { apiPaths, mutations } from '@/services/core';
import {
  CommentType,
  CommentSchema,
  CreateCommentSchema,
  UpdateCommentSchema,
} from './schema';

export type CommentSWRKey = [
  string,
  { targetType: CommentType; targetId: number }
];

interface GetCommentPathnameProps {
  id?: number;
}

export const getCommentPathname = ({ id }: GetCommentPathnameProps = {}) =>
  apiPaths.comments(id).toString();

interface CommentAPIType {
  create: MutationFetcher<
    CommentSchema,
    CommentSWRKey,
    Omit<CreateCommentSchema, 'targetType' | 'targetId'>
  >;
  update: MutationFetcher<CommentSchema, CommentSWRKey, UpdateCommentSchema>;
  delete: MutationFetcher<void, CommentSWRKey, { id: number }>;
}

const commentAPI: CommentAPIType = {
  create: ([, target], { arg }) =>
    mutations.post<CommentSchema>(getCommentPathname(), { ...target, ...arg }),

  update: (_, { arg: { id, ...arg } }) =>
    mutations.put<CommentSchema>(getCommentPathname({ id }), arg),

  delete: (_, { arg }) => mutations.delete<void>(getCommentPathname(arg)),
};

export default commentAPI;
