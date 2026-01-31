"use client";

import { AnalyticsScripts } from "@daodao/analytics";
import { AuthProvider } from "@daodao/auth";
import { type Locale, type Messages, NextIntlClientProvider } from "@daodao/i18n";
import "@daodao/ui/globals.css";
import { SwrConfigProvider } from "@daodao/api";
import { DialogManagerProvider } from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { NavigationBlockerProvider } from "@daodao/ui/hooks/navigation-blocker";

interface GlobalProviderProps {
  head?: React.ReactNode;
  locale: Locale;
  children: React.ReactNode;
  messages: Messages;
}

function GlobalProvider({ head, locale, children, messages }: GlobalProviderProps) {
  return (
    <html
      lang={locale}
      className="scroll-smooth"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      {head}
      <body>
        <AnalyticsScripts />
        <NextIntlClientProvider messages={messages} locale={locale} timeZone="Asia/Taipei">
          <NavigationBlockerProvider>
            <DialogManagerProvider>
              <AuthProvider publicPattern=".*">
                <SwrConfigProvider>{children}</SwrConfigProvider>
              </AuthProvider>
            </DialogManagerProvider>
          </NavigationBlockerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export default GlobalProvider;
