'use client';

import { Suspense } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname } from '@/shared/i18n/navigation';
import { languageOptions } from '@/shared/i18n/routing';
import { cn } from '@/shared/lib/cn';
import { CustomLink } from './custom-link';

interface LanguageSwitcherButtonsProps {
  searchParams?: URLSearchParams | null;
}

const LanguageSwitcherButtons = ({
  searchParams,
}: LanguageSwitcherButtonsProps) => {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      {languageOptions.map((language, index) => (
        <div key={language.value} className="flex items-center gap-2">
          <CustomLink
            className={cn(
              'text-sm font-medium text-white/70 transition-colors hover:text-primary-base',
              locale === language.value && 'text-primary-base'
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
            <span className="text-sm text-white/40">|</span>
          )}
        </div>
      ))}
    </div>
  );
};

const LanguageSwitcherContent = () => {
  const searchParams = useSearchParams();

  return <LanguageSwitcherButtons searchParams={searchParams} />;
};

export const LanguageSwitcher = () => {
  return (
    <Suspense fallback={<LanguageSwitcherButtons />}>
      <LanguageSwitcherContent />
    </Suspense>
  );
};
