"use client";

/** Learning timeline SWR hooks for client components. */

import { useEffect } from "react";
import { useInfinite, useQuery } from "../hooks";
import type { IGetMyTimelineParams } from "./timeline";

export const useMyTimeline = (params: IGetMyTimelineParams = {}) =>
  useQuery(
    "/api/v1/me/timeline",
    {
      params: { query: params },
    },
    { revalidateOnFocus: false }
  );

export const useAllMyTimeline = () => {
  const result = useInfinite(
    "/api/v1/me/timeline",
    (index, previousPage) => {
      if (previousPage && !previousPage.pagination.hasMore) return null;
      return {
        params: {
          query: {
            limit: 100,
            cursor: index === 0 ? undefined : (previousPage?.pagination.nextCursor ?? undefined),
          },
        },
      };
    },
    { revalidateOnFocus: false }
  );

  const lastPage = result.data?.at(-1);
  useEffect(() => {
    if (lastPage?.pagination.hasMore && !result.isValidating) {
      void result.setSize(result.size + 1);
    }
  }, [lastPage?.pagination.hasMore, result.isValidating, result.setSize, result.size]);

  return result;
};
