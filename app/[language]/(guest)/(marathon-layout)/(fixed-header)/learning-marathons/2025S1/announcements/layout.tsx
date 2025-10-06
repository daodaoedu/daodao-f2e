import { HeaderNavbar, Footer, marathonNav } from '@/widgets/layout';

export default async function MarathonPageLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return (
    <>
      <HeaderNavbar alwaysShow navItems={marathonNav} />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
