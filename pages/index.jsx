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
      imgLink: "/preview.webp",
      link: `https://test-page.notion.dev.daoedu.tw${router.asPath}`,
    }),
    [router]
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
