import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

import styled from '@emotion/styled';
import { Box } from '@mui/material';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import Profile from '@/components/Profile';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  const user = {
    name: '黃芊宇',
    educationStepLabel: '大學',
    tagList: [
      '實驗教育實驗教育',
      '標籤最多是八個字',
      '前端工程師',
      '後端工程師',
      '太多標籤第二行',
      '戶外運動',
    ],
    photoURL: 'https://i.imgur.com/QpMVwqe.png',
    location: '台北市松山區',
  };

  const fetchUser = async () => {
    console.log(id);
  };
  useEffect(() => {
    fetchUser();
  });

  return (
    <HomePageWrapper>
      <Navigation />
      <Profile {...user} />
      <Footer />
    </HomePageWrapper>
  );
};

export default index;
