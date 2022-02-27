import React, { useMemo } from "react";
import { useRouter } from "next/router";
import SEOConfig from "../../shared/components/SEO";
import Navigation from "../../shared/components/Navigation_v2";
import Footer from "../../shared/components/Footer_v2";
import Activities from "../../components/Activities";

const ActivitiesPage = () => {
  const router = useRouter();
  const queryString = useMemo(
    () => (router?.isReady && router?.asPath ? router?.asPath : ""),
    [router?.asPath, router?.isReady]
  );
  const SEOData = useMemo(
    () => ({
      title: "找學習活動｜島島阿學",
      description:
        "你知道什麼活動，抑或是想主辦一個呢？ 歡迎來信至 daodaoedunetwork@gmail.com 讓好的活動被更多人看見！",
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
      <Activities />
      <Footer />
    </>
  );
};

export default ActivitiesPage;
