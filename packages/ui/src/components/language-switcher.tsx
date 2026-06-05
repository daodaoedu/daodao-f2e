"use client";

import { useLocale } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { languageOptions } from "@daodao/i18n/routing";
import { cn } from "@daodao/ui/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CustomLink } from "./custom-link";

export type LanguageSwitcherVariant = "dark" | "light";

interface LanguageSwitcherButtonsProps {
  searchParams?: URLSearchParams | null;
  variant?: LanguageSwitcherVariant;
}

const LanguageSwitcherButtons = ({ searchParams, variant = "dark" }: LanguageSwitcherButtonsProps) => {
  const locale = useLocale();
  const pathname = usePathname();

  const isLight = variant === "light";

  return (
    <div className="flex items-center gap-2">
      {languageOptions.map((language, index) => (
        <div key={language.value} className="flex items-center gap-2">
          <CustomLink
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary-base",
              locale === language.value
                ? "text-primary-base"
                : isLight
                  ? "text-text-dark/60"
                  : "text-white/70"
            )}
            locale={language.value}
            href={{
              pathname,
              query: searchParams?.toString(),
            }}
            scroll={false}
          >
            {language.label}
          </CustomLink>
          {index < languageOptions.length - 1 && (
            <span className={cn("text-sm", isLight ? "text-text-dark/30" : "text-white/40")}>|</span>
          )}
        </div>
      ))}
    </div>
  );
};

interface LanguageSwitcherContentProps {
  variant?: LanguageSwitcherVariant;
}

const LanguageSwitcherContent = ({ variant }: LanguageSwitcherContentProps) => {
  const searchParams = useSearchParams();

  return <LanguageSwitcherButtons searchParams={searchParams} variant={variant} />;
};

interface LanguageSwitcherProps {
  variant?: LanguageSwitcherVariant;
}

export const LanguageSwitcher = ({ variant }: LanguageSwitcherProps) => {
  return (
    <Suspense fallback={<LanguageSwitcherButtons variant={variant} />}>
      <LanguageSwitcherContent variant={variant} />
    </Suspense>
  );
};
