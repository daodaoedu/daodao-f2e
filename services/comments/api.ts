import type { MutationFetcher } from "swr/mutation";

import { parseToString } from "@/utils/helper";
import { mutations } from "@/utils/http";
import {
  CommentType,
  CommentSchema,
  CreateCommentSchema,
  UpdateCommentSchema,
} from "./schema";

export type CommentSWRKey = [
  string,
  { targetType: CommentType; targetId: number }
];

interface GetCommentPathnameProps {
  id?: number;
}

export const getCommentPathname = ({ id }: GetCommentPathnameProps = {}) =>
  id ? `/comments/${parseToString(id)}` : "/comments";

interface CommentAPIType {
  create: MutationFetcher<
    CommentSchema,
    CommentSWRKey,
    Omit<CreateCommentSchema, "targetType" | "targetId">
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
