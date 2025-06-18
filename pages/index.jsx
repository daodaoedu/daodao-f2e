import React, { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import SEOConfig from '../shared/components/SEO';
import Home from '../components/Home';
import { isFeatureEnabled } from '../utils/featureFlags';

// 動態載入新首頁組件
const NewHome = dynamic(() => import('../features/home/NewHomePage'), {
  loading: () => <div>Loading...</div>
});

const HomePage = () => {
  const router = useRouter();
  const [useNewHome, setUseNewHome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const SEOData = useMemo(
    () => ({
      title: '多元學習資源平台｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          url: 'https://www.daoedu.tw',
          potentialAction: {
            '@type': 'SearchAction',
            'query-input': 'required name=q',
            target: 'https://www.daoedu.tw/search?q={q}',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          url: 'https://www.daoedu.tw',
          logo: 'https://www.daoedu.tw/favicon-112.png',
        },
      ],
    }),
    [router?.asPath],
  );

  useEffect(() => {
    setUseNewHome(isFeatureEnabled('newHome'));
    setIsLoading(false);
  }, [router.asPath]);

  // 顯示載入狀態
  if (isLoading) {
    return (
      <>
        <SEOConfig {...SEOData} />
        <div className="min-h-screen bg-basic-100 flex items-center justify-center">
          <div className="text-basic-400">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOConfig {...SEOData} />
      {useNewHome ? <NewHome /> : <Home />}
    </>
  );
};

export default HomePage;
