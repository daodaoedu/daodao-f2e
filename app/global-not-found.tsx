'use client';

import NotExist from '@/shared/components/NotExist';
import { defaultLocale, getLocale, Locale } from '@/constants/i18n';
import { useParams } from 'next/navigation';
import '@/shared/styles/global.css';

function GlobalNotFoundPage() {
  const params = useParams<{ language: Locale }>();
  const locale = getLocale(params?.language, defaultLocale);

  return (
    <html lang={locale}>
      <body>
        <NotExist />
      </body>
    </html>
  );
}

export default GlobalNotFoundPage;
