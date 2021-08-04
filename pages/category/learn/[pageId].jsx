import React, { useEffect } from 'react';
import Head from 'next/head';
import styled from '@emotion/styled';
import { useDispatch, useSelector } from 'react-redux';
import Footer from '../../../shared/components/footer';
import PageContainer from '../../../shared/containers/Page';
import Navigation from '../../../shared/components/navigation';
import SEO from '../../../shared/components/seo';
import SiderBar from '../../../components/home/RightSiderBar';
import { loadNotionPage } from '../../../redux/actions/category';

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const LearingPage = ({ router, SEOConfig }) => {
  const dispatch = useDispatch();

  const { page } = useSelector((state) => state.category);
  const { query } = router;
  const { name, intro, link } = page;
  useEffect(() => {
    if (router.isReady) {
      dispatch(loadNotionPage(query.pageId));
    }
  }, [query]);
  return (
    <BodyWrapper>
      <Head>
        <SEO config={SEOConfig} />
      </Head>
      <Navigation />
      <PageContainer>
        <div>
          <p>{name}</p>
          <p>{intro}</p>
          <a href={link} target="_blank" rel="noreferrer">網站連結</a>
        </div>
        <SiderBar />
      </PageContainer>
      <Footer text="Tomorrow will be fine. 島島阿學 © 2021." />
    </BodyWrapper>
  );
};

export default LearingPage;
