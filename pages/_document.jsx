import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="zh-Hant">
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-9Z1P1RKY69"
        />
        <Script>
          {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=UA-181407006-3"
          ></script>
          <script>
            window.dataLayer = window.dataLayer || []; dataLayer.push('js', new
            Date()); dataLayer.push('config', 'UA-181407006-3');
          </script>
        </Script>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
