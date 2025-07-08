import { useMemo } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import useSWRMutation, { SWRMutationConfiguration } from "swr/mutation";

import {
  circleAPI,
  getCirclePathname,
  refetchCircle,
  CircleSchema,
  CircleSearchParamsSchema,
  CircleDetailResponseSchema,
  CircleListResponseSchema,
} from "@/services/circle";

export function useCircleList(query: CircleSearchParamsSchema, pageSize = 6) {
  const swr = useSWRInfinite<CircleListResponseSchema>(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.data?.length) return null;
      return [getCirclePathname(), { ...query, page: pageIndex + 1, pageSize }];
    },
    { revalidateFirstPage: false }
  );

  const data = useMemo<CircleSchema[]>(
    () => swr.data?.flatMap((page) => page.data) ?? [],
    [swr.data]
  );

  const lastPage = swr.data?.[swr.data.length - 1];

  const hasMore = lastPage
    ? lastPage?.page * lastPage?.pageSize < lastPage?.totalCount
    : false;

  return {
    ...swr,
    data,
    hasMore,
  };
}

export function useCircle(id?: string) {
  const { data, ...rest } = useSWR<CircleDetailResponseSchema>(
    id ? getCirclePathname({ id }) : null
  );

  return {
    ...rest,
    data: data?.data?.[0],
  };
}

type SWRMutationOptions = SWRMutationConfiguration<
  CircleSchema,
  Error,
  string | null
>;

export const useCreateCircle = ({
  onSuccess,
  ...options
}: SWRMutationOptions = {}) => {
  return useSWRMutation(getCirclePathname(), circleAPI.create, {
    ...options,
    onSuccess: (data, key, config) => {
      onSuccess?.(data, key, config);
      refetchCircle();
    },
  });
};

export const useUpdateResource = (
  id?: string | null,
  { onSuccess, ...options }: SWRMutationOptions = {}
) => {
  return useSWRMutation(
    id ? getCirclePathname({ id }) : null,
    circleAPI.update,
    {
      ...options,
      onSuccess: (data, key, config) => {
        onSuccess?.(data, key, config);
        refetchCircle();
      },
    }
  );
};

export const useDeleteCircle = (
  id: string,
  {
    onSuccess,
    ...options
  }: SWRMutationConfiguration<void, Error, string | null> = {}
) => {
  return useSWRMutation(
    id ? getCirclePathname({ id }) : null,
    circleAPI.delete,
    {
      ...options,
      onSuccess: (data, key, config) => {
        onSuccess?.(data, key, config);
        refetchCircle();
      },
    }
  );
};
