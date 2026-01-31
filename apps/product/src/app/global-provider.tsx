"use client";

import { AnalyticsScripts } from "@daodao/analytics";
import { AuthProvider } from "@daodao/auth";
import { type Locale, type Messages, NextIntlClientProvider } from "@daodao/i18n";
import { type DeviceInfo, DeviceProvider, detectDeviceClient } from "@daodao/shared";
import "@daodao/ui/globals.css";
import { SwrConfigProvider } from "@daodao/api";
import { DialogManagerProvider } from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { SheetManagerProvider } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { Toaster } from "@daodao/ui/components/sonner";
import { NavigationBlockerProvider } from "@daodao/ui/hooks/navigation-blocker";

interface GlobalProviderProps {
  head?: React.ReactNode;
  locale: Locale;
  children: React.ReactNode;
  messages: Messages;
  initialDevice?: DeviceInfo;
}

function GlobalProvider({
  head,
  locale,
  children,
  messages,
  initialDevice = detectDeviceClient(),
}: GlobalProviderProps) {
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
          <DeviceProvider initialDevice={initialDevice}>
            <NavigationBlockerProvider>
              <AuthProvider>
                <SwrConfigProvider>
                  <DialogManagerProvider>
                    <SheetManagerProvider>
                      <Toaster />
                      {children}
                    </SheetManagerProvider>
                  </DialogManagerProvider>
                </SwrConfigProvider>
              </AuthProvider>
            </NavigationBlockerProvider>
          </DeviceProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export default GlobalProvider;
