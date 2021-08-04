import React, { useEffect, useCallback } from 'react';
import Head from 'next/head';
import styled from '@emotion/styled';
import { useDispatch, useSelector } from 'react-redux';
import Footer from '../../../../shared/components/footer';
import PageContainer from '../../../../shared/containers/Page';
import Navigation from '../../../../shared/components/navigation';
import About from '../../../../components/category/About';
import { SEARCH_TAGS, CATEGORY_ID } from '../../../../constants/category';
import SEO from '../../../../shared/components/seo';
import { loadNotionTable } from '../../../../redux/actions/category';

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const LanglitPage = ({ router, SEOConfig }) => {
  const dispatch = useDispatch();
  const { loading, category } = useSelector((state) => state.category);
  const { query, route } = router;
  const isLoading = loading?.category;

  const onSearch = useCallback((name) => {
    const queryString = name ? `?tags=${name}` : '';
    router.push(`${route}${queryString}`);
  }, [query]);

  useEffect(() => {
    if (router.isReady) {
      dispatch(loadNotionTable(CATEGORY_ID.life, query));
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
          tagList={SEARCH_TAGS.life}
          cardList={category}
          isLoading={isLoading}
          length={category.length}
          onSearch={onSearch}
        />
      </PageContainer>
      <Footer text="Tomorrow will be fine. 島島阿學 © 2021." />
    </BodyWrapper>
  );
};

export default LanglitPage;
