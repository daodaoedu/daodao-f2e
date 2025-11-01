'use client';

import {
  useGetApiV1UsersId,
  useGetApiV1UsersCustomIdCustomId,
  getGetApiV1UsersIdKey,
  getGetApiV1UsersCustomIdCustomIdKey,
} from '@/api/users.client';
import { UserIdObject } from '@/entities/user';
import { mutate } from 'swr';

export const useUserData = (userIdObject: UserIdObject) => {
  const { customId, id } = userIdObject;
  const resultByUserId = useGetApiV1UsersId(customId ? '' : id);
  const resultByCustomId = useGetApiV1UsersCustomIdCustomId(customId ?? '');

  return customId ? resultByCustomId : resultByUserId;
};

export const mutateUserData = async (userIdObject: UserIdObject) => {
  const { customId, id } = userIdObject;
  await Promise.all([
    mutate(getGetApiV1UsersIdKey(id)),
    mutate(getGetApiV1UsersCustomIdCustomIdKey(customId ?? '')),
  ]);
};
