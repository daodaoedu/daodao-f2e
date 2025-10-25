import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getApiV1UsersCustomIdCustomId } from '@/api/users.server';
import { UserDetailWidget } from '@/widgets/user';

const tabKeys = [
  'profile',
  'projects',
  'practices',
  'ideas',
  'circles',
  'resources',
] as const;

export async function generateStaticParams() {
  return tabKeys.map((tabKey) => ({
    slug: [tabKey],
  }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[language]/me/[customId]/[[...slug]]'>): Promise<Metadata> {
  const { customId, slug } = await params;
  const { data } = await getApiV1UsersCustomIdCustomId(customId);
  const tabKey = slug?.[0] ?? 'profile';
  const prefix = data?.name ?? '未知用戶';

  switch (tabKey) {
    case 'profile':
      return {
        title: `${prefix}的個人名片`,
      };
    case 'projects':
      return {
        title: `${prefix}的學習計劃`,
      };
    case 'practices':
      return {
        title: `${prefix}的主題實踐`,
      };
    case 'ideas':
      return {
        title: `${prefix}的想法`,
      };
    case 'circles':
      return {
        title: `${prefix}的揪團`,
      };
    case 'resources':
      return {
        title: `${prefix}的資源`,
      };
    default:
      return redirect(`/me/${customId}`);
  }
}

export default async function TabContentPage({
  params,
}: PageProps<'/[language]/me/[customId]/[[...slug]]'>) {
  const { customId, slug } = await params;
  const tabKey = slug?.[0] ?? 'profile';

  switch (tabKey) {
    case 'profile':
      return <UserDetailWidget customId={customId} />;
    case 'projects':
      return <div>學習計劃</div>;
    case 'practices':
      return <div>主題實踐</div>;
    case 'ideas':
      return <div>想法</div>;
    case 'circles':
      return <div>揪團</div>;
    case 'resources':
      return <div>資源</div>;
    default:
      redirect(`/me/${customId}`);
  }
}
