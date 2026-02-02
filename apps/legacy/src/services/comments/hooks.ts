import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { fetcher } from "@/shared/lib/http";
import commentAPI, { type CommentSWRKey, getCommentPathname } from "./api";
import type { CommentSchema, CommentType } from "./schema";

interface UseCommentListProps {
  targetType: CommentType;
  targetId: string | number;
  disableSearch?: boolean;
}

export function useComments({ targetType, targetId, disableSearch }: UseCommentListProps) {
  const swrKey: CommentSWRKey = [getCommentPathname(), { targetType, targetId: String(targetId) }];

  const swr = useSWR<{ success: boolean; data: CommentSchema[] }>(
    disableSearch ? null : swrKey,
    fetcher,
    {
      onSuccess: (response) => {
        console.log("Comments fetched:", response);
      },
    }
  );

  const createMutation = useSWRMutation(swrKey, commentAPI.create);

  const updateMutation = useSWRMutation(swrKey, commentAPI.update);

  const deleteMutation = useSWRMutation(swrKey, commentAPI.delete);

  return {
    ...swr,
    data: swr.data?.data,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
