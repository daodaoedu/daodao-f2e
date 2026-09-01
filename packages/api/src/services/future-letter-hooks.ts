"use client";

/** Future letter SWR hooks for client components. */

import { useEffect } from "react";
import { useInfinite, useQuery } from "../hooks";
import type { IGetMyFutureLettersParams } from "./future-letter";

export const useMyFutureLetters = (params: IGetMyFutureLettersParams = {}) =>
  useQuery(
    "/api/v1/me/future-letters",
    {
      params: { query: params },
    },
    { revalidateOnFocus: false }
  );

export const useAllMyFutureLetters = () => {
  const result = useInfinite(
    "/api/v1/me/future-letters",
    (index, previousPage) => {
      if (previousPage && !previousPage.pagination.hasNext) return null;
      return { params: { query: { page: index + 1, limit: 100 } } };
    },
    { revalidateOnFocus: false }
  );

  const lastPage = result.data?.at(-1);
  useEffect(() => {
    if (lastPage?.pagination.hasNext && !result.isValidating) {
      void result.setSize(result.size + 1);
    }
  }, [lastPage?.pagination.hasNext, result.isValidating, result.setSize, result.size]);

  return result;
};

export const useFutureLetter = (id: string | undefined) =>
  useQuery(
    "/api/v1/me/future-letters/{id}",
    id
      ? {
          params: { path: { id } },
        }
      : null,
    { revalidateOnFocus: false }
  );
