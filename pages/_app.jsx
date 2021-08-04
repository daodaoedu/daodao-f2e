import React from 'react';
import { Provider } from 'react-redux';
import configureStore from '../utils/configureStore';
import GlobalStyle from '../shared/styles/Global';

// if (window && window.__REDUX_DEVTOOLS_EXTENSION__) {
//   window.__REDUX_DEVTOOLS_EXTENSION__();
// }
// window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

const store = configureStore();

const App = ({ Component, pageProps }) => {
  return (
    <Provider store={store}>
      <GlobalStyle>
        <Component {...pageProps} />
      </GlobalStyle>
    </Provider>
  );
};

export default App;
