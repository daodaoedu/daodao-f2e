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
}: PageProps<'/[language]/me/[customId]/[[...slug]]'>): Promise<Metadata> {
  const { customId, slug } = await params;
  return generateUserProfileMetadata('customId', customId, slug);
}

export default async function TabContentPage({
  params,
}: PageProps<'/[language]/me/[customId]/[[...slug]]'>) {
  const { customId, slug } = await params;
  const { tabKey, type, id } = handleUserProfileTabContent(
    'customId',
    customId,
    slug
  );

  return <UserProfileTabContent tabKey={tabKey} type={type} id={id} />;
}
