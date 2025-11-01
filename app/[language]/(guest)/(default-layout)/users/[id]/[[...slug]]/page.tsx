import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  USER_PROFILE_TABS,
  UserProfileTab,
  USER_PROFILE_TAB_TITLES,
} from '@/widgets/user';
import {
  parseUserId,
  getUserProfileBasePath,
  getUserData,
  UserIdObject,
} from '@/entities/user';

const isValidTabKey = (tabKey: string): tabKey is UserProfileTab => {
  return USER_PROFILE_TABS.includes(tabKey as UserProfileTab);
};

const validateTabKey = (
  userIdObject: UserIdObject,
  tabKey: string = 'projects'
): UserProfileTab =>
  isValidTabKey(tabKey)
    ? tabKey
    : redirect(getUserProfileBasePath(userIdObject));

export const generateStaticParams = () =>
  USER_PROFILE_TABS.map((tabKey) => ({
    slug: [tabKey],
  }));

export async function generateMetadata({
  params,
}: PageProps<'/[language]/users/[id]/[[...slug]]'>): Promise<Metadata> {
  const { id, slug } = await params;
  const userIdObject = parseUserId(id);
  const tabKey = validateTabKey(userIdObject, slug?.[0]);
  const { data } = await getUserData(userIdObject);
  const name = data?.name?.trim() ?? '未知用戶';
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
  const tabKey = validateTabKey(userIdObject, slug?.[0]);

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
