"use client";

import { hasLocale, Locale } from "@daodao/i18n";
import { routing } from "@daodao/i18n/routing";
import { useParams } from "next/navigation";
import NotExist from "@daodao/ui/components/not-exist";
import "@daodao/ui/globals.css";

function GlobalErrorPage() {
  const params = useParams<{ language: Locale }>();

  const locale = hasLocale(routing.locales, params?.language)
    ? params?.language
    : routing.defaultLocale;

  return (
    <html
      lang={locale}
      className="scroll-smooth"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <title>未知錯誤 | 島島阿學</title>
        <link rel="shortcut icon" href="/assets/brand/favicon.png" />
      </head>
      <body>
        <NotExist />
      </body>
    </html>
  );
}

export default GlobalErrorPage;
