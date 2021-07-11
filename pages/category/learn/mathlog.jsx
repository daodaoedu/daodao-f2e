import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// import Image from 'next/image';
// import { css } from '@emotion/css';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import Footer from '../../../shared/containers/Footer';
import PageContainer from '../../../shared/containers/Page';
import Navigation from '../../../shared/components/navigation';
import SEO from '../../../shared/components/seo';
import SiderBar from '../../../components/home/RightSiderBar';
import { useCategoyContext, CategoyProvider } from '../../../contexts/CategoyContext';
import CardList from '../../../components/category/CardList';

// export const getStaticProps = async () => {

// }

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
  const { state, actions } = useCategoyContext();
  const { loadNotionTable } = actions;
  const categoryId = 'da015b1a389b43cda9f01876294064e0';
  console.log(router);
  useEffect(() => {
    loadNotionTable(categoryId);
  }, []);
  console.log('state.category ', state.category);
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
            <h1>
              語言與文學
            </h1>
            <p>這個分類下的所有標籤：</p>
            <CardList list={state.category} loading={state.loading.category} />
            {/* <iframe
            title="langlit"
            className="airtable-embed"
            src="https://airtable.com/embed/shry1mqxVqP4U2lqK?backgroundColor=purple&viewControls=on"
            frameBorder="0"
            width="100%"
            height="533"
            style={{ background: 'transparent', border: '1px solid #ccc' }}
          /> */}
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
