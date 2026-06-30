"use client";

import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { useScrollVisibility } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { useEffect } from "react";

type NavItemType = {
  label: string;
  href: string;
};

type HeaderConfigType = {
  alwaysShow: boolean;
  navItems: NavItemType[];
};

const useHeaderConfig = (): HeaderConfigType => {
  const pathname = usePathname();
  // Resource 頁面始終顯示 header，不需要導航項目
  if (pathname.startsWith("/resource")) {
    return { alwaysShow: true, navItems: [] };
  }
  return { alwaysShow: true, navItems: [] };
};

export const ResourceHeader = () => {
  const { alwaysShow, navItems } = useHeaderConfig();
  const isVisible = useScrollVisibility({ threshold: 200 });
  const t = useTranslations("common");
  const { openLoginDialog } = useAuth();

  useEffect(() => {
    document.documentElement.style.setProperty("scroll-padding-top", "69px");
    return () => {
      document.documentElement.style.removeProperty("scroll-padding-top");
    };
  }, []);

  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "";

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
          <CustomLink href={websiteUrl}>
            <Image
              src="/assets/landing-page/logo-simple.svg"
              alt={t("back_to_home")}
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
          <Button variant="ctaOrangeSmall" onClick={() => openLoginDialog({ redirectUrl: "/" })}>
            {t("landing_join_cta")}
          </Button>
        </li>
      </ul>
    </nav>
  );
};
