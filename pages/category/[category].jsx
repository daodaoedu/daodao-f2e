import React, { useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/router';
import Footer from "../../shared/components/footer";
import PageContainer from "../../shared/containers/Page";
import Navigation from "../../shared/components/navigation";
import About from "../../components/category/About";
import { CATEGORY_ID } from "../../constants/category";
import { loadNotionTable } from "../../redux/actions/category";
import Header from "../../shared/components/Header";

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const SearchPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, category } = useSelector((state) => state.category);
  const currentCategory = useMemo(() => router.query.category, [router.query]);
  useEffect(() => {
    if (router.isReady) {
      dispatch(loadNotionTable(CATEGORY_ID[currentCategory], router.query));
    }
  }, [router.query]);

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
        <About
          categoryType={currentCategory}
          cardList={category}
          isLoading={isLoading}
        />
      </PageContainer>
      <Footer text="Tomorrow will be fine. 島島阿學 © 2021." />
    </BodyWrapper>
  );
};

export default SearchPage;
