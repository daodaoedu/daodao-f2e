import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import { useRouter } from 'next/router';
import configureStore from '../utils/configureStore';
import GlobalStyle from '../shared/styles/Global';

// if (window && window.__REDUX_DEVTOOLS_EXTENSION__) {
//   window.__REDUX_DEVTOOLS_EXTENSION__();
// }
// window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

const store = configureStore();

const App = ({ Component, pageProps }) => {
  const router = useRouter();
  const SEOConfig = useMemo(() => ({
    title: '島島阿學 - 學習資源平台 - Daodao Online Learning Platform',
    description: '「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
    keywords: '島島阿學',
    author: '島島阿學',
    copyright: '島島阿學',
    imgLink: '/preview.webp',
    link: `https://test-page.notion.dev.daoedu.tw${router.asPath}`,
  }), []);
  console.log('router ', router);
  return (
    <Provider store={store}>
      <GlobalStyle>
        <Component
          {...pageProps}
          router={router}
          SEOConfig={SEOConfig}
        />
      </GlobalStyle>
    </Provider>
  );
};

export default App;
