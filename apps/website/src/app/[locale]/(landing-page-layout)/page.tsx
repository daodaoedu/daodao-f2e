import { ANCHOR_IDS } from "@daodao/shared";
import { LandingPage } from "@/components/landing-page";
import { Footer, HeaderNavbar, LandingPageFloatButtons } from "@/components/layout";
import type { NavItemType } from "@/components/layout/header-navbar";

export const landingPageNavItems: NavItemType[] = [
  {
    label: "landing_solutions",
    href: `/#${ANCHOR_IDS.SOLUTIONS}`,
  },
  {
    label: "landing_features",
    href: `/#${ANCHOR_IDS.FEATURES}`,
  },
  {
    label: "landing_plans",
    href: `/#${ANCHOR_IDS.PLANS}`,
  },
];

export default async function HomePage() {
  return (
    <>
      <HeaderNavbar navItems={landingPageNavItems} />
      <LandingPageFloatButtons />
      <main className="min-h-screen">
        <LandingPage />
      </main>
      <Footer />
    </>
  );
}
