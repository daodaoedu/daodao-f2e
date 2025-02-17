import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Box } from '@mui/material';
import { useAuth } from '@/contexts/Auth';
import { useSnackbar } from '@/contexts/Snackbar';
import useFetch from '@/hooks/useFetch';
import useMutation from '@/hooks/useMutation';
import SEOConfig from '@/shared/components/SEO';
import GroupForm from '@/components/Group/Form';

function EditGroupPage() {
  const { pushSnackbar } = useSnackbar();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const { data, isFetching } = useFetch(`/circles/${id}`, {
    enabled: !!id,
  });
  const source = {
    ...data?.data?.[0],
    content: data?.data?.[0]?.content || data?.data?.[0]?.description,
  };

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

  const { mutate, isLoading } = useMutation(`/circles/${id}`, {
    method: 'PUT',
    onSuccess: () => {
      pushSnackbar({ message: '已發布修改' });
      router.replace('/personal-card/my-card');
    },
  });

  useEffect(() => {
    if (!user?._id) router.push('/login');
    if (isFetching || !source?.userId) return;
    if (source.userId !== user._id) router.replace(`/group/detail?id=${id}`);
  }, [user, source, isFetching, id]);

  return (
    <>
      <SEOConfig data={SEOData} />
      <Box minHeight="60vh">
        {source?.userId && (
          <GroupForm
            defaultValues={source}
            isLoading={isLoading}
            onSubmit={mutate}
          />
        )}
      </Box>
    </>
  );
}

export default EditGroupPage;
