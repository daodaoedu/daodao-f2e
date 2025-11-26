import { HeaderNavbar, Footer, protectedLayoutNav } from '@/widgets/layout';

export default function ProtectedBaseLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return (
    <>
      <HeaderNavbar navItems={protectedLayoutNav} alwaysShow />
      <main className="min-h-screen w-full bg-basic-white">{children}</main>
      <Footer />
    </>
  );
}
