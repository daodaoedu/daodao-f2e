import {
  Footer,
  guestLayoutNav,
  HeaderNavbar,
  LandingPageFloatButtons,
} from "@/src/widgets/layout";

export default async function DefaultLayout({ children }: LayoutProps<"/[language]">) {
  return (
    <>
      <HeaderNavbar alwaysShow navItems={guestLayoutNav} />
      <LandingPageFloatButtons />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
