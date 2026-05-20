"use client";

import { useTranslations } from "@daodao/i18n";
import { useScrollVisibility } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { ArrowUp } from "lucide-react";

export const LandingPageFloatButtons = () => {
  const t = useTranslations("web_layout");
  const isVisible = useScrollVisibility({ threshold: 300 });

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={cn(
        "fixed bottom-20 right-6 z-50 hidden transition-opacity md:block",
        isVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div className="flex flex-col items-center space-y-2">
        <Button
          type="button"
          onClick={handleScrollToTop}
          variant="ctaPrimary"
          size="icon"
          className="size-12 shadow-none"
          aria-label={t("scroll_to_top")}
        >
          <ArrowUp className="size-5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-[90px] bg-transparent p-0 hover:bg-transparent"
          aria-label={t("quiz_float_button")}
          asChild
        >
          <CustomLink href="/quiz">
            <Image
              src="/assets/landing-page/badge.svg"
              alt={t("quiz_float_button")}
              width={90}
              height={91}
              className="animate-spin-slow object-contain"
            />
          </CustomLink>
        </Button>
      </div>
    </div>
  );
};
