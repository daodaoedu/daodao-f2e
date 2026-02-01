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
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
              <SwrConfigProvider>
                <DialogManagerProvider>
                  <SheetManagerProvider>
                    <AuthProvider
                      defaultProtected
                      publicPattern={["^/auth/login", "^/auth/callback", "^/users/"]}
                      onAuthRequired={(currentPath) => {
                        router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
                      }}
                    >
                      <Toaster />
                      {children}
                    </AuthProvider>
                  </SheetManagerProvider>
                </DialogManagerProvider>
              </SwrConfigProvider>
            </NavigationBlockerProvider>
          </DeviceProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export default GlobalProvider;
