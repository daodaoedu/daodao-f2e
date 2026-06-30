"use client";

import { getMessagesFromPathname } from "@daodao/i18n";
import { usePathname } from "next/navigation";
import "@daodao/ui/globals.css";
import faviconPng from "@daodao/assets/images/brand/favicon.png";
import GlobalProvider from "./global-provider";

function GlobalNotFoundPage() {
  const pathname = usePathname();
  const { locale, messages } = getMessagesFromPathname(pathname);
  const commonMessages = messages.common as Record<string, string>;

  const head = (
    <head>
      <title>{commonMessages.global_not_found_title}</title>
      <link rel="shortcut icon" href={faviconPng.src} />
    </head>
  );

  return (
    <GlobalProvider head={head} locale={locale} messages={messages}>
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{commonMessages.global_not_found_heading}</h1>
          <p className="mt-4 text-muted-foreground">
            {commonMessages.global_not_found_description}
          </p>
        </div>
      </div>
    </GlobalProvider>
  );
}

export default GlobalNotFoundPage;
