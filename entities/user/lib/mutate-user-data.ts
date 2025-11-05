import { mutate } from 'swr';
import {
  getGetApiV1UsersCustomIdCustomIdKey,
  getGetApiV1UsersIdKey,
} from '@/generated/api/users.client';
import type { UserIdObject } from '../model';

export const mutateUserData = async (userIdObject: UserIdObject) => {
  const { customId, id } = userIdObject;
  await Promise.all([
    mutate(getGetApiV1UsersIdKey(id)),
    mutate(getGetApiV1UsersCustomIdCustomIdKey(customId ?? '')),
  ]);
};
