import { UserProfileLayout } from '@/widgets/user';

export default async function UsersLayout({
  params,
  children,
}: LayoutProps<'/[language]/users/[userId]'>) {
  const { userId } = await params;

  return (
    <UserProfileLayout type="userId" id={userId}>
      {children}
    </UserProfileLayout>
  );
}
