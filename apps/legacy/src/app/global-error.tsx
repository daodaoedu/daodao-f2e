"use client";

import { useParams } from "next/navigation";
import { hasLocale, type Locale } from "next-intl";
import NotExist from "@/shared/components/NotExist";
import { routing } from "@/shared/i18n/routing";
import GlobalProviders from "@/src/widgets/layout/ui/global-providers";
import "./global.css";

function GlobalErrorPage() {
  const params = useParams<{ language: Locale }>();

  const locale = hasLocale(routing.locales, params?.language)
    ? params?.language
    : routing.defaultLocale;

  const head = (
    <>
      <title>未知錯誤 | 島島阿學</title>
      <link rel="shortcut icon" href="/assets/brand/favicon.png" />
    </>
  );

  return (
    <GlobalProviders head={head} locale={locale}>
      <NotExist />
    </GlobalProviders>
  );
}

export default GlobalErrorPage;
