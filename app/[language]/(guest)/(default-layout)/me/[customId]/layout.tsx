import { UserProfileLayout } from '@/widgets/user';

export default async function MeLayout({
  params,
  children,
}: LayoutProps<'/[language]/me/[customId]'>) {
  const { customId } = await params;

  return (
    <UserProfileLayout type="customId" id={customId}>
      {children}
    </UserProfileLayout>
  );
}
