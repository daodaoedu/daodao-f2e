"use client";

import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { ANCHOR_IDS, useScrollVisibility } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { useEffect } from "react";

type NavItemType = {
  label: string;
  href: string;
};

const landingPageNavItems: NavItemType[] = [
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

type HeaderConfigType = {
  alwaysShow: boolean;
  navItems: NavItemType[];
};

const useHeaderConfig = (): HeaderConfigType => {
  const pathname = usePathname();
  switch (pathname) {
    case "/":
      return { alwaysShow: false, navItems: landingPageNavItems };
    case "/learning-marathons/2025S1":
      return { alwaysShow: false, navItems: [] };
    default:
      return { alwaysShow: true, navItems: [] };
  }
};

export const Header = () => {
  const { alwaysShow, navItems } = useHeaderConfig();
  const isVisible = useScrollVisibility({ threshold: 200 });
  const t = useTranslations("common");

  useEffect(() => {
    document.documentElement.style.setProperty("scroll-padding-top", "69px");
    return () => {
      document.documentElement.style.removeProperty("scroll-padding-top");
    };
  }, []);

  return (
    <nav
      className={cn(
        "fixed left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-white/20 px-8 py-4 backdrop-blur-[10px] transition-[translate,opacity] duration-300 ease-in-out",
        alwaysShow || isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      )}
    >
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="cursor-pointer border-none bg-none p-0 transition-transform duration-200 ease-in-out"
          animation="none"
          asChild
        >
          <CustomLink href="/">
            <Image
              src="/assets/landing-page/logo-simple.svg"
              alt="回到首頁"
              width={142}
              height={24}
            />
          </CustomLink>
        </Button>
      </div>
      <ul className="flex items-center gap-8">
        {navItems.map((item) => (
          <li key={item.label} className="hidden md:block">
            <Button
              variant="ghost"
              className="relative cursor-pointer border-none bg-none p-0 text-base font-medium text-primary-darker transition-all duration-300 ease-in-out after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary-base after:transition-all after:duration-300 after:ease-in-out after:content-[''] hover:text-primary-base hover:after:w-full"
              animation="none"
              asChild
            >
              <CustomLink href={item.href}>{t(item.label)}</CustomLink>
            </Button>
          </li>
        ))}
        <li>
          <Button variant="ctaOrangeSmall">立即加入</Button>
        </li>
      </ul>
    </nav>
  );
};
