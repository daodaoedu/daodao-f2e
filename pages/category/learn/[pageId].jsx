import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
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

const SEOConfig = {
  title: '島島阿學 - 學習資源平台 - Daodao Online Learning Platform',
  description: '「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
  keywords: '島島阿學',
  author: '島島阿學',
  copyright: '島島阿學',
  imgLink: '/navlogo.png',
  link: '/assets/images/preview.jpeg',
};

const LearingPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
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
