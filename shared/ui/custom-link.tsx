'use client';

import type { UrlObject } from 'url';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useNavigationBlocker } from '../lib/navigation-blocker';
import { Locale, localePathnameRegex } from '../config/i18n';

const removeLocalePrefix = (path: string): string => {
  return path.replace(localePathnameRegex, '$2');
};

const addLocalePrefix = (path: string, locale: string): string => {
  const cleanPath = removeLocalePrefix(path);
  return `/${locale}${cleanPath}`;
};

const checkIsInternal = (href: string | UrlObject): boolean => {
  const pathname = typeof href === 'string' ? href : href.pathname;
  return !pathname?.startsWith('http');
};

const formatHref = (href: string | UrlObject, locale?: string) => {
  const isInternal = checkIsInternal(href);

  if (!locale || !isInternal) {
    return href;
  }

  if (typeof href === 'string') {
    return addLocalePrefix(href, locale);
  }

  if (typeof href === 'object' && href && href.pathname) {
    return {
      ...href,
      pathname: addLocalePrefix(href.pathname, locale),
    };
  }

  return href;
};

interface CustomLinkProps
  extends Omit<React.ComponentProps<typeof Link>, 'locale'> {
  locale?: Locale;
}

export function CustomLink({
  children,
  href,
  locale,
  onNavigate,
  ...props
}: CustomLinkProps) {
  const { isBlocked } = useNavigationBlocker();
  const params = useParams<{ language: Locale }>();
  const pathname = usePathname();
  const hasPrefix = pathname && localePathnameRegex.test(pathname);
  const language = hasPrefix ? params?.language : undefined;
  const formattedHref = formatHref(href, locale || language);

  const handleNavigate: CustomLinkProps['onNavigate'] = (e) => {
    if (
      isBlocked &&
      // eslint-disable-next-line no-alert
      !window.confirm('You have unsaved changes. Leave anyway?')
    ) {
      e.preventDefault();
      return;
    }
    onNavigate?.(e);
  };

  return (
    <Link href={formattedHref} onNavigate={handleNavigate} {...props}>
      {children}
    </Link>
  );
}
