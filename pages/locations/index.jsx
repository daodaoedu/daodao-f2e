import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SEOConfig from '../../components/SEOConfig';
import Locations from '../../components/Locations';

const LocationsPage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '實驗教育場域導覽｜島島阿學',
      description:
        '「島島阿學」盼能透過建立學習資源網絡，讓自主學習者能找到合適的成長方法，進而成為自己想成為的人，並從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
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
      <Locations />
    </>
  );
};

export default LocationsPage;
