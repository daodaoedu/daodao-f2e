import React, { FC } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import SEOConfig from '@/shared/components/SEO';

// 使用動態導入，避免服務器端渲染問題
const ExploreComponent = dynamic(() => import('@/components/Explore'), {
  ssr: false,
  loading: () => <div className="container mx-auto px-4 py-8 text-center">正在載入探索頁面...</div>
});

const ExplorePage: FC = () => {
  const router = useRouter();

  const SEOData = {
    title: '探索學習資源 | 島島阿學',
    description: '探索島島阿學平台上的各類學習資源、學習計畫與想法，發現你感興趣的內容',
    keywords: '島島阿學, 學習資源, 探索, 學習計畫, 學習社群',
    author: '島島阿學',
    copyright: '島島阿學',
    imgLink: 'https://www.daoedu.tw/preview.webp',
    link: `${process.env.HOSTNAME}${router?.asPath}`,
  };

  return (
    <>
      <SEOConfig data={SEOData} />
      <ExploreComponent key={`explore-component-${new Date().getTime()}`} />
    </>
  );
};

// 告訴Next.js不要快取該頁面
export const config = {
  unstable_runtimeJS: true, // 啟用運行時JS
};

export default ExplorePage;
