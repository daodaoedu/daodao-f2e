import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import SEOConfig from '@/shared/components/SEO';
import Group from '@/components/Group';

function GroupPage() {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '揪團學習列表｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
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
      <Group />
    </>
  );
}

export default GroupPage;
