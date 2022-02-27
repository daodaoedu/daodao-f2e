import React, { useMemo } from "react";
import { useRouter } from "next/router";
import SEOConfig from "../../../shared/components/SEO";
import Navigation from "../../../shared/components/Navigation_v2";
import Footer from "../../../shared/components/Footer_v2";
import ContributeResource from "../../../components/ContributeResource";

const ContributeResourcePage = () => {
  const router = useRouter();
  const queryString = useMemo(
    () => (router?.isReady && router?.asPath ? router?.asPath : ""),
    [router?.asPath, router?.isReady]
  );
  const SEOData = useMemo(
    () => ({
      title: "新增學習資源｜島島阿學",
      description:
        "我們期盼能邀請在各領域深耕已久的夥伴， 將自身累積的資源新增至教育資源網站，讓資源透明化。 若您願意一同共編，以下為新增資源的表單，您新增完後我們將進行審核在新增至上方資料庫中",
      keywords: "島島阿學",
      author: "島島阿學",
      copyright: "島島阿學",
      imgLink: "/preview.webp",
      link: `${process.env.NEXT_PUBLIC_DEV_HOSTNAME}${queryString}`,
    }),
    [queryString]
  );

  return (
    <>
      <SEOConfig data={SEOData} />
      <Navigation />
      <ContributeResource />
      <Footer />
    </>
  );
};

export default ContributeResourcePage;
