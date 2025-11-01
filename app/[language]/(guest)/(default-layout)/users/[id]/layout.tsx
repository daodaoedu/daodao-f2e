import { parseUserId, getUserData, getUserDataKey } from '@/entities/user';
import { UserProfileWidget } from '@/widgets/user';
import { notFound } from 'next/navigation';
import { SWRConfig, unstable_serialize } from 'swr';

export default async function UsersLayout({
  params,
  children,
}: LayoutProps<'/[language]/users/[id]'>) {
  const { id } = await params;
  const userIdObject = parseUserId(id);
  const userResponse = await getUserData(userIdObject);

  if (!userResponse.data) {
    notFound();
  }

  const swrKey = getUserDataKey(userIdObject);

  return (
    <SWRConfig
      value={{
        fallback: {
          [unstable_serialize(swrKey)]: userResponse,
        },
      }}
    >
      <UserProfileWidget userIdObject={userIdObject}>
        {children}
      </UserProfileWidget>
    </SWRConfig>
  );
}
