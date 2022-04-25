import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import SEOConfig from "../../shared/components/SEO";
import Search from "../../components/Search";
import Navigation from "../../shared/components/Navigation_v2";
import Footer from "../../shared/components/Footer_v2";
import { SEARCH_TAGS } from "../../constants/category";
const SearchPageWrapper = styled.div`
  height: 100%;
  min-height: calc(100vh - 80px);
  padding-top: 20px;
  padding-left: 5%;
  padding-right: 5%;
  @media (max-width: 767px) {
    padding-top: 10px;
    padding-left: 10px;
    padding-right: 10px;
  }
`;

const SearchPage = () => {
  const router = useRouter();
  // 這裡的參數主要都是處理SEO用的
  const title = useMemo(() => {
    const isCatsExist = router?.query?.cats && router?.query?.cats.length > 0;
    const isTagsExist = router?.query?.tags && router?.query?.tags.length > 0;
    const isQueryExist = router?.query?.q && router?.query?.q.length > 0;

    // 顯示優先權建議：標題 > 標籤 > 分類
    if (isTagsExist && isQueryExist) {
      return `${router?.query?.q}的${router?.query?.tags}`;
    }
    if (isCatsExist && isQueryExist) {
      return `${router?.query?.q}的${router?.query?.cats}`;
    }
    if (isTagsExist && isCatsExist) {
      return `${router?.query?.tags}的${router?.query?.cats}`;
    }
    if (isTagsExist) {
      return router?.query?.tags ?? "";
    }
    if (isCatsExist) {
      return router?.query?.cats ?? "";
    } else if (isQueryExist) {
      return router?.query?.q ?? "";
    } else {
      return "";
    }
  }, [router?.query?.cats, router?.query?.q, router?.query?.tags]);
  const SEOData = useMemo(
    () => ({
      title: `${title}多元學習資源列表｜島島阿學`,
      description:
        "「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。",
      keywords: "島島阿學",
      author: "島島阿學",
      copyright: "島島阿學",
      imgLink: "https://www.daoedu.tw/preview.webp",
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      structuredData: [
        {
          "@context": "https://schema.org",
          "@type": "Course",
          name: `學習資源列表`,
          description:
            "「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。",
          // 有cats才能放
          itemListElement: SEARCH_TAGS[router?.query?.cats ?? "語言與文學"].map(
            (tagName, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@id": `https://www.daoedu.tw/search?cats=${
                  router?.query?.cats ?? "語言與文學"
                }&tags=${tagName}`,
                name: `${tagName}的${
                  router?.query?.cats ?? "語言與文學"
                }學習資源列表`,
              },
            })
          ),
          provider: {
            "@type": "Organization",
            name: "島島阿學",
            sameAs: "https://www.daoedu.tw",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          url: "https://www.daoedu.tw/search",
          potentialAction: {
            "@type": "SearchAction",
            "query-input": "required name=q",
            target: "https://www.daoedu.tw/search?q={q}",
          },
        },
      ],
    }),
    [router?.asPath, router?.query, title]
  );
  return (
    <>
      <Navigation />
      <SEOConfig data={SEOData} />
      <SearchPageWrapper>
        <Search title={title} />
      </SearchPageWrapper>
      <Footer />
    </>
  );
};

export default SearchPage;
