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

// import Navigation from "../shared/components/Navigation";
// import Footer from "../shared/components/Footer";

const store = storeFactory();

const App = ({ Component, pageProps }) => {
  const router = useRouter();
  useEffect(() => {
    initGA();
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
      {/* mui normalize css */}
      <CssBaseline />
      {/* For custum reset css */}
      <GlobalStyle />
      <Toaster />
      {/* <Navigation /> */}
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
      {/* <Footer /> */}
    </ThemeProvider>
  );
};

export default App;
