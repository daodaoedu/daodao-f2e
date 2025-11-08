'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Link, usePathname } from '@/shared/config/i18n/navigation';
import { cn } from '@/shared/lib/cn';
import { languageOptions, Locale } from '../config/i18n';
// import { CustomLink } from './custom-link';

interface LanguageSwitcherButtonsProps {
  searchParams?: URLSearchParams | null;
}

const LanguageSwitcherButtons = ({
  searchParams,
}: LanguageSwitcherButtonsProps) => {
  const params = useParams<{ language: Locale }>();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      {languageOptions.map((language, index) => (
        <div key={language.value} className="flex items-center gap-2">
          <Link
            className={cn(
              'text-sm font-medium text-white/70 transition-colors hover:text-primary-base',
              params?.language === language.value && 'text-primary-base'
            )}
            locale={language.value}
            href={{
              pathname,
              query: searchParams?.toString(),
            }}
            scroll={false}
          >
            {language.label}
          </Link>
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
