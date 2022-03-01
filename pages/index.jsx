import React, { useMemo, useRef } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
// import { SWRConfig } from "swr";
import SEOConfig from "../shared/components/SEO";
import Home from "../components/Home";
import Navigation from "../shared/components/Navigation_v2";
import Footer from "../shared/components/Footer_v2";
// import logger from "../utils/logger";

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const HomePage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: "學習資源平台｜島島阿學",
      description:
        "「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。",
      keywords: "島島阿學",
      author: "島島阿學",
      copyright: "島島阿學",
      imgLink: "https://www.daoedu.tw/preview.webp",
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      structuredData: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          url: "https://www.daoedu.tw",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate:
                "https://www.daoedu.tw/search?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          url: "https://www.daoedu.tw",
          logo: "https://www.daoedu.tw/favicon-112.png",
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "如何在島島查看資源?",
              acceptedAnswer: {
                "@type": "Answer",
                text: '進入<a href="https://www.daoedu.tw/search" target="_blank" rel="noreferrer">找資源</a>頁面即可搜尋資源',
              },
            },
            {
              "@type": "Question",
              name: "如何加入島島社群?",
              acceptedAnswer: {
                "@type": "Answer",
                text: '點擊<a href="https://www.facebook.com/groups/2237666046370459" target="_blank" rel="noreferrer">學習社群</a>即可加入',
              },
            },
            {
              "@type": "Question",
              name: "如何新增學習資源?",
              acceptedAnswer: {
                "@type": "Answer",
                text: '進入<a href="https://www.daoedu.tw/contribute/resource" target="_blank" rel="noreferrer">新增資源</a>頁面即可新增',
              },
            },
          ],
        },
      ],
    }),
    [router?.asPath]
  );

  return (
    <HomePageWrapper>
      <SEOConfig data={SEOData} />
      <Navigation />
      <Home />
      <Footer />
    </HomePageWrapper>
  );
};

// export const getServerSideProps = async () => {
//   // const { res, req, locale, defaultLocale } = ctx;
//   return {
//     props: {
//       isDev: process.env.NODE_ENV === "development",
//       fallback: {},
//     },
//   };
// };

export default HomePage;
