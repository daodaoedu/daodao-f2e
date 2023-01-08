import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="zh-Hant">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          <link rel="manifest" href="manifest.json" />
        </Head>
        <Script type="module">
          {`
          import 'https://cdn.jsdelivr.net/npm/@pwabuilder/pwaupdate';
          const el = document.createElement('pwa-update');
          document.body.appendChild(el);
        `}
        </Script>
        <body>
          <Main />
          <NextScript />
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TH83D3J"
      height="0" width="0" style="display:none;visibility:hidden" />`,
            }}
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
