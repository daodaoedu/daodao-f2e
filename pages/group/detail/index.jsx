import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import SEOConfig from '@/shared/components/SEO';
import GroupDetail from '@/components/Group/detail';
import GroupEmpty from '@/components/Group/detail/Empty';
import useFetch from '@/hooks/useFetch';

function GroupPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data, isFetching, isError } = useFetch(`/activity/${id}`, {
    enabled: !!id,
  });
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
      {(id || isFetching) && !isError ? (
        <GroupDetail id={id} source={source} isLoading={isFetching} />
      ) : (
        <GroupEmpty />
      )}
    </>
  );
}

export default GroupPage;
