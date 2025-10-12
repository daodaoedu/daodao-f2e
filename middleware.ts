import { NextRequest, NextResponse, MiddlewareConfig } from 'next/server';
import {
  defaultLocale,
  isLocale,
  localeRegex,
  locales,
} from './shared/config/i18n';

export async function middleware(request: NextRequest) {
  const { href, origin, pathname } = request.nextUrl;
  const localePathname = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (localePathname) {
    return localePathname === defaultLocale
      ? NextResponse.redirect(href.replace(`/${defaultLocale}`, ''))
      : NextResponse.next();
  }

  const acceptLanguage = request.headers
    .get('Accept-Language')
    ?.match(localeRegex)?.[0];

  const locale = isLocale(acceptLanguage) ? acceptLanguage : defaultLocale;

  const redirectURL = href.replace(origin, `${origin}/${locale}`);

  return locale === defaultLocale
    ? NextResponse.rewrite(redirectURL)
    : NextResponse.redirect(redirectURL);
}

export const config: MiddlewareConfig = {
  matcher: [
    '/((?!api|auth|_next/static|_next/image|_next/data|assets|rss|opensearch.xml|sitemap.xml|robots.txt|manifest.json|workbox-*.js|pwabuilder-sw.js|sw.js|google24667896eaae9652.html|favicon.ico).*)',
  ],
};
