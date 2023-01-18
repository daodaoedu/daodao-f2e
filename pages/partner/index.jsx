import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import SEOConfig from '../../shared/components/SEO';
import Partner from '../../components/Partner';
import Navigation from '../../shared/components/Navigation_v2';
import Footer from '../../shared/components/Footer_v2';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const PartnerPage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '夥伴的島群列表｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      // structuredData: [
      //   {
      //     '@context': 'https://schema.org',
      //     '@type': 'WebSite',
      //     url: 'https://www.daoedu.tw',
      //     potentialAction: {
      //       '@type': 'SearchAction',
      //       'query-input': 'required name=q',
      //       target: 'https://www.daoedu.tw/partner?q={q}',
      //     },
      //   },
      //   {
      //     '@context': 'https://schema.org',
      //     '@type': 'Organization',
      //     url: 'https://www.daoedu.tw',
      //     logo: 'https://www.daoedu.tw/favicon-112.png',
      //   },
      // ],
    }),
    [router?.asPath],
  );

  return (
    <HomePageWrapper>
      <SEOConfig data={SEOData} />
      <Navigation />
      <Partner />
      <Footer />
    </HomePageWrapper>
  );
};

export default PartnerPage;
