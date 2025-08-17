import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, getLocale, locales } from './constants/i18n';

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { href, origin, pathname } = request.nextUrl;
  const pathnameHasLocalePrefix = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocalePrefix) return NextResponse.next();

  const acceptLanguage = request.headers.get('Accept-Language');
  const locale = getLocale(acceptLanguage, defaultLocale);
  const redirectURL = href.replace(origin, `${origin}/${locale}`);

  if (locale !== defaultLocale) {
    return NextResponse.redirect(redirectURL);
  }
  return NextResponse.rewrite(redirectURL);
}

export const config = {
  matcher: [
    // Skip paths
    '/((?!api|_next/static|_next/image|static|feed|manifest.json|sw.js).*)',
  ],
};
