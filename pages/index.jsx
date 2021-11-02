import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useRouter } from 'next/router';
import PageContainer from "../shared/containers/Page";
import Navigation from "../shared/components/navigation";
import Footer from "../shared/components/footer";
import Header from "../shared/components/Header";
import CardList from "../components/home/CardList";
import Banner from "../components/home/Banner";
import { CATEGORY_LINK } from "../constants/category";

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const Home = () => {
  const router = useRouter();
  const SEOConfig = useMemo(() => ({
    title: '島島阿學 - 學習資源平台 - Daodao Online Learning Platform',
    description: '「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
    keywords: '島島阿學',
    author: '島島阿學',
    copyright: '島島阿學',
    imgLink: '/preview.webp',
    link: `https://test-page.notion.dev.daoedu.tw${router.asPath}`,
  }), [router]);
  return (
    <BodyWrapper>
      <Header config={SEOConfig} />
      <Navigation />
      <PageContainer>
        <Banner />
        <CardList list={CATEGORY_LINK} />
      </PageContainer>
      <Footer />
    </BodyWrapper>
  );
};

export default Home;
