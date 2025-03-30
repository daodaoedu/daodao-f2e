import React, { useEffect, useMemo, useState } from 'react';
import { SWRConfig } from 'swr';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import Head from 'next/head';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { AuthProvider, useAuth } from '@/contexts/Auth';
import SnackbarProvider from '@/contexts/Snackbar';
import { DialogProvider } from '@/contexts/Dialog';
import CompleteInfoReminderDialog from '@/shared/components/CompleteInfoReminderDialog';
import GlobalStyle from '@/shared/styles/Global';
import Image from "@/shared/components/Image";
import Modal from '@/shared/components/Modal';
import themeFactory from '@/shared/styles/themeFactory';
import storeFactory from '@/redux/store';
import { fetcher } from '@/services/core';
import { checkLoginValidity } from '@/redux/actions/user';
import { getReminderStorage } from '@/utils/storage';
import getDefaultLayout from '@/layout/DefaultLayout';
import { initGA, logPageView } from '../utils/analytics';
import 'regenerator-runtime/runtime'; // Speech.js
import "@/shared/styles/global.css";
import 'dayjs/locale/zh-tw';

const store = storeFactory();
const persistor = persistStore(store);

dayjs.locale('zh-tw');

const swrConfig = {
  revalidateOnFocus: false,
  errorRetryCount: 0,
  keepPreviousData: true,
  fetcher,
};

const ThemeComponentWrap = ({ pageProps, Component }) => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = useSelector((state) => state?.theme?.mode ?? 'light');
  const theme = useMemo(() => themeFactory(mode), [mode]);
  const { isComplete, isLoggedIn } = useAuth();
  const [openModalType, setOpenModalType] = useState(null);
  const getLayout = Component?.getLayout || getDefaultLayout;
  const isVerified = searchParams.get("isVerified");

  const handleClose = () => {
    setOpenModalType(null);
    getReminderStorage().remove();
  };

  useEffect(() => {
    dispatch(checkLoginValidity());
  }, []);

  useEffect(() => {
    if (isVerified) {
      setOpenModalType("verifiedSuccess");
      return;
    }

    if (isLoggedIn && !isComplete && getReminderStorage().get() % 3 === 0) {
      setOpenModalType("completeInfoReminder");
    }
  }, [isVerified, isLoggedIn, isComplete]);

  return (
    <ThemeProvider theme={theme}>
      {/* mui normalize css */}
      <CssBaseline />
      {/* For custum reset css */}
      <GlobalStyle />
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
      <CompleteInfoReminderDialog isOpen={openModalType === "completeInfoReminder"} onClose={handleClose} />
      <Modal
        isOpen={openModalType === 'verifiedSuccess' && isLoggedIn}
        onClose={handleClose}
        title="驗證成功"
        describedby="verifiedSuccess"
      >
        <Image
          src="/assets/illustration.png"
          alt="verified-success"
          width="300"
          height="289"
        />
        {
          isComplete ? (
            <>
              <p id="verifiedSuccess" className="mb-6 text-center text-basic-400 body-sm">
                帳號已驗證成功，快來體驗平台的特色功能！
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 py-2 shadow-lg transition-colors rounded-full bg-primary-base text-white hover:bg-primary-darker"
                  onClick={handleClose}
                >
                  開始探索
                </button>
              </div>
            </>
          ) : (
            <>
              <p id="verifiedSuccess" className="mb-6 text-center text-basic-400 body-sm">
                我們會公開你的<strong className="font-bold">個人檔案</strong>，填寫完整的資料，才能讓其他夥伴們更了解你喔！
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 py-2 shadow-lg transition-colors rounded-full bg-white text-primary-darker hover:bg-basic-100"
                  onClick={handleClose}
                >
                  暫時不需要
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 shadow-lg transition-colors rounded-full bg-primary-base text-white hover:bg-primary-darker"
                  onClick={() => {
                    handleClose();
                    router.replace('/personal-card');
                  }}
                >
                  想，填寫資料
                </button>
              </div>
            </>
          )
        }
      </Modal>
      {getLayout(<Component {...pageProps} />)}
    </ThemeProvider>
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

      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
            <SWRConfig value={swrConfig}>
              <SnackbarProvider>
                <AuthProvider>
                  <DialogProvider>
                    <ThemeComponentWrap pageProps={pageProps} Component={Component} />
                  </DialogProvider>
                </AuthProvider>
              </SnackbarProvider>
            </SWRConfig>
          </LocalizationProvider>
        </PersistGate>
      </Provider>
    </>
  );
};

export default App;
