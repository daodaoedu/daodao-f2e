import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite, {
  unstable_serialize as infinite_unstable_serialize,
} from 'swr/infinite';
import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';

import {
  circleAPI,
  getCirclePathname,
  refetchCircle,
  CircleSchema,
  CircleSearchParamsSchema,
  CircleDetailResponseSchema,
  CircleListResponseSchema,
  formatCircleData,
} from '@/services/circles';

export const getCircleInfiniteKey = (query: CircleSearchParamsSchema, pageSize: number = 6) => (pageIndex: number, previousPageData: CircleListResponseSchema | null) => {
  if (previousPageData && !previousPageData.data?.length) return null;
  return [getCirclePathname(), { ...query, page: pageIndex + 1, pageSize }];
};

export const getSerializeCircleInfiniteKey = (
  query: CircleSearchParamsSchema,
  pageSize: number = 6
) => infinite_unstable_serialize(getCircleInfiniteKey(query, pageSize));

export function useCircleList(query: CircleSearchParamsSchema, pageSize = 6) {
  const swr = useSWRInfinite<CircleListResponseSchema>(
    getCircleInfiniteKey(query, pageSize),
    { revalidateFirstPage: false }
  );

  const data = useMemo<CircleSchema[]>(
    () => swr.data?.flatMap?.((page) => page.data).map(formatCircleData) ?? [],
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

export function useCircle(id?: string | null) {
  const { data, ...rest } = useSWR<CircleDetailResponseSchema>(
    id ? getCirclePathname({ id }) : null
  );

  return {
    ...rest,
    data: data?.data?.[0] ? formatCircleData(data.data[0]) : undefined,
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
}: SWRMutationOptions = {}) => useSWRMutation(getCirclePathname(), circleAPI.create, {
  ...options,
  onSuccess: (data, key, config) => {
    onSuccess?.(data, key, config);
    refetchCircle();
  },
});

export const useUpdateCircle = (
  id?: string | null,
  { onSuccess, ...options }: SWRMutationOptions = {}
) => useSWRMutation(
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

export const useDeleteCircle = (
  id: string,
  {
    onSuccess,
    ...options
  }: SWRMutationConfiguration<void, Error, string | null> = {}
) => useSWRMutation(
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
