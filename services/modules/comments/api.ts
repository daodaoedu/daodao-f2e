import {
  CommentSchema,
  CreateCommentSchema,
  UpdateCommentSchema,
} from '@/services/modules/comments/schema';
import { mutations } from '@/services/core';

const commentEndpoint = '/comments';

interface GetCommentKeyProps {
  id?: number;
}

export const getCommentEndpoint = ({ id }: GetCommentKeyProps = {}) => {
  if (id) {
    return `${commentEndpoint}/${id}`;
  }
  return commentEndpoint;
};

export default function generateCommentApi() {
  return {
    getEndpoint: getCommentEndpoint,

    create: (request: CreateCommentSchema) => {
      return mutations.post<CommentSchema>(getCommentEndpoint(), request);
    },

    update: ({ id, ...request }: UpdateCommentSchema) => {
      return mutations.put<CommentSchema>(getCommentEndpoint({ id }), request);
    },

    delete: (id: number) => {
      return mutations.delete(getCommentEndpoint({ id }));
    },
  };
}
