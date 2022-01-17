import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
// import { Provider } from "react-redux";
// import configureStore from "../utils/configureStore";
import GlobalStyle from "../shared/styles/Global";
import theme from "../shared/styles/theme";
import Navigation from "../shared/components/Navigation";
import Footer from "../shared/components/Footer";

// const store = configureStore();

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      {/* <Provider store={store}> */}
      {/* For custum reset css */}
      <GlobalStyle />
      {/* mui normalize css */}
      <CssBaseline />
      <Toaster />
      <Navigation />
      <Component {...pageProps} />
      <Footer />
      {/* </Provider> */}
    </ThemeProvider>
  );
};

export default App;
