import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import SEOConfig from '../../../shared/components/SEO';
import Profile from '../../../components/Profile';
import Navigation from '../../../shared/components/Navigation_v2';
import Footer from '../../../shared/components/Footer_v2';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
  background: #f3fcfc;
`;

function PartnerPage({ userId }) {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '夥伴的島｜島島阿學',
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

  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  return (
    <HomePageWrapper>
      <SEOConfig data={SEOData} />
      <Navigation />
      <Profile userId={userId} />
      <Footer />
    </HomePageWrapper>
  );
}

export async function getStaticProps({ params }) {
  // params.id 包含动态路由参数的值
  const { userId } = params;

  return {
    props: {
      userId,
    },
  };
}

export async function getStaticPaths() {
  // ...

  // fallback: true means that the missing pages
  // will not 404, and instead can render a fallback.
  return { paths: [], fallback: 'blocking' };
}

// PartnerPage.getInitialProps = ({ query }) => {
//   return { userId: query.userId };
// };

export default PartnerPage;
