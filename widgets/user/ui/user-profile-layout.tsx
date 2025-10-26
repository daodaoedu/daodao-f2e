import { ReactNode } from 'react';
import { SWRConfig, unstable_serialize } from 'swr';
import { notFound } from 'next/navigation';
import { getUserData, getUserDataKey } from '@/entities/user';
import { UserProfileWidget } from './user-profile-widget';
import type { UserIdentifierType } from '../model/user-profile';

interface UserProfileLayoutProps {
  type: UserIdentifierType;
  id: string;
  children: ReactNode;
}

export const UserProfileLayout = async ({
  type,
  id,
  children,
}: UserProfileLayoutProps) => {
  const userResponse = await getUserData(type, id);

  if (!userResponse.data) {
    notFound();
  }

  const swrKey = getUserDataKey(type, id);

  return (
    <SWRConfig
      value={{
        fallback: {
          [unstable_serialize(swrKey)]: userResponse,
        },
      }}
    >
      <UserProfileWidget type={type} id={id}>
        {children}
      </UserProfileWidget>
    </SWRConfig>
  );
};
