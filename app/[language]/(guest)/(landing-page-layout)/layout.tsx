import {
  HeaderNavbar,
  Footer,
  LandingPageMobileNavbar,
  LandingPageFloatButtons,
  landingPageNav,
} from '@/widgets/layout';

export default function LandingPageLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return (
    <>
      <HeaderNavbar navItems={landingPageNav} />
      <LandingPageMobileNavbar />
      <LandingPageFloatButtons />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
