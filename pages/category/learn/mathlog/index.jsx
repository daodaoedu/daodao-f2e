import React, { useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import Footer from '../../../../shared/containers/Footer';
import PageContainer from '../../../../shared/containers/Page';
import Navigation from '../../../../shared/components/navigation';
import SEO from '../../../../shared/components/seo';
import SiderBar from '../../../../components/home/RightSiderBar';
import { useCategoyContext } from '../../../../contexts/CategoyContext';
import About from '../../../../components/category/About';
import { SEARCH_TAGS, CATEGORY_ID } from '../../../../constants/category';

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const SEOConfig = {
  title: '島島阿學 - 學習資源平台 - Daodao Online Learning Platform',
  description: '「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
  keywords: '島島阿學',
  author: '島島阿學',
  copyright: '島島阿學',
  imgLink: '/navlogo.png',
  link: '/assets/images/preview.jpeg',
};

const MathlogPage = () => {
  const router = useRouter();
  const { query, route } = router;
  const { state, actions } = useCategoyContext();
  const { loadNotionTable } = actions;
  const isLoading = state.loading.category;
  const onSearch = useCallback((name) => {
    const queryString = name ? `?tags=${name}` : '';
    router.push(`${route}${queryString}`);
  }, [query]);

  useEffect(() => {
    if (router.isReady) {
      loadNotionTable(CATEGORY_ID.mathlog, query);
    }
  }, [query]);
  return (
    <BodyWrapper>
      <Head>
        <SEO config={SEOConfig} />
      </Head>
      <Navigation />
      <PageContainer>
        <About
          tagList={SEARCH_TAGS.mathlog}
          cardList={state.category}
          isLoading={isLoading}
          length={state.category.length}
          onSearch={onSearch}
        />
        <SiderBar />
      </PageContainer>
      <Footer text="Tomorrow will be fine. 島島阿學 © 2021." />
    </BodyWrapper>
  );
};

export default MathlogPage;
