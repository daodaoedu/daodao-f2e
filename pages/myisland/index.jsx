import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import SEOConfig from '../../shared/components/SEO';
import MyIsland from '../../components/MyIsland';
import Navigation from '../../shared/components/Navigation_v2';
import Footer from '../../shared/components/Footer_v2';
// import logger from "../utils/logger";

const MyIslandPageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const MyIslandPage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '我的島島｜島島阿學',
      description:
        '「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );

  return (
    <>
      <SEOConfig data={SEOData} />
      <MyIsland />
    </>
  );
};

MyIslandPage.getLayout = ({ children }) => {
  return (
    <MyIslandPageWrapper>
      <Navigation />
      {children}
      <Footer />
    </MyIslandPageWrapper>
  );
};

export default MyIslandPage;
