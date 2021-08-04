import React from 'react';
import Head from 'next/head';
import styled from '@emotion/styled';
import PageContainer from '../shared/containers/Page';
import Navigation from '../shared/components/navigation';
import Footer from '../shared/components/footer';
import SEO from '../shared/components/seo';

const SEOConfig = {
  title: '島島阿學 - 學習資源平台 - Daodao Online Learning Platform',
  description: '「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
  keywords: '島島阿學',
  author: '島島阿學',
  copyright: '島島阿學',
  imgLink: '',
  link: '',
};

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const Home = () => {
  return (
    <BodyWrapper>
      <Head>
        <SEO config={SEOConfig} />
      </Head>
      <Navigation />
      <PageContainer>
        <p>頁面不存在，可以去參觀其他地方喔</p>
        <p>若有疑問，可聯絡我們</p>
      </PageContainer>
      <Footer />
    </BodyWrapper>
  );
};

export default Home;
