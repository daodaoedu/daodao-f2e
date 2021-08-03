import React from 'react';
import '../styles/globals.css';
import { Provider } from 'react-redux';
import configureStore from '../utils/configureStore';

// if (window && window.__REDUX_DEVTOOLS_EXTENSION__) {
//   window.__REDUX_DEVTOOLS_EXTENSION__();
// }
// window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

const store = configureStore();

const App = ({ Component, pageProps }) => {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
};

export default App;
