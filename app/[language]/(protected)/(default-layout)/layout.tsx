import { HeaderNavbar, Footer, exploreNav } from '@/widgets/layout';

export default function ProtectedBaseLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return (
    <>
      <HeaderNavbar navItems={exploreNav} alwaysShow />
      <main className="min-h-screen w-full bg-basic-white">{children}</main>
      <Footer />
    </>
  );
}
