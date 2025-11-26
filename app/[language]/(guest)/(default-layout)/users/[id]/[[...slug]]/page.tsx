import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/shared/i18n/navigation';
import { USER_PROFILE_TABS, UserProfileTab, DEFAULT_TAB } from '@/widgets/user';
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

export async function generateMetadata({
  params,
}: PageProps<'/[language]/users/[id]/[[...slug]]'>): Promise<Metadata> {
  const { id, slug } = await params;
  const userIdObject = parseUserId(id);
  const tabKey = await validateTabKey(userIdObject, slug?.[0]);
  const [, userResponse] = await getUserData(userIdObject);
  const data = userResponse?.data?.data;
  const t = await getTranslations('user_profile');
  const name = data?.name?.trim() || t('unknown_user');
  const tabTitle = t(`tab_${tabKey}`);

  return {
    title: t('page_title_format', { name, tab: tabTitle }),
  };
}

export default async function TabContentPage({
  params,
}: PageProps<'/[language]/users/[id]/[[...slug]]'>) {
  const { id, slug } = await params;
  const userIdObject = parseUserId(id);
  const tabKey = await validateTabKey(userIdObject, slug?.[0]);
  const t = await getTranslations('user_profile');

  switch (tabKey) {
    case 'projects':
      return <div>{t('tab_projects')}</div>;
    case 'practices':
      return <div>{t('tab_practices')}</div>;
    case 'ideas':
      return <div>{t('tab_ideas')}</div>;
    case 'circles':
      return <div>{t('tab_circles')}</div>;
    case 'resources':
      return <div>{t('tab_resources')}</div>;
    default:
      return null;
  }
}
