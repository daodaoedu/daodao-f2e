import { z } from 'zod';
import React, { useEffect, useMemo } from 'react';
import { SWRConfig } from 'swr';


import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { useRouter } from 'next/router';
import Script from 'next/script';
import Head from 'next/head';
import { AuthProvider, useAuth } from '@/contexts/Auth';
import { DialogProvider } from '@/contexts/Dialog';
import useQueryState from '@/hooks/useQueryState';
import { fetcher } from '@/utils/http';
import { getReminderStorage } from '@/utils/storage';
import getBaseLayout from '@/layout/core/getBaseLayout';
import { useCompleteInfoReminder, useVerifiedSuccessDialog } from '@/features/users';
import { initGA, logPageView } from '../utils/analytics';
import 'regenerator-runtime/runtime'; // Speech.js
import "@/app/global.css";

const swrConfig = {
  revalidateOnFocus: false,
  errorRetryCount: 0,
  keepPreviousData: true,
  fetcher,
};

const ThemeComponentWrap = ({ pageProps, Component }) => {
  const { isComplete, isLoggedIn } = useAuth();
  const getLayout = Component?.getLayout || getBaseLayout;
  const openCompleteInfoReminderDialog = useCompleteInfoReminder();
  const openVerifiedSuccessDialog = useVerifiedSuccessDialog();
  const [queryState, setQueryState] = useQueryState(z.object({
    isVerified: z.string().optional().transform((val) => val === 'true'),
  }));

  useEffect(() => {
    if (queryState.isVerified) {
      openVerifiedSuccessDialog();
      setQueryState({ isVerified: undefined });
      return;
    }

    const isReminder = getReminderStorage().get() % 4 === 3;

    if (isLoggedIn && !isComplete && isReminder) {
      getReminderStorage().remove();
      openCompleteInfoReminderDialog();
    }
  }, [queryState, isLoggedIn, isComplete, openCompleteInfoReminderDialog, openVerifiedSuccessDialog]);

  return (
    <>
      {/* Reset CSS handled by global.css and shadcn/ui */}
      {/* For custom reset css */}
      <Toaster
        position="top-center"
        containerStyle={{ background: 'none', marginTop: '80px' }}
        toastOptions={{
          style: {
            color: '#16b9b3',
            border: '1px solid #16b9b3',
            marginTop: '50px',
          },
          iconTheme: {
            primary: '#16b9b3',
          },
        }}
      />
      <SonnerToaster />
      {getLayout(<Component {...pageProps} />)}
    </>
  );
};

const App = ({ Component, pageProps }) => {
  const router = useRouter();
  useEffect(() => {
    initGA('UA-181407006-3');
    // `routeChangeComplete` won't run for the first page load unless the query string is
    // hydrated later on, so here we log a page view if this is the first render and
    // there's no query string
    if (!router.asPath.includes('?')) {
      logPageView();
    }
  }, []);

  useEffect(() => {
    // Listen for page changes after a navigation or when the query changes
    router.events.on('routeChangeComplete', logPageView);
    return () => {
      router.events.off('routeChangeComplete', logPageView);
    };
  }, [router.events]);

  // const [mode, setMode] = useState("light");
  // Update the theme only if the mode changes
  // const theme = useMemo(() => themeFactory(mode), [mode]);
  return (
    <>
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
      <Head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="島島阿學多元學習資源"
          href="https://www.daoedu.tw/rss/feed.xml"
        />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <SWRConfig value={swrConfig}>
        <DialogProvider>
          <AuthProvider>
            <ThemeComponentWrap pageProps={pageProps} Component={Component} />
          </AuthProvider>
        </DialogProvider>
      </SWRConfig>
    </>
  );
};

export default App;
