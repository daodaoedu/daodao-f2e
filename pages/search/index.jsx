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
      title: `${title}學習資源列表｜島島阿學`,
      description:
        "「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。",
      keywords: "島島阿學",
      author: "島島阿學",
      copyright: "島島阿學",
      imgLink: "https://www.daoedu.tw/preview.webp",
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      // root才需要放這個，避免影響到其他頁面
      structuredData: !router?.query && {
        "@context": "https://schema.org",
        "@type": "Course",
        name: `學習資源列表`,
        description:
          "「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。",
        itemListElement: Object.keys(SEARCH_TAGS).map((catName, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@id": `https://www.daoedu.tw/search?cats=${catName}`,
            name: catName,
          },
        })),
        provider: {
          "@type": "Organization",
          name: "島島阿學",
          sameAs: "https://www.daoedu.tw",
        },
      },
    }),
    [router?.asPath, router?.query, title]
  );

  return (
    <>
      <Navigation />
      <SEOConfig data={SEOData} />
      <SearchPageWrapper>
        <Search />
      </SearchPageWrapper>
      <Footer />
    </>
  );
};

export default SearchPage;
