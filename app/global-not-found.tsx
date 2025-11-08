'use client';

import { hasLocale, Locale } from 'next-intl';
import { useParams } from 'next/navigation';
import NotExist from '@/shared/components/NotExist';
import { routing } from '@/shared/config/i18n/routing';
import './global.css';

function GlobalNotFoundPage() {
  const params = useParams<{ language: Locale }>();

  const locale = hasLocale(routing.locales, params?.language)
    ? params?.language
    : routing.defaultLocale;

  return (
    <html lang={locale}>
      <body>
        <NotExist />
      </body>
    </html>
  );
}

export default GlobalNotFoundPage;
