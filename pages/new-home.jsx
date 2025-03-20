import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import SEOConfig from '../shared/components/SEO';
import NewHome from '../components/NewHome';

const NewHomePage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '多元學習資源平台｜島島阿學 - 新版首頁',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。',
      keywords: '島島阿學, 學習平台, 自主學習',
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
      <NewHome />
    </>
  );
};

export default NewHomePage;