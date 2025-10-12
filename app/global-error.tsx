'use client';

import NotExist from '@/shared/components/NotExist';
import { isLocale, Locale, defaultLocale } from '@/shared/config/i18n';
import { useParams } from 'next/navigation';
import './global.css';

function GlobalErrorPage() {
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

export default GlobalErrorPage;
