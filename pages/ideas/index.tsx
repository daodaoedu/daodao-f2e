import React from 'react';
import SEOConfig from '@/components/SEOConfig';
import { IdeasFeature } from '@/features/ideas';

const IdeasPage: React.FC = () => {
  const seoData = {
    title: 'Ideas Sharing Platform | 想法分享平台 | 島島阿學',
    description:
      '分享你的學習洞察和創新想法，與島友們一起成長。「島島阿學」提供多元的學習資源網絡，讓自主學習者能找到合適的成長方法。',
    keywords: '想法分享,創新思維,學習洞察,島島阿學,Ideas,Creative Thinking',
    author: '島島阿學',
    copyright: '島島阿學',
    imgLink: 'https://www.daoedu.tw/preview.webp',
    link: `${process.env.HOSTNAME}/ideas`,
  };

  return (
    <>
      <SEOConfig {...seoData} />
      <IdeasFeature />
    </>
  );
};

export default IdeasPage;
