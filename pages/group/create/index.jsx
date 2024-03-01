import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import GroupForm from '@/components/Group/Form';
import useMutation from '@/hooks/useMutation';
import SEOConfig from '@/shared/components/SEO';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import { GROUP_API_URL } from '@/redux/actions/group';

function CreateGroupPage() {
  const router = useRouter();

  const SEOData = useMemo(
    () => ({
      title: '發起揪團｜島島阿學',
      description:
        '「島島阿學」揪團專區，結交志同道合的學習夥伴！發起各種豐富多彩的揪團活動，共同探索學習的樂趣。一同參與，共同成長，打造學習的共好社群。加入我們，一起開啟學習的冒險旅程！',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );

  const { mutate, isLoading } = useMutation(
    (values) =>
      fetch(GROUP_API_URL, {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    {
      onSuccess: router.replace('/profile'),
    },
  );

  return (
    <>
      <SEOConfig data={SEOData} />
      <Navigation />
      <GroupForm mode="create" isLoading={isLoading} onSubmit={mutate} />
      <Footer />
    </>
  );
}

export default CreateGroupPage;
