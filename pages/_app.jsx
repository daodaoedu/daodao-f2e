import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import GlobalStyle from "../shared/styles/Global";
import theme from "../shared/styles/theme";
import storeFactory from "../utils/configureStore";
// import Navigation from "../shared/components/Navigation";
// import Footer from "../shared/components/Footer";

const store = storeFactory();

const App = ({ Component, pageProps }) => {
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
