"use client";

import { getMessagesFromPathname } from "@daodao/i18n";
import { usePathname } from "next/navigation";
import NotExist from "@/components/layout/not-exist";
import "@daodao/ui/globals.css";
import { Footer, Header } from "@/components/layout";
import GlobalProvider from "./global-provider";

function GlobalNotFoundPage() {
  const pathname = usePathname();
  const { locale, messages } = getMessagesFromPathname(pathname);

  const head = (
    <head>
      <title>找不到頁面 | 島島阿學</title>
      <link rel="shortcut icon" href="/assets/brand/favicon.png" />
    </head>
  );

  return (
    <GlobalProvider head={head} locale={locale} messages={messages}>
      <Header />
      <NotExist />
      <Footer />
    </GlobalProvider>
  );
}

export default GlobalNotFoundPage;
