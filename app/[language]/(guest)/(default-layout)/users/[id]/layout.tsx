import { parseUserId, getUserData, getUserDataKey } from '@/entities/user';
import { UserProfileWidget } from '@/widgets/user';
import { notFound } from 'next/navigation';
import { SWRConfig, unstable_serialize } from 'swr';

export default async function UsersLayout({
  params,
  children,
}: LayoutProps<'/[language]/users/[id]'>) {
  const { id } = await params;
  const { type, actualId } = parseUserId(id);
  const userResponse = await getUserData(type, actualId);

  if (!userResponse.data) {
    notFound();
  }

  const swrKey = getUserDataKey(type, actualId);

  return (
    <SWRConfig
      value={{
        fallback: {
          [unstable_serialize(swrKey)]: userResponse,
        },
      }}
    >
      <UserProfileWidget type={type} id={actualId}>
        {children}
      </UserProfileWidget>
    </SWRConfig>
  );
}
