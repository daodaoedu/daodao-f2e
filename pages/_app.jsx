import React from 'react';
import '../styles/globals.css';
import { Provider } from 'react-redux';
// import { CategoyProvider } from '../contexts/CategoyContext';
import configureStore from '../utils/configureStore';

// if (window && window.__REDUX_DEVTOOLS_EXTENSION__) {
//   window.__REDUX_DEVTOOLS_EXTENSION__();
// }
// window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

const store = configureStore();

const MyApp = ({ Component, pageProps }) => {
  return (
    // <CategoyProvider>
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
    // </CategoyProvider>

  );
};

export default MyApp;
