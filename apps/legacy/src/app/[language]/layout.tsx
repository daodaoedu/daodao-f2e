import "../global.css";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/shared/i18n/routing";
import { websiteConfig } from "@/src/constants/websiteConfig";
import { GlobalProviders } from "@/src/widgets/layout";

export async function generateStaticParams() {
  return routing.locales.map((language) => ({ language }));
}

export function generateViewport(): Viewport {
  return {
    themeColor: websiteConfig.themeColor,
  };
}

const checkLocale = (locale: string) => {
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
};

export async function generateMetadata({ params }: LayoutProps<"/[language]">): Promise<Metadata> {
  const { language } = await params;

  checkLocale(language);

  const t = await getTranslations("common");

  const languageAlternates = Object.fromEntries(
    routing.locales.map((locale) => [locale, `/${locale}`])
  );

  return {
    title: {
      template: `%s | ${websiteConfig.title}`,
      default: websiteConfig.defaultFullTitle,
    },
    description: t("description"),
    metadataBase: new URL(websiteConfig.domainUrl),
    applicationName: t("title"),
    keywords: websiteConfig.keywords,
    referrer: "origin",
    authors: [
      {
        name: websiteConfig.authorName,
        url: websiteConfig.authorUrl,
      },
    ],
    creator: websiteConfig.authorName,
    publisher: websiteConfig.authorName,
    alternates: {
      canonical: "/",
      languages: languageAlternates,
      types: {
        "application/rss+xml": [
          {
            title: "島島阿學多元學習資源",
            url: "https://www.daoedu.tw/rss/feed.xml",
          },
        ],
      },
    },
    icons: {
      icon: "/assets/brand/favicon.png",
      shortcut: "/assets/brand/favicon.png",
      apple: "/assets/brand/favicon.png",
    },
    openGraph: {
      type: "website",
      siteName: "島島阿學",
      title: {
        template: `%s | ${t("title")}`,
        default: t("title"),
      },
      description: t("description"),
      url: websiteConfig.domainUrl,
      images: [
        {
          url: "/assets/brand/horizontal-primary-logo.svg",
          width: 1200,
          height: 630,
          alt: "島島阿學 - 自主學習資源平台",
        },
      ],
      locale: language,
      alternateLocale: routing.locales.filter((locale) => locale !== language),
      ttl: 345600,
    },
    facebook: {
      appId: "374678340785771",
    },
    twitter: {
      card: "summary_large_image",
      title: {
        template: `%s | ${t("title")}`,
        default: t("title"),
      },
      description: t("description"),
      images: ["/assets/brand/horizontal-primary-logo.svg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    category: "education",
    manifest: "/manifest.json",
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[language]">) {
  const { language } = await params;

  checkLocale(language);

  const messages = await getMessages({ locale: language });

  return (
    <GlobalProviders messages={messages} locale={language}>
      {children}
    </GlobalProviders>
  );
}
