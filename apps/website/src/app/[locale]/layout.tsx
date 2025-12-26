import { routing } from "@daodao/i18n/routing";
import type { Metadata } from "next";
import "@daodao/ui/globals.css";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "@daodao/i18n/server";
import { NextIntlClientProvider } from "@daodao/i18n";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    title: {
      template: `%s | ${t("title")}`,
      default: t("title"),
    },
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className="scroll-smooth"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider
          messages={messages}
          locale={locale}
          timeZone="Asia/Taipei"
        >
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
