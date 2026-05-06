"use client";

import { AnalyticsScripts } from "@daodao/analytics";
import { AuthProvider } from "@daodao/auth";
import { type Locale, type Messages, NextIntlClientProvider } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
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

// useRouter from @daodao/i18n/navigation requires NextIntlClientProvider in the tree.
// This inner component is rendered inside NextIntlClientProvider so the context is available.
function AuthNavigator({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <AuthProvider
      defaultProtected
      publicPattern={[
        "^/auth/login",
        "^/auth/callback",
        "^/auth/error",
        "^/auth/onboarding",
        "^/auth/verify-email(/.*)?$",
        "^/auth/error",
        "^/users/",
        "^/practices/[^/]+$",
        "^/dev/",
      ]}
      onAuthRequired={(currentPath) => {
        router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      }}
      onboardingPath="/auth/onboarding"
      onTemporaryUser={() => {
        router.push("/auth/onboarding");
      }}
      emailVerificationPath="/auth/verify-email"
      onEmailUnverified={() => {
        router.push("/auth/verify-email/pending");
      }}
    >
      <Toaster />
      {children}
    </AuthProvider>
  );
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
              <SwrConfigProvider>
                <DialogManagerProvider>
                  <SheetManagerProvider>
                    <AuthNavigator>{children}</AuthNavigator>
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
