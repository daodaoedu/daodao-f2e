import { Footer, HeaderNavbar, LandingPageFloatButtons } from "@/components/layout";
import { guestLayoutNav } from "@/config/nav";

export default function LandingPageLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <>
      <HeaderNavbar navItems={guestLayoutNav} />
      <LandingPageFloatButtons />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
