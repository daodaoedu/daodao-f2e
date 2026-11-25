"use client";

import { HorizontalFullSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Link } from "@daodao/i18n/navigation";

/** 探索頁訪客頁首；redirect 是登入後要回到的頁面 */
export const ExploreGuestHeader = ({ redirect }: { redirect: string }) => {
  const t = useTranslations("explore_activities");
  const loginHref = `/auth/login?redirect=${encodeURIComponent(redirect)}`;

  return (
    <header className="sticky top-0 z-20 border-b border-[#E4EAE9] bg-white/80 backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[760px] items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <HorizontalFullSvg className="h-7 w-auto" />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={loginHref}
            className="inline-flex h-8 items-center rounded-full px-3.5 text-[13px] font-medium text-text-dark/75 transition-colors hover:text-text-dark"
          >
            {t("guest_login")}
          </Link>
          <Link
            href={loginHref}
            className="inline-flex h-8 items-center rounded-full bg-logo-cyan px-4 text-[13px] font-semibold text-white transition-colors hover:bg-logo-cyan/90"
          >
            {t("guest_signup")}
          </Link>
        </div>
      </div>
    </header>
  );
};
