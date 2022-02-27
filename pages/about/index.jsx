import React, { useMemo } from "react";
import { useRouter } from "next/router";
import SEOConfig from "../../shared/components/SEO";
import Navigation from "../../shared/components/Navigation_v2";
import Footer from "../../shared/components/Footer_v2";
import About from "../../components/About";

const AboutPage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: "關於島島｜島島阿學",
      description:
        "在島島阿學裡，每個人都是一座獨一無二的「島」，對於學習／生命擁有不同的渴望與資源，因為互相、互助學習，成為一片獨立又連結的群島。而島島阿學也希望能有台語「沓沓仔學Ta̍uh-ta̍uh-á o̍h」，「慢慢學不用急」之意涵，道出組織的教育價值觀是以人為本，尊重每人學習步調與方向。",
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
      <SEOConfig data={SEOData} />
      <Navigation />
      <About />
      <Footer />
    </>
  );
};

export default AboutPage;
