'use client';

import {
  useGetApiV1UsersId,
  useGetApiV1UsersCustomIdCustomId,
} from '@/generated/api/users.client';

interface UseUserDataProps {
  type: 'userId' | 'customId';
  id: string;
}

export const useUserData = ({ type, id }: UseUserDataProps) => {
  const userId = type === 'userId' ? id : '';
  const customId = type === 'customId' ? id : '';
  const resultByUserId = useGetApiV1UsersId(userId);
  const resultByCustomId = useGetApiV1UsersCustomIdCustomId(customId);

  return type === 'userId' ? resultByUserId : resultByCustomId;
};
