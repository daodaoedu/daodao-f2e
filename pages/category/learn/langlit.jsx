import React, { useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import Footer from '../../../shared/containers/Footer';
import PageContainer from '../../../shared/containers/Page';
import Navigation from '../../../shared/components/navigation';
import SEO from '../../../shared/components/seo';
import SiderBar from '../../../components/home/RightSiderBar';
import { useCategoyContext, CategoyProvider } from '../../../contexts/CategoyContext';
import CardList from '../../../components/category/CardList';
import TagList from '../../../shared/components/TagList';
import { SEARCH_TAGS, CATEGORY_ID } from '../../../constants/category';

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const SEOConfig = {
  title: '島島阿學 - 學習資源平台 - Daodao Online Learning Platform',
  description: '「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
  keywords: '島島阿學',
  author: '島島阿學',
  copyright: '島島阿學',
  imgLink: 'https://resources.daoedu.tw/media/2020/08/1597934192-e1624a7b0d09ec164a2887ab2880f4c1.png',
  link: '/assets/images/preview.jpeg',
};

const ContextPageWrapper = () => {
  return (
    <CategoyProvider>
      <MathlogPage />
    </CategoyProvider>
  );
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
      loadNotionTable(CATEGORY_ID.langlit, query);
    }
  }, [query]);

  return (
    <BodyWrapper>
      <div>
        <Head>
          <SEO config={SEOConfig} />
          {/* https://resources.daoedu.tw/media/2021/02/118222653_116618533489352_6821261858468995250_o.jpg */}
        </Head>
        <Navigation>
          nav
        </Navigation>
        <PageContainer>
          <div
            className={css`width: 70vw;`}
          >
            <h1>語言與文學</h1>
            <p>這個分類下的所有標籤：</p>
            <TagList
              list={SEARCH_TAGS.langlit}
              onSearch={onSearch}
            />
            <h2>
              搜尋結果
              {' '}
              {isLoading ? '-' : state.category.length}
              {' '}
              筆：
            </h2>
            <CardList
              list={state.category}
              loading={isLoading}
            />
          </div>
          <div>
            <SiderBar />
          </div>
        </PageContainer>
        <Footer>
          123
        </Footer>
      </div>
    </BodyWrapper>
  );
};

export default ContextPageWrapper;
