"use client";

import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";

export function CallToActionSection() {
  const { openLoginDialog } = useAuth();
  const t = useTranslations("landing_page");

  return (
    <section className="relative my-20 flex min-h-[366px] flex-col items-center justify-center px-6 overflow-hidden">
      <Image
        src="/assets/landing-page/bg-island.svg"
        alt=""
        fill
        className="z-0 object-cover object-center md:object-contain"
        aria-hidden="true"
      />
      <h2 className="relative z-10 my-4 text-center text-[20px] font-semibold leading-tight text-primary-darker md:text-[24px]">
        {t("cta_heading_line1")}
        <br />
        {t("cta_heading_line2")}
      </h2>
      <div className="relative z-10">
        <Button
          variant="ctaOrange"
          size="huge"
          onClick={() => openLoginDialog({ redirectUrl: "/" })}
        >
          {t("cta_join_button")}
        </Button>
      </div>
    </section>
  );
}
