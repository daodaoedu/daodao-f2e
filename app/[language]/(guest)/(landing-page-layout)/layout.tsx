import {
  HeaderNavbar,
  Footer,
  LandingPageMobileNavbar,
  LandingPageFloatButtons,
  guestLayoutNav,
} from '@/widgets/layout';

export default async function LandingPageLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return (
    <>
      <HeaderNavbar navItems={guestLayoutNav} />
      <LandingPageMobileNavbar />
      <LandingPageFloatButtons />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
