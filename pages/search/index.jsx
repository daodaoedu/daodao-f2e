import React from "react";
import styled from "@emotion/styled";
// import { useRouter } from "next/router";
// import { SWRConfig } from "swr";
// import logger from "../utils/logger";

const SearchPageWrapper = styled.div`
  height: 100%;
  min-height: calc(100vh - 80px);
`;

const SearchPage = () => {
  //   const router = useRouter();
  //   const SEOData = useMemo(
  //     () => ({
  //       title: "島島阿學 - 學習資源平台 - Daodao Online Learning Platform",
  //       description:
  //         "「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。",
  //       keywords: "島島阿學",
  //       author: "島島阿學",
  //       copyright: "島島阿學",
  //       imgLink: "/preview.webp",
  //       link: `https://test-page.notion.dev.daoedu.tw${router.asPath}`,
  //     }),
  //     [router]
  //   );

  return <SearchPageWrapper>123</SearchPageWrapper>;
};

export default SearchPage;
