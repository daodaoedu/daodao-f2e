import { Metadata } from 'next';
import {
  defaultLocale,
  getDictionary,
  Locale,
  locales,
} from '@/constants/i18n';
import { websiteConfig } from '@/constants/websiteConfig';

export async function createMetadata(
  locale: Locale = defaultLocale,
  pathname: string = '/'
): Promise<Metadata> {
  const {
    common: { title, description },
  } = await getDictionary(locale);

  const withoutLocalePathname = pathname.replace(`/${locale}`, '');

  const canonicalPath =
    withoutLocalePathname === '/'
      ? `/${locale}`
      : `/${locale}${withoutLocalePathname}`;

  const languageAlternates = Object.fromEntries(
    locales.map((_locate) => [
      _locate,
      withoutLocalePathname === '/'
        ? `/${_locate}`
        : `/${_locate}${withoutLocalePathname}`,
    ])
  );

  return {
    title: {
      template: `%s | ${websiteConfig.title}`,
      default: websiteConfig.defaultFullTitle,
    },
    description,
    metadataBase: new URL(websiteConfig.domainUrl),
    applicationName: title,
    keywords: ['島島阿學', '自主學習', '學習資源', '教育平台', '共學'],
    referrer: 'origin',
    themeColor: '#16b9b3',
    authors: [
      {
        name: websiteConfig.authorName,
        url: websiteConfig.authorUrl,
      },
    ],
    creator: websiteConfig.authorName,
    publisher: websiteConfig.authorName,
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates,
    },
    icons: {
      icon: '/assets/brand/favicon.png',
      shortcut: '/assets/brand/favicon.png',
      apple: '/assets/brand/favicon.png',
    },
    openGraph: {
      type: 'website',
      siteName: '島島阿學',
      title: {
        template: `%s | ${title}`,
        default: title,
      },
      description,
      url: websiteConfig.domainUrl,
      images: [
        {
          url: '/assets/brand/horizontal-primary-logo.svg',
          width: 1200,
          height: 630,
          alt: '島島阿學 - 自主學習資源平台',
        },
      ],
      locale: locale === 'zh' ? 'zh_TW' : 'en_US',
      alternateLocale: locales.filter((loc) => loc !== locale),
      ttl: 345600,
    },
    facebook: {
      appId: '374678340785771',
    },
    twitter: {
      card: 'summary_large_image',
      title: {
        template: `%s | ${title}`,
        default: title,
      },
      description,
      images: ['/assets/brand/horizontal-primary-logo.svg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    category: 'education',
    manifest: '/manifest.json',
  };
}
