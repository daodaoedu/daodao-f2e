import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import useSWRMutation from 'swr/mutation';

import { PaginationResponseType } from '@/utils/http';
import circleAPI, { getCirclePathname } from './api';
import { CircleSchema, CircleQuerySchema } from './schema';

const formatCircleData = (data: CircleSchema): CircleSchema => {
  return {
    ...data,
    content: data.content || data.description || '',
  };
};

export function useCircles(query: CircleQuerySchema, pageSize = 6) {
  const swr = useSWRInfinite<PaginationResponseType<CircleSchema>>(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.data?.length) return null;
      return [getCirclePathname(), { ...query, page: pageIndex + 1, pageSize }];
    },
    { revalidateFirstPage: false }
  );

  const data = useMemo<CircleSchema[] | undefined>(
    () =>
      Array.isArray(swr.data)
        ? swr.data?.flatMap((page) => page.data.map(formatCircleData))
        : undefined,
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
  const { data, ...rest } = useSWR<CircleSchema>(
    id ? getCirclePathname({ id }) : null
  );

  return {
    ...rest,
    data: data ? formatCircleData(data) : undefined,
  };
}

interface UseCircleMutationProps {
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export function useCircleMutation({
  onCreated,
  onUpdated,
  onDeleted,
}: UseCircleMutationProps = {}) {
  const createMutation = useSWRMutation(getCirclePathname(), circleAPI.create, {
    onSuccess: onCreated,
  });

  const updateMutation = useSWRMutation(getCirclePathname(), circleAPI.update, {
    onSuccess: onUpdated,
  });

  const deleteMutation = useSWRMutation(getCirclePathname(), circleAPI.delete, {
    onSuccess: onDeleted,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
