import { Metadata } from 'next';
import {
  generateUserProfileStaticParams,
  generateUserProfileMetadata,
  handleUserProfileTabContent,
  UserProfileTabContent,
} from '@/widgets/user';

export const generateStaticParams = generateUserProfileStaticParams;

export async function generateMetadata({
  params,
}: PageProps<'/[language]/users/[userId]/[[...slug]]'>): Promise<Metadata> {
  const { userId, slug } = await params;
  return generateUserProfileMetadata('userId', userId, slug);
}

export default async function TabContentPage({
  params,
}: PageProps<'/[language]/users/[userId]/[[...slug]]'>) {
  const { userId, slug } = await params;
  const { tabKey, type, id } = handleUserProfileTabContent(
    'userId',
    userId,
    slug
  );

  return <UserProfileTabContent tabKey={tabKey} type={type} id={id} />;
}
