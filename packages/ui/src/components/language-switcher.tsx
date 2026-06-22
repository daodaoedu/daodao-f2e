"use client";

import { useLocale } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { languageOptions } from "@daodao/i18n/routing";
import { cn } from "@daodao/ui/lib/utils";
import { Globe } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CustomLink } from "./custom-link";

export type LanguageSwitcherVariant = "dark" | "light";

interface LanguageSwitcherButtonsProps {
  searchParams?: URLSearchParams | null;
  variant?: LanguageSwitcherVariant;
  showIcon?: boolean;
}

const LanguageSwitcherButtons = ({
  searchParams,
  variant = "dark",
  showIcon = false,
}: LanguageSwitcherButtonsProps) => {
  const locale = useLocale();
  const pathname = usePathname();

  const isLight = variant === "light";
  const inactiveColor = isLight ? "text-text-dark/60" : "text-white/70";
  const separatorColor = isLight ? "text-text-dark/30" : "text-white/40";

  return (
    <div className="flex items-center gap-2">
      {showIcon && <Globe className={cn("size-4 shrink-0", inactiveColor)} />}
      {languageOptions.map((language, index) => (
        <div key={language.value} className="flex items-center gap-2">
          <CustomLink
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary-base",
              locale === language.value ? "text-primary-base" : inactiveColor
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
            <span className={cn("text-sm", separatorColor)}>|</span>
          )}
        </div>
      ))}
    </div>
  );
};

interface LanguageSwitcherContentProps {
  variant?: LanguageSwitcherVariant;
  showIcon?: boolean;
}

const LanguageSwitcherContent = ({ variant, showIcon }: LanguageSwitcherContentProps) => {
  const searchParams = useSearchParams();

  return (
    <LanguageSwitcherButtons searchParams={searchParams} variant={variant} showIcon={showIcon} />
  );
};

interface LanguageSwitcherProps {
  variant?: LanguageSwitcherVariant;
  showIcon?: boolean;
}

export const LanguageSwitcher = ({ variant, showIcon }: LanguageSwitcherProps) => {
  return (
    <Suspense fallback={<LanguageSwitcherButtons variant={variant} showIcon={showIcon} />}>
      <LanguageSwitcherContent variant={variant} showIcon={showIcon} />
    </Suspense>
  );
};
