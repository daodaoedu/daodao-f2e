import { Metadata } from 'next';
import {
  defaultLocale,
  getDictionary,
  Locale,
  locales,
} from '@/constants/i18n';
import { websiteConfig } from '@/constants/websiteConfig';

export async function createMetadata(
  locale: Locale = defaultLocale
): Promise<Metadata> {
  const {
    common: { title, description },
  } = await getDictionary(locale);

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
      canonical: '/',
      languages: Object.fromEntries(
        locales.map((loc) => [loc, `/${loc}`])
      ),
    },
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
      apple: '/favicon.png',
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
          url: '/horizontal-logo.svg',
          width: 1200,
          height: 630,
          alt: '島島阿學 - 自主學習資源平台',
        },
      ],
      locale: locale === 'zh' ? 'zh_TW' : 'en_US',
      alternateLocale: locales.filter(loc => loc !== locale),
      ttl: 345600,
    },
    facebook: {
      appId: '374678340785771',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@島島阿學',
      creator: '@島島阿學',
      title: {
        template: `%s | ${title}`,
        default: title,
      },
      description,
      images: ['/horizontal-logo.svg'],
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
    // manifest: '/manifest.json',
  };
}
