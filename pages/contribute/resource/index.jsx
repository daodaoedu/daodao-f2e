import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import SEOConfig from '../../../shared/components/SEO';
import ContributeResource from '../../../components/ContributeResource';

const ContributeResourcePage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '新增學習資源｜島島阿學',
      description:
        '我們期盼能邀請在各領域深耕已久的夥伴將自身累積的資源新增至教育資源網站，讓資源透明化。 若您願意一同共編，可至新增資源的表單新增資源，我們將會進行審核在新增至上方資料庫中',
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
      <ContributeResource />
    </>
  );
};

export default ContributeResourcePage;
