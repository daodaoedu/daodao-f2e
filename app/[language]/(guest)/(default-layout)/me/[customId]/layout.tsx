import { SWRConfig, unstable_serialize } from 'swr';
import { notFound } from 'next/navigation';
import {
  getApiV1UsersCustomIdCustomId,
  getGetApiV1UsersCustomIdCustomIdKey,
} from '@/api/users.server';
import { UserProfileWidget } from '@/widgets/user';

export default async function TabContentPage({
  params,
  children,
}: LayoutProps<'/[language]/me/[customId]'>) {
  const { customId } = await params;

  const userResponse = await getApiV1UsersCustomIdCustomId(customId);

  if (!userResponse.data) {
    notFound();
  }

  return (
    <SWRConfig
      value={{
        fallback: {
          [unstable_serialize(getGetApiV1UsersCustomIdCustomIdKey(customId))]:
            userResponse,
        },
      }}
    >
      <UserProfileWidget customId={customId}>{children}</UserProfileWidget>
    </SWRConfig>
  );
}
