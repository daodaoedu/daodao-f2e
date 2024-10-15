import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import SEOConfig from '../../shared/components/SEO';
import About from '../../components/About';

const AboutPage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '關於島島｜島島阿學',
      description:
        '在島島阿學裡，每個人都是一座獨一無二的「島」，對於學習／生命擁有不同的渴望與資源，因為互相、互助學習，成為一片獨立又連結的群島。而島島阿學也希望能有台語「沓沓仔學Ta̍uh-ta̍uh-á o̍h」，「慢慢學不用急」之意涵，道出組織的教育價值觀是以人為本，尊重每人學習步調與方向。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '如何在島島查看資源?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '進入<a href="https://www.daoedu.tw/search" target="_blank" rel="noreferrer">找資源頁面</a>即可搜尋資源',
            },
          },
          {
            '@type': 'Question',
            name: '如何加入島島社群?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '進入<a href="https://www.facebook.com/groups/2237666046370459" target="_blank" rel="noreferrer">島島學習社群</a>即可加入',
            },
          },
          {
            '@type': 'Question',
            name: '如何新增學習資源?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '進入<a href="https://www.daoedu.tw/contribute/resource" target="_blank" rel="noreferrer">新增資源頁面</a>即可新增',
            },
          },
        ],
      },
    }),
    [router?.asPath],
  );

  return (
    <>
      <SEOConfig data={SEOData} />
      <About />
    </>
  );
};

export default AboutPage;
