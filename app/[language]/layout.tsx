import Script from 'next/script';
import { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { getDictionary, locales } from '@/constants/i18n';
import { websiteConfig } from '@/constants/websiteConfig';
import Providers from './Providers';
import '../global.css';

const inter = Inter({ subsets: ['latin'] });

export async function generateStaticParams() {
  return locales.map((language) => ({ language }));
}

export function generateViewport(): Viewport {
  return {
    themeColor: websiteConfig.themeColor,
  };
}

export async function generateMetadata({
  params,
}: LayoutProps<'/[language]'>): Promise<Metadata> {
  const { language } = await params;

  const {
    common: { title, description },
  } = await getDictionary(language);

  const languageAlternates = Object.fromEntries(
    locales.map((locate) => [locate, `/${locate}`])
  );

  return {
    title: {
      template: `%s | ${websiteConfig.title}`,
      default: websiteConfig.defaultFullTitle,
    },
    description,
    metadataBase: new URL(websiteConfig.domainUrl),
    applicationName: title,
    keywords: websiteConfig.keywords,
    referrer: 'origin',
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
      languages: languageAlternates,
      types: {
        'application/rss+xml': [
          {
            title: '島島阿學多元學習資源',
            url: 'https://www.daoedu.tw/rss/feed.xml',
          },
        ],
      },
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
      locale: language,
      alternateLocale: locales.filter((locale) => locale !== language),
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

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[language]'>) {
  const { language } = await params;

  return (
    <html
      lang={language}
      className={`${inter.className} scroll-smooth`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
      {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-9Z1P1RKY69"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9Z1P1RKY69');
        `}
      </Script>
      {/* <!-- Microsoft Clarity --> */}
      <Script type="text/javascript">
        {`
          (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "duktp01aq0");
        `}
      </Script>
      {/* <!-- Google Tag Manager --> */}
      <Script type="text/javascript">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-TH83D3J');
        `}
      </Script>
    </html>
  );
}
