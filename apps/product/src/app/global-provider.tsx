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
import { Anonymous_Pro } from "next/font/google";
import { useRouter } from "next/navigation";
import { PwaInstallPrompt } from "@/components/pwa/install-prompt";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { OnboardingProgressProvider } from "@/components/task-guide/onboarding-progress-context";
import { TaskGuideWidget } from "@/components/task-guide/task-guide-widget";
import { TrackingRefCapture } from "@/components/tracking-ref-capture";

const anonymousPro = Anonymous_Pro({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-anonymous-pro",
  display: "swap",
});

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
      <body className={anonymousPro.variable}>
        <TrackingRefCapture />
        <RegisterServiceWorker />
        <AnalyticsScripts />
        <NextIntlClientProvider messages={messages} locale={locale} timeZone="Asia/Taipei">
          <DeviceProvider initialDevice={initialDevice}>
            <NavigationBlockerProvider>
              <SwrConfigProvider>
                <DialogManagerProvider>
                  <AuthProvider
                    defaultProtected
                    publicPattern={[
                      // auth flows
                      "^/auth/",
                      // content pages (no login required)
                      "^/$",
                      "^/users/",
                      "^/practices/[^/]+$",
                      "^/practices/[^/]+/check-ins/",
                      "^/roadmap(/.*)?$",
                      "^/resource(/.*)?$",
                      "^/persona(/.*)?$",
                      "^/mine(/.*)?$",
                      "^/survey/r/",
                      // 空間公開連結（訪客視角，免登入）
                      "^/spaces/public/",
                      // misc
                      "^/dev/",
                      "^/ux-mockup/",
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
                    <SheetManagerProvider>
                      <OnboardingProgressProvider>
                        <TaskGuideWidget />
                        <Toaster />
                        {children}
                        <PwaInstallPrompt />
                      </OnboardingProgressProvider>
                    </SheetManagerProvider>
                  </AuthProvider>
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
