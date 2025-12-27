import faviconPng from "@daodao/assets/images/brand/favicon.png";
import { hasLocale } from "@daodao/i18n";
import { routing } from "@daodao/i18n/routing";
import { getMessages, getTranslations, setRequestLocale } from "@daodao/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GlobalProvider from "../global-provider";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

  return (
    <GlobalProvider locale={locale} messages={messages}>
      {children}
    </GlobalProvider>
  );
}
