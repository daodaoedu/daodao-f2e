'use client';

import { usePathname } from 'next/navigation';
import { defaultLocale, getLocale } from '@/constants/i18n';

function Document({ children }: React.PropsWithChildren) {
  const pathname = usePathname();
  const lang = getLocale(pathname, defaultLocale);

  return (
    <html lang={lang} className="scroll-smooth" suppressHydrationWarning>
      {children}
    </html>
  );
}

export default Document;
