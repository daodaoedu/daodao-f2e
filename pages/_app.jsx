import React from 'react';
import '../styles/globals.css';
import { CategoyProvider } from '../contexts/CategoyContext';

const MyApp = ({ Component, pageProps }) => {
  return (
    <CategoyProvider>
      <Component {...pageProps} />
    </CategoyProvider>

  );
};

export default MyApp;
