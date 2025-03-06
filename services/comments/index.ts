import { z } from 'zod';
import { mutations } from '../httpClient';
import { baseUserSchema } from '../users';

const commentEndpoint = '/comments';

interface GetCommentKeyProps {
  id?: number;
}

export enum CommentType {
  Note = 'note',
  Outcome = 'outcome',
  Review = 'review',
  Idea = 'idea',
}

export enum CommentVisibility {
  Public = 'public',
  Private = 'private',
}

export const getCommentEndpoint = ({ id }: GetCommentKeyProps = {}) => {
  if (id) {
    return `${commentEndpoint}/${id}`;
  }
  return commentEndpoint;
};

const baseCommentSchema = z.object({
  id: z.number(),
  content: z.string(),
  visibility: z.nativeEnum(CommentVisibility),
  parentId: z.number().nullable().optional(),
  user: baseUserSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CommentSchema = z.infer<typeof baseCommentSchema> & {
  replies: CommentSchema[];
};

export const commentSchema: z.ZodType<CommentSchema> = baseCommentSchema.extend(
  {
    replies: z.lazy(() => commentSchema.array()),
  }
);

export const createCommentSchema = baseCommentSchema
  .extend({
    targetType: z.nativeEnum(CommentType),
    targetId: z.number(),
  })
  .omit({
    id: true,
    user: true,
    createdAt: true,
    updatedAt: true,
  });

export type CreateCommentRequest = z.infer<typeof createCommentSchema>;

export const createComment = (request: CreateCommentRequest) => {
  return mutations.post<CommentSchema>(getCommentEndpoint(), request);
};

export const updateCommentSchema = baseCommentSchema.omit({
  parentId: true,
  user: true,
  createdAt: true,
  updatedAt: true,
});

export type UpdateCommentRequest = z.infer<typeof updateCommentSchema>;

export const updateComment = ({ id, ...Comment }: UpdateCommentRequest) => {
  return mutations.put<CommentSchema>(getCommentEndpoint({ id }), Comment);
};

export const deleteComment = (id: number) => {
  return mutations.delete(getCommentEndpoint({ id }));
};
