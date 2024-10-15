import React, { useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Script from 'next/script';
import Head from 'next/head';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import SnackbarProvider from '@/contexts/Snackbar';
import GlobalStyle from '@/shared/styles/Global';
import themeFactory from '@/shared/styles/themeFactory';
import storeFactory from '@/redux/store';
import { checkLoginValidity, fetchUserById } from '@/redux/actions/user';
import { getRedirectionStorage } from '@/utils/storage';
import DefaultLayout from '@/layout/DefaultLayout';
import { initGA, logPageView } from '../utils/analytics';
import Mode from '../shared/components/Mode';
import 'regenerator-runtime/runtime'; // Speech.js

const store = storeFactory();
const persistor = persistStore(store);

const firebaseConfig = {
  apiKey: 'AIzaSyBJK-FKcGHwDy1TMcoJcBdEqbTYpEquUi4',
  authDomain: 'daodaoedu-4ae8f.firebaseapp.com',
  projectId: 'daodaoedu-4ae8f',
  storageBucket: 'daodaoedu-4ae8f.appspot.com',
  messagingSenderId: '653049466612',
  appId: '1:653049466612:web:ba41fadb677499a5ae18a1',
  measurementId: 'G-1EV81PDZF5',
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
      </Head>

      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <SnackbarProvider>
            <ThemeComponentWrap pageProps={pageProps} Component={Component} />
          </SnackbarProvider>
        </PersistGate>
      </Provider>
    </>
  );
};

const ThemeComponentWrap = ({ pageProps, Component }) => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state?.theme?.mode ?? 'light');
  const theme = useMemo(() => themeFactory(mode), [mode]);
  const isEnv = useMemo(() => process.env.NODE_ENV === 'development', []);
  const router = useRouter();
  const Layout = Component?.getLayout || DefaultLayout;

  useEffect(() => {
    dispatch(checkLoginValidity());
  }, []);

  useEffect(() => {
    const receiveMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data.isLogin) {
        const { token, id } = e.data;
        const redirectionStorage = getRedirectionStorage();
        const redirection = redirectionStorage.get();
        dispatch(fetchUserById(id, token));
        if (redirection) {
          redirectionStorage.remove();
          router.push(redirection);
        }
      }
    };
    window.addEventListener('message', receiveMessage, false);

    return () => {
      window.removeEventListener('message', receiveMessage, false);
    };
  }, []);

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
      {isEnv && <Mode />}
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
};

export default App;
