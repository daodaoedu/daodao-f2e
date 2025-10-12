'use client';

import { Suspense } from 'react';
import { usePathname, useParams, useSearchParams } from 'next/navigation';
import { cn } from '@/utils/cn';
import { languageOptions, Locale } from '../config/i18n';
import { useHash } from '../lib/navigation-blocker';
import { CustomLink } from './custom-link';

interface LanguageSwitcherButtonsProps {
  searchParams?: URLSearchParams | null;
}

const LanguageSwitcherButtons = ({
  searchParams,
}: LanguageSwitcherButtonsProps) => {
  const params = useParams<{ language: Locale }>();
  const pathname = usePathname();
  const hash = useHash();
  const search = searchParams?.size ? `?${searchParams}` : '';
  const finalHref = `${pathname}${search}${hash}`;

  return (
    <div className="flex items-center gap-2">
      {languageOptions.map((language, index) => (
        <div key={language.value} className="flex items-center gap-2">
          <CustomLink
            className={cn(
              'text-sm font-medium text-white/70 transition-colors hover:text-primary-base',
              params?.language === language.value && 'text-primary-base'
            )}
            locale={language.value}
            href={finalHref}
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
