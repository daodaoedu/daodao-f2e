import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, getLocale, locales } from './constants/i18n';

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;
  const pathnameHasLocalePrefix = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocalePrefix) return;

  const acceptLanguage = request.headers.get('Accept-Language');
  const locale = getLocale(acceptLanguage, defaultLocale);
  const redirectURL = new URL(`/${locale}${pathname}`, request.url);

  if (locale !== defaultLocale) {
    NextResponse.redirect(redirectURL);
    return;
  }

  NextResponse.rewrite(redirectURL);
}

export const config = {
  matcher: [
    // Skip paths
    '/((?!api|_next/static|_next/image|static|feed|favicon.ico|sw.js).*)',
  ],
};
