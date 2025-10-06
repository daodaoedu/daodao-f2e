'use client';

import NotExist from '@/shared/components/NotExist';
import { getLocale, Locale } from '@/shared/config/i18n';
import { useParams } from 'next/navigation';
import './global.css';

function GlobalNotFoundPage() {
  const params = useParams<{ language: Locale }>();
  const locale = getLocale(params?.language);

  return (
    <html lang={locale}>
      <body>
        <NotExist />
      </body>
    </html>
  );
}

export default GlobalNotFoundPage;
