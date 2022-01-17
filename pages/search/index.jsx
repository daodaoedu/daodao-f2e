import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import SEOConfig from "../../shared/components/SEO";
import Search from "../../components/Search";
import Navigation from "../../shared/components/Navigation_v2";
import Footer from "../../shared/components/Footer_v2";

const SearchPageWrapper = styled.div`
  height: 100%;
  min-height: calc(100vh - 80px);
  padding-top: 50px;
  padding-left: 5%;
  padding-right: 5%;
`;

const SearchPage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: `${router.query.q}學習資源列表｜島島阿學`,
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
    <>
      <Navigation />
      <SEOConfig data={SEOData} />
      <SearchPageWrapper>
        {/* <SWRConfig value={{ fallback, use: [logger] }}> */}
        <Search />
        {/* </SWRConfig> */}
      </SearchPageWrapper>
      <Footer />
    </>
  );
};

export default SearchPage;
