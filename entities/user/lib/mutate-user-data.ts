import { mutate } from 'swr';
import {
  getGetApiV1UsersCustomIdCustomIdKey,
  getGetApiV1UsersIdKey,
} from '@/api/users.client';
import { UserIdObject } from './user-profile-utils';

export const mutateUserData = async (userIdObject: UserIdObject) => {
  const { customId, id } = userIdObject;
  await Promise.all([
    mutate(getGetApiV1UsersIdKey(id)),
    mutate(getGetApiV1UsersCustomIdCustomIdKey(customId ?? '')),
  ]);
};
