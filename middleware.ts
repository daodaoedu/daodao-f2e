import { NextRequest, NextResponse, MiddlewareConfig } from 'next/server';
import {
  defaultLocale,
  isLocale,
  localeRegex,
  locales,
} from './shared/config/i18n';

const LOCALE_COOKIE_NAME = 'preferred-locale';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function middleware(request: NextRequest) {
  const { href, origin, pathname } = request.nextUrl;
  const localePathname = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (localePathname) {
    const response =
      localePathname === defaultLocale
        ? NextResponse.redirect(href.replace(`/${defaultLocale}`, ''))
        : NextResponse.next();

    response.cookies.set(LOCALE_COOKIE_NAME, localePathname, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const validCookieLocale =
    cookieLocale && isLocale(cookieLocale) ? cookieLocale : null;

  const acceptLanguage = request.headers
    .get('Accept-Language')
    ?.match(localeRegex)?.[0];
  const validAcceptLanguage =
    acceptLanguage && isLocale(acceptLanguage) ? acceptLanguage : defaultLocale;
  const locale = validCookieLocale || validAcceptLanguage || defaultLocale;
  const redirectURL = href.replace(origin, `${origin}/${locale}`);

  const response =
    locale === defaultLocale
      ? NextResponse.rewrite(redirectURL)
      : NextResponse.redirect(redirectURL);

  if (!validCookieLocale || validCookieLocale !== locale) {
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  return response;
}

export const config: MiddlewareConfig = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/data|assets|rss|opensearch.xml|sitemap.xml|robots.txt|manifest.json|workbox-*.js|pwabuilder-sw.js|sw.js|google24667896eaae9652.html|favicon.ico).*)',
  ],
};
