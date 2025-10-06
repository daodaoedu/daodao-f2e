import {
  HeaderNavbar,
  Footer,
  LandingPageFloatButtons,
  landingPageNav,
} from '@/widgets/layout';

export default async function DefaultLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return (
    <>
      <HeaderNavbar alwaysShow navItems={landingPageNav} />
      <LandingPageFloatButtons />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
