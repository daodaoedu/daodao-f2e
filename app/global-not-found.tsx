'use client';

import { hasLocale, Locale } from 'next-intl';
import { useParams } from 'next/navigation';
import NotExist from '@/shared/components/NotExist';
import { routing } from '@/shared/i18n/routing';
import GlobalProviders from '@/widgets/layout/ui/global-providers';
import './global.css';

function GlobalNotFoundPage() {
  const params = useParams<{ language: Locale }>();

  const locale = hasLocale(routing.locales, params?.language)
    ? params?.language
    : routing.defaultLocale;

  const head = (
    <>
      <title>找不到頁面 | 島島阿學</title>
      <link rel="shortcut icon" href="/assets/brand/favicon.png" />
    </>
  );

  return (
    <GlobalProviders head={head} locale={locale}>
      <NotExist />
    </GlobalProviders>
  );
}

export default GlobalNotFoundPage;
