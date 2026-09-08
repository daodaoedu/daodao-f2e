"use client";

import { useLocale } from "@daodao/i18n";
import { usePathname, useRouter } from "@daodao/i18n/navigation";
import { type Locale, languageOptions } from "@daodao/i18n/routing";
import { cn } from "@daodao/ui/lib/utils";
import { useTransition } from "react";

export function LanguagePillToggle() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (newLocale: Locale) => {
    if (newLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <fieldset
      className={cn(
        "flex items-center gap-1 rounded-full bg-[#EEF3F3] p-0.5 border-0",
        isPending && "opacity-70 pointer-events-none"
      )}
      aria-label="Language"
    >
      {languageOptions.map((option) => {
        const isActive = option.value === locale;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleSwitch(option.value)}
            className={cn(
              "px-3 py-1 text-[13px] font-medium rounded-full transition-colors",
              isActive
                ? "bg-logo-cyan text-white"
                : "text-light-gray hover:text-text-dark"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
