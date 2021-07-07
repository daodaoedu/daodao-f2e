import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PageContainer from '../shared/containers/Page';
import Navigation from '../shared/components/navigation';
import Footer from '../shared/containers/Footer';
import SEO from '../shared/components/seo';
import SiderBar from '../components/home/RightSiderBar';

const SEOConfig = {
  title: '島島阿學 - 學習資源平台 - Daodao Online Learning Platform',
  description: '「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
  keywords: '島島阿學',
  author: '島島阿學',
  copyright: '島島阿學',
  imgLink: '',
  link: '',
};

const Home = () => {
  const router = useRouter();
  console.log('router', router);
  return (
    <div>
      <Head>
        <SEO config={SEOConfig} />
        {/* https://resources.daoedu.tw/media/2021/02/118222653_116618533489352_6821261858468995250_o.jpg */}
      </Head>
      <Navigation />
      <PageContainer>
        <div>
          這個頁面還在建構唷～
        </div>
        <div>
          <SiderBar />
        </div>
      </PageContainer>
      <Footer>
        123
      </Footer>
    </div>
  );
};

export default Home;
