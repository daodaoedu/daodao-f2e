'use client';

import NotExist from '@/shared/components/NotExist';
import { Locale, isLocale, defaultLocale } from '@/shared/config/i18n';
import { useParams } from 'next/navigation';
import './global.css';

function GlobalNotFoundPage() {
  const params = useParams<{ language: Locale }>();
  const language = params?.language;
  const locale = language && isLocale(language) ? language : defaultLocale;

  return (
    <html lang={locale}>
      <body>
        <NotExist />
      </body>
    </html>
  );
}

export default GlobalNotFoundPage;
