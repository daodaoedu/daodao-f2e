import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import SEOConfig from '../../shared/components/SEO';
import Navigation from '../../shared/components/Navigation_v2';
import IPRTerms from '../../components/IPRTerms';
import Footer from '../../shared/components/Footer_v2';

const IPRPage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '使用者條款與隱私權政策｜島島阿學',
      description:
        '感謝您有意願貢獻資料及相關內容（以下統稱「內容」）至島島阿學學習社群（https://www.daoedu.tw，以下簡稱「本網站」）。此使用者條款存在於您及本網站管理機關島島阿學學習社群（「管理者」）間，目的在釐清雙方相關智慧財產權利狀態及其他權利義務關係。請閱讀以下條款及條件並確認，當您上傳內容至本網站時，即表示您接受本協議內容。',
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
      <Navigation />
      <IPRTerms />
      <Footer />
    </>
  );
};

export default IPRPage;
