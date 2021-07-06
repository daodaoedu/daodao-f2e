import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// import Image from 'next/image';
import { css } from '@emotion/css';
import PageContainer from '../shared/containers/Page';
import Navigation from '../shared/components/navigation';
import Footer from '../shared/containers/Footer';
import SEO from '../shared/components/seo';
import CardList from '../components/home/CardList';

const SEOConfig = {
  title: '島島阿學 - 學習資源平台 - Daodao Online Learning Platform',
  description: '「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
  keywords: '島島阿學',
  author: '島島阿學',
  copyright: '島島阿學',
  imgLink: '',
  link: '',
};

const list = [
  {
    title: '語言與文學',
    link: '',
  },
  {
    title: '數學與邏輯',
    link: '',
  },
  {
    title: '電腦科學',
    link: '',
  },
  {
    title: '自然科學',
    link: '',
  },
  {
    title: '人文社會',
    link: '',
  },
  {
    title: '藝術',
    link: '',
  },
  {
    title: '教育',
    link: '',
  },
  {
    title: '生活',
    link: '',
  },
  {
    title: '運動/心理/醫學',
    link: '',
  },
  {
    title: '商業與社會創新',
    link: '',
  },
  {
    title: '綜合型學習資源',
    link: '',
  },
];

const Home = () => {
  const router = useRouter();
  console.log('router', router);
  return (
    <div>
      <Head>
        <SEO config={SEOConfig} />
        {/* https://resources.daoedu.tw/media/2021/02/118222653_116618533489352_6821261858468995250_o.jpg */}
      </Head>
      <Navigation>
        nav
      </Navigation>
      <PageContainer>
        <div className={css`
          display: flex;
        `}
        >
          <img
            className={css`
              width: 130px; 
              margin-right: 20px;
            `}
            src="https://resources.daoedu.tw/media/2021/02/640x640.png"
            alt=""
          />
          <div className={css`
              display: flex; 
              flex-direction: column;
            `}
          >
            <h1 className={css`
              font-size: 32px; 
              font-weight: 300;
              margin: 10px 0;
            `}
            >
              歡迎來到島島阿學！一起找找資源、共編資源吧
            </h1>
            <p className={css`
                font-size: 20px; 
                font-weight: 300;
                line-height: 30px;
              `}
            >
              If you want to go fast go alone.
              <br />
              If you want to go far go together.
              <br />
            </p>
          </div>
        </div>
        <p>今晚，要不要來點＿＿的學習資源？ (點進去即可看到各領域的資源)</p>
        <CardList list={list} />
      </PageContainer>
      <Footer>
        123
      </Footer>
    </div>
  );
};

export default Home;
