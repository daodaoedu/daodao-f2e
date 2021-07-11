import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// import Image from 'next/image';
import styled from '@emotion/styled';
import PageContainer from '../shared/containers/Page';
import Navigation from '../shared/components/navigation';
import Footer from '../shared/containers/Footer';
import SEO from '../shared/components/seo';
import CardList from '../components/home/CardList';
import Banner from '../components/home/Banner';
import RightSiderBar from '../components/home/RightSiderBar';
import LeftSiderBar from '../components/home/LeftSiderBar';

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

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
    link: '/category/learn/langlit',
    image: '/assets/images/cat1.jpeg',
  },
  {
    title: '數學與邏輯',
    link: '/category/learn/mathlog',
    image: '/assets/images/cat2.jpeg',
  },
  {
    title: '電腦科學',
    link: '/category/learn/infoeng',
    image: '/assets/images/cat3.jpeg',
  },
  {
    title: '自然科學',
    link: '/category/learn/natusci',
    image: '/assets/images/cat4.jpeg',
  },
  {
    title: '人文社會',
    link: '/category/learn/hum',
    image: '/assets/images/cat5.jpeg',
  },
  {
    title: '藝術',
    link: '/category/learn/art',
    image: '/assets/images/cat6.jpeg',
  },
  {
    title: '教育',
    link: '/category/learn/edu',
    image: '/assets/images/cat7.jpeg',
  },
  {
    title: '生活',
    link: '/category/learn/life',
    image: '/assets/images/cat8.jpeg',
  },
  {
    title: '運動/心理/醫學',
    link: '/category/learn/health',
    image: '/assets/images/cat9.jpeg',
  },
  {
    title: '商業與社會創新',
    link: '/category/learn/businv',
    image: '/assets/images/cat10.jpeg',
  },
  {
    title: '綜合型學習資源',
    link: '/category/learn/multi-res',
    image: '/assets/images/cat11.jpeg',
  },
];
const Home = () => {
  const router = useRouter();
  console.log('router', router);
  return (
    <BodyWrapper>
      <Head>
        <SEO config={SEOConfig} />
        {/* https://resources.daoedu.tw/media/2021/02/118222653_116618533489352_6821261858468995250_o.jpg */}
      </Head>
      <Navigation>
        nav
      </Navigation>
      <LeftSiderBar />
      <PageContainer>
        <div>
          <Banner />
          <p>今晚，要不要來點＿＿的學習資源？ (點進去即可看到各領域的資源)</p>
          <CardList list={list} />
        </div>
        <div>
          <RightSiderBar />
        </div>
      </PageContainer>
      <Footer>
        123
      </Footer>
    </BodyWrapper>
  );
};

export default Home;
