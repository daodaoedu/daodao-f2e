import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import useSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';

import { PaginationResponseType } from '@/utils/http';
import {
  getUserPathname,
  refetchUsers,
  UserSchema,
  UserQuerySchema,
  userAPI,
  CreateUserResponse,
} from '@/services/users';
import { useAuthDispatch } from '@/features/auth';

export function useUserList(query: UserQuerySchema, pageSize = 10) {
  const swr = useSWRInfinite<PaginationResponseType<UserSchema>>(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.data?.length) return null;
      return [getUserPathname(), { ...query, page: pageIndex + 1, pageSize }];
    },
    { revalidateFirstPage: false }
  );

  const data = useMemo<UserSchema[] | undefined>(
    () => (Array.isArray(swr.data)
      ? swr.data?.flatMap((page) => page.data)
      : undefined),
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
  const { data, ...swr } = useSWR<{ data: UserSchema[] }>(
    id ? getUserPathname({ id }) : null
  );
  return {
    ...swr,
    data: data?.data?.[0],
  };
}

export interface UseUserMeProps {
  token: string | null;
  onSuccess?: (user: UserSchema) => void;
  onError?: (error: Error) => void;
}

export function useUserMe({ token, onSuccess, onError }: UseUserMeProps) {
  return useSWR<{ data: UserSchema }>(
    token ? [getUserPathname({ isMe: true }), token] : null,
    { onSuccess: (data) => onSuccess?.(data.data), onError }
  );
}

export const useCreateUser = ({
  onSuccess,
  ...options
}: SWRMutationConfiguration<CreateUserResponse, Error, string> = {}) => {
  const { setToken } = useAuthDispatch();
  return useSWRMutation(getUserPathname(), userAPI.create, {
    ...options,
    onSuccess: (data, key, config) => {
      setToken(data.token);
      onSuccess?.(data, key, config);
      refetchUsers();
    },
  });
};

export const useUpdateResource = (
  id?: string | null,
  {
    onSuccess,
    ...options
  }: SWRMutationConfiguration<UserSchema, Error, string | null> = {}
) => useSWRMutation(id ? getUserPathname({ id }) : null, userAPI.update, {
  ...options,
  onSuccess: (data, key, config) => {
    onSuccess?.(data, key, config);
    refetchUsers();
  },
});
