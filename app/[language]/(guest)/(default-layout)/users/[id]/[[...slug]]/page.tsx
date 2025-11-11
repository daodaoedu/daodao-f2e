import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { redirect } from '@/shared/i18n/navigation';
import {
  USER_PROFILE_TABS,
  UserProfileTab,
  USER_PROFILE_TAB_TITLES,
  DEFAULT_TAB,
} from '@/widgets/user';
import {
  parseUserId,
  getUserProfileBasePath,
  getUserData,
  UserIdObject,
} from '@/entities/user';

const isValidTabKey = (tabKey: string): tabKey is UserProfileTab =>
  USER_PROFILE_TABS.includes(tabKey as UserProfileTab);

const validateTabKey = async (
  userIdObject: UserIdObject,
  tabKey: string = DEFAULT_TAB
): Promise<UserProfileTab> => {
  const locale = await getLocale();
  return isValidTabKey(tabKey)
    ? tabKey
    : redirect({ href: getUserProfileBasePath(userIdObject), locale });
};

export const generateStaticParams = () =>
  USER_PROFILE_TABS.map((tabKey) => ({
    slug: [tabKey],
  }));

export async function generateMetadata({
  params,
}: PageProps<'/[language]/users/[id]/[[...slug]]'>): Promise<Metadata> {
  const { id, slug } = await params;
  const userIdObject = parseUserId(id);
  const tabKey = await validateTabKey(userIdObject, slug?.[0]);
  const [, userResponse] = await getUserData(userIdObject);
  const data = userResponse?.data?.data;
  const name = data?.name?.trim() || '未知用戶';
  const titleSuffix = USER_PROFILE_TAB_TITLES[tabKey];

  return {
    title: `${name}的${titleSuffix}`,
  };
}

export default async function TabContentPage({
  params,
}: PageProps<'/[language]/users/[id]/[[...slug]]'>) {
  const { id, slug } = await params;
  const userIdObject = parseUserId(id);
  const tabKey = await validateTabKey(userIdObject, slug?.[0]);

  switch (tabKey) {
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
      return null;
  }
}
