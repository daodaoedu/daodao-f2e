'use client';

import Script from 'next/script';
import { SWRConfig } from 'swr';
import { ThemeProvider } from 'next-themes';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { Inter } from 'next/font/google';
import { AuthProvider, LoginModal } from '@/entities/user';
import { DialogProvider } from '@/contexts/Dialog';
import { PromotionProvider } from '@/contexts/Promotion';
import { NavigationBlockerProvider } from '@/shared/lib/navigation-blocker';
import { emitUnauthorized } from '@/shared/lib/auth-bus';
import { ApiError } from '@/shared/api';
import { Toaster } from '@/shared/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

const swrConfig = {
  revalidateOnFocus: false,
  errorRetryCount: 0,
  keepPreviousData: true,
  onError: (e: unknown) => {
    if (e instanceof ApiError && e.status === 401) {
      emitUnauthorized();
    }
  },
};

interface GlobalProvidersProps {
  children: React.ReactNode;
  head?: React.ReactNode;
  messages?: AbstractIntlMessages;
  locale: string;
}

function GlobalProviders({
  head,
  children,
  messages,
  locale,
}: GlobalProvidersProps) {
  return (
    <html
      lang={locale}
      className={`${inter.className} scroll-smooth`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>{head}</head>
      <body>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone="Asia/Taipei"
        >
          <SWRConfig value={swrConfig}>
            <NavigationBlockerProvider>
              <DialogProvider>
                <AuthProvider>
                  <PromotionProvider>
                    <ThemeProvider attribute="class">
                      {children}
                      <Toaster
                        position="top-center"
                        expand
                        toastOptions={{
                          style: {
                            marginTop: '80px', // 避免被 header 遮擋
                          },
                        }}
                      />
                      <LoginModal />
                    </ThemeProvider>
                  </PromotionProvider>
                </AuthProvider>
              </DialogProvider>
            </NavigationBlockerProvider>
          </SWRConfig>
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
