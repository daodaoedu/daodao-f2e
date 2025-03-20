import React from 'react';
import Connect from '../../components/Connect';
import SEOConfig from '@/shared/components/SEO';
import { useRouter } from 'next/router';

export default function ConnectPage() {
  const router = useRouter();

  const SEOData = {
    title: '連結社群 | 島島阿學',
    description: '探索島島阿學平台上的各類學習社群與活動，加入圈組或參與活動',
    keywords: '島島阿學, 學習社群, 社群活動, 學習圈組',
    author: '島島阿學',
    copyright: '島島阿學',
    imgLink: 'https://www.daoedu.tw/preview.webp',
    link: `${process.env.HOSTNAME}${router?.asPath}`,
  };

  return (
    <>
      <SEOConfig data={SEOData} />
      <div className="container mx-auto px-4 py-8">
        <Connect />
      </div>
    </>
  );
}