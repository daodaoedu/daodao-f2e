"use client";

import faviconPng from "@daodao/assets/images/brand/favicon.png";
import { getMessagesFromPathname } from "@daodao/i18n";
import { usePathname } from "next/navigation";
import "@daodao/ui/globals.css";
import GlobalProvider from "./global-provider";

function GlobalErrorPage() {
  const pathname = usePathname();
  const { locale, messages } = getMessagesFromPathname(pathname);

  const head = (
    <head>
      <title>未知錯誤 | 島島阿學</title>
      <link rel="shortcut icon" href={faviconPng.src} />
    </head>
  );

  return (
    <GlobalProvider head={head} locale={locale} messages={messages}>
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">發生錯誤</h1>
          <p className="mt-4 text-muted-foreground">請稍後再試或聯繫客服</p>
        </div>
      </div>
    </GlobalProvider>
  );
}

export default GlobalErrorPage;
