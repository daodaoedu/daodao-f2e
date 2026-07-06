import faviconPng from "@daodao/assets/images/brand/favicon.png";
import { hasLocale } from "@daodao/i18n";
import { routing } from "@daodao/i18n/routing";
import { getMessages, getTranslations, setRequestLocale } from "@daodao/i18n/server";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { detectDevice } from "@/lib/device-detection";
import GlobalProvider from "../global-provider";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#16B2A5",
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "common" });

  return {
    title: {
      template: `%s | ${t("title")}`,
      default: t("title"),
    },
    description: t("description"),
    icons: {
      icon: faviconPng.src,
      apple: "/icons/icon-180x180.png",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: t("title"),
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  const messages = await getMessages();

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const device = await detectDevice();

  return (
    <GlobalProvider locale={locale} messages={messages} initialDevice={device}>
      {children}
    </GlobalProvider>
  );
}
