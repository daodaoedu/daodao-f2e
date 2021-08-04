import React from 'react';
import Head from 'next/head';
import styled from '@emotion/styled';
import PageContainer from '../shared/containers/Page';
import Navigation from '../shared/components/navigation';
import Footer from '../shared/components/footer';
import SEO from '../shared/components/seo';

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const Home = ({ SEOConfig }) => {
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
