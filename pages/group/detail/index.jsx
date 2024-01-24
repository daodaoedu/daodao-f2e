import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import SEOConfig from '@/shared/components/SEO';
import GroupDetail from '@/components/Group/detail';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import useFetch from '@/hooks/useFetch';

function GroupPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data, isFetching } = useFetch(
    `https://daodao-server.vercel.app/activity/65ad345f4883b304b2df7c08`,
  );
  const source = data?.data?.[0];

  const SEOData = useMemo(
    () => ({
      title: `${source?.title || '揪團詳細'}｜島島阿學`,
      description: source?.description,
      keywords: '島島阿學',
      author: `${source?.user?.name} | 島島阿學`,
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath, source],
  );

  return (
    <>
      <SEOConfig data={SEOData} />
      <Navigation />
      <GroupDetail source={source} isLoading={isFetching} />
      <Footer />
    </>
  );
}

export default GroupPage;
