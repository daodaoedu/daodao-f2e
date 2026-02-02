"use client";

import { SwrConfigProvider } from "@daodao/api";
import { AuthProvider } from "@daodao/auth";
import { DialogManagerProvider } from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Inter } from "next/font/google";
import Script from "next/script";
import { type AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { DialogProvider } from "@/contexts/Dialog";
import { PromotionProvider } from "@/contexts/Promotion";
import { NavigationBlockerProvider } from "@/shared/lib/navigation-blocker";
import { Toaster } from "@/shared/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

interface GlobalProvidersProps {
  children: React.ReactNode;
  head?: React.ReactNode;
  messages?: AbstractIntlMessages;
  locale: string;
}

function GlobalProviders({ head, children, messages, locale }: GlobalProvidersProps) {
  return (
    <html
      lang={locale}
      className={`${inter.className} scroll-smooth`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>{head}</head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Taipei">
          <SwrConfigProvider>
            <NavigationBlockerProvider>
              <DialogManagerProvider>
                <DialogProvider>
                  <AuthProvider publicPattern=".*">
                    <PromotionProvider>
                      {children}
                      <Toaster
                        position="top-center"
                        expand
                        toastOptions={{
                          style: {
                            marginTop: "80px", // 避免被 header 遮擋
                          },
                        }}
                      />
                    </PromotionProvider>
                  </AuthProvider>
                </DialogProvider>
              </DialogManagerProvider>
            </NavigationBlockerProvider>
          </SwrConfigProvider>
        </NextIntlClientProvider>
      </body>
      {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-9Z1P1RKY69"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9Z1P1RKY69');
        `}
      </Script>
      {/* <!-- Microsoft Clarity --> */}
      <Script type="text/javascript">
        {`
          (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "duktp01aq0");
        `}
      </Script>
      {/* <!-- Google Tag Manager --> */}
      <Script type="text/javascript">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-TH83D3J');
        `}
      </Script>
    </html>
  );
}

export default GlobalProviders;
