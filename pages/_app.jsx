import React, { useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import GlobalStyle from "../shared/styles/Global";
import theme from "../shared/styles/theme";
import storeFactory from "../utils/configureStore";
import { initGA, logPageView } from "../utils/analytics";
import { useRouter } from "next/router";
import Script from "next/script";

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
  return (
    <ThemeProvider theme={theme}>
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
      {/* mui normalize css */}
      <CssBaseline />
      {/* For custum reset css */}
      <GlobalStyle />
      <Toaster />
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </ThemeProvider>
  );
};

export default App;
