import React from 'react';
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import configureStore from '../utils/configureStore';
import GlobalStyle from '../shared/styles/Global';
import theme from "../shared/styles/theme";

const store = configureStore();

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        {/* For custum reset css */}
        <GlobalStyle>
          {/* mui normalize css */}
          <CssBaseline />
          <Component {...pageProps} />
          <Toaster />
        </GlobalStyle>
      </Provider>
    </ThemeProvider>
  );
};

export default App;
