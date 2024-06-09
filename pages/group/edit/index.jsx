import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { Box, CircularProgress } from '@mui/material';
import GroupForm from '@/components/Group/Form';
import { useSnackbar } from '@/contexts/Snackbar';
import useFetch from '@/hooks/useFetch';
import useMutation from '@/hooks/useMutation';
import SEOConfig from '@/shared/components/SEO';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';

function EditGroupPage() {
  const { pushSnackbar } = useSnackbar();
  const router = useRouter();
  const me = useSelector((state) => state.user);
  const { id } = router.query;
  const { data, isFetching } = useFetch(`/activity/${id}`, {
    enabled: !!id,
  });
  const source = data?.data?.[0];

  const SEOData = useMemo(
    () => ({
      title: '編輯揪團｜島島阿學',
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

  const goToDetail = () => router.replace(`/group/detail?id=${id}`);

  const { mutate, isLoading } = useMutation(`/activity/${id}`, {
    method: 'PUT',
    onSuccess: () => {
      pushSnackbar({ message: '已發布修改' });
      router.replace('/profile?id=my-group');
    },
  });

  useEffect(() => {
    if (!me?._id) router.push('/login');
    if (isFetching) return;
    if (source?.userId !== me._id) goToDetail();
  }, [me, source, isFetching, id]);

  return (
    <>
      <SEOConfig data={SEOData} />
      <Navigation />
      {isFetching && (
        <Box
          sx={{
            position: 'fixed',
            bgcolor: '#3333',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <GroupForm
        defaultValues={source}
        isLoading={isLoading}
        onSubmit={mutate}
      />
      <Footer />
    </>
  );
}

export default EditGroupPage;
