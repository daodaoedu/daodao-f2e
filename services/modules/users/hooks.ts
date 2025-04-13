import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import useSWRMutation from 'swr/mutation';

import { PaginationResponseType } from '@/services/core';
import userAPI, { getUserPathname, UserMeQueryParams } from './api';
import { IUser, UserQuerySchema } from './schema';

export function useUsers(query: UserQuerySchema, pageSize = 10) {
  const swr = useSWRInfinite<PaginationResponseType<IUser>>(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.data?.length) return null;
      return [getUserPathname(), { ...query, page: pageIndex + 1, pageSize }];
    },
    { revalidateFirstPage: false }
  );

  const data = useMemo<IUser[] | undefined>(
    () =>
      Array.isArray(swr.data)
        ? swr.data?.flatMap((page) => page.data)
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

export function useUser(id?: string) {
  return useSWR<IUser>(id ? getUserPathname({ id }) : null);
}

export function useUserMe({ token, onSuccess, onError }: UserMeQueryParams) {
  return useSWR<{ data: IUser }>(
    token ? [getUserPathname({ isMe: true }), token] : null,
    { onSuccess: (data) => onSuccess?.(data.data), onError }
  );
}

interface UseUserMutationProps {
  onUpdated?: () => void;
}

export function useUserMutation({ onUpdated }: UseUserMutationProps = {}) {
  const updateMutation = useSWRMutation(getUserPathname(), userAPI.update, {
    onSuccess: onUpdated,
  });

  return {
    updateMutation,
  };
}
