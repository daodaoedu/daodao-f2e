'use client';

import {
  useGetApiV1UsersId,
  useGetApiV1UsersCustomIdCustomId,
} from '@/api/users.client';
import { UserIdObject } from '@/entities/user';

export const useUserData = (userIdObject: UserIdObject) => {
  const { customId, id } = userIdObject;
  const resultByUserId = useGetApiV1UsersId(customId ? '' : id);
  const resultByCustomId = useGetApiV1UsersCustomIdCustomId(customId ?? '');

  return customId ? resultByCustomId : resultByUserId;
};
