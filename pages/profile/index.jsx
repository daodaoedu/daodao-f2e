import React from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import Navigation from '../../shared/components/Navigation_v2';
import Footer from '../../shared/components/Footer_v2';
import Profile from '../../components/Profile';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

function ProfilePage() {
  return (
    <HomePageWrapper>
      <Navigation />
      <Profile />
      <Footer />
    </HomePageWrapper>
  );
}

export default ProfilePage;
