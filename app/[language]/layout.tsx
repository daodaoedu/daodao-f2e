import Script from 'next/script';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { I18nParams, locales } from '@/constants/i18n';
import { createMetadata } from '@/utils/metadata';
import Providers from './Providers';
import '../global.css';

const inter = Inter({ subsets: ['latin'] });

export async function generateStaticParams() {
  return locales.map((language) => ({ language }));
}

export async function generateMetadata({
  params,
}: I18nParams): Promise<Metadata> {
  const { language } = await params;
  // @TODO: generate feed

  return createMetadata(language);
}

interface RootLayoutProps extends I18nParams {
  children: React.ReactNode;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { language } = await params;

  return (
    <html
      lang={language}
      className={`${inter.className} scroll-smooth`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
      {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-9Z1P1RKY69"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9Z1P1RKY69');
        `}
      </Script>
      {/* <!-- Microsoft Clarity --> */}
      <Script type="text/javascript">
        {`
          (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "duktp01aq0");
        `}
      </Script>
      {/* <!-- Google Tag Manager --> */}
      <Script type="text/javascript">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-TH83D3J');
        `}
      </Script>
    </html>
  );
}
