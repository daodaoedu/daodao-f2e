import React, { useEffect, useState, useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import { Provider, useSelector } from "react-redux";
import GlobalStyle from "../shared/styles/Global";
import themeFactory from "../shared/styles/themeFactory";
import storeFactory from "../utils/configureStore";
import { initGA, logPageView } from "../utils/analytics";
import { useRouter } from "next/router";
import Script from "next/script";
import Mode from '../shared/components/Mode';
import "regenerator-runtime/runtime"; // Speech.js

const store = storeFactory();

const App = ({ Component, pageProps }) => {
  const router = useRouter();
  useEffect(() => {
    initGA("UA-181407006-3");
    // `routeChangeComplete` won't run for the first page load unless the query string is
    // hydrated later on, so here we log a page view if this is the first render and
    // there's no query string
    if (!router.asPath.includes("?")) {
      logPageView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  useEffect(() => {
    // Listen for page changes after a navigation or when the query changes
    router.events.on("routeChangeComplete", logPageView);
    return () => {
      router.events.off("routeChangeComplete", logPageView);
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
      <Provider store={store}>
        <ThemeComponentWrap pageProps={pageProps} Component={Component} />
      </Provider>
    </>
  );
};

const ThemeComponentWrap = ({ pageProps, Component }) => {
  const mode = useSelector((state) => state?.theme?.mode ?? 'light');
  const theme = useMemo(() => themeFactory(mode), [mode]);
  const isEnv = useMemo(() => process.env.NODE_ENV === "development", []);
  return (
    <ThemeProvider theme={theme}>
      {/* mui normalize css */}
      <CssBaseline />
      {/* For custum reset css */}
      <GlobalStyle />
      <Toaster />
      {isEnv && <Mode />}
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default App;
