import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SEOConfig from '../../components/SEOConfig';
import Activities from '../../components/Activities';

const ActivitiesPage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '找學習活動｜島島阿學',
      description:
        '你知道什麼活動，抑或是想主辦一個呢？ 歡迎來信至 daodaoedunetwork@gmail.com 讓好的活動被更多人看見！',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/assets/brand/horizontal-primary-logo.svg',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );

  return (
    <>
      <SEOConfig {...SEOData} />
      <Activities />
    </>
  );
};

export default ActivitiesPage;
