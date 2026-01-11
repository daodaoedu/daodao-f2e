"use client";

import { AuthProvider } from "@daodao/auth";
import {
  type Locale,
  type Messages,
  NextIntlClientProvider,
} from "@daodao/i18n";
import {
  detectDeviceClient,
  DeviceProvider,
  type DeviceInfo,
} from "@daodao/shared";
import "@daodao/ui/globals.css";
import { DialogManagerProvider } from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { SheetManagerProvider } from "@daodao/ui/components/animate-ui/components/radix/sheet";
import { NavigationBlockerProvider } from "@daodao/ui/hooks/navigation-blocker";
import { Toaster } from "@daodao/ui/components/sonner";

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
        <NextIntlClientProvider
          messages={messages}
          locale={locale}
          timeZone="Asia/Taipei"
        >
          <DeviceProvider initialDevice={initialDevice}>
            <NavigationBlockerProvider>
              <AuthProvider>
                <DialogManagerProvider>
                  <SheetManagerProvider>
                    <Toaster />
                    {children}
                  </SheetManagerProvider>
                </DialogManagerProvider>
              </AuthProvider>
            </NavigationBlockerProvider>
          </DeviceProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export default GlobalProvider;
