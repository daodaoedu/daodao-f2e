"use client";

import { useTranslations } from "@daodao/i18n";
import { Image } from "@daodao/ui/components/image";

export function TransitionBanner() {
  const t = useTranslations("common");

  return (
    <section className="relative overflow-hidden bg-primary-palest py-12 md:py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-10">
          {/* Character illustration placeholder */}
          <div className="flex size-24 items-center justify-center rounded-2xl bg-mascot-aqua/30 md:size-32">
            {/* TODO: Replace with peeking mascot illustration */}
            <Image
              src="/assets/landing-page/deco-mascot.svg"
              alt="吉祥物"
              width={80}
              height={80}
            />
          </div>

          {/* Banner text */}
          <p className="text-center text-lg font-semibold text-primary-darker md:text-xl">
            {t("landing_banner_text")}
          </p>
        </div>
      </div>

      {/* Decorative stars */}
      <div className="pointer-events-none absolute left-[10%] top-4 text-tips/40">
        ✦
      </div>
      <div className="pointer-events-none absolute bottom-4 right-[15%] text-tips/30">
        ✦
      </div>
    </section>
  );
}
