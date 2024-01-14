import React from 'react';
import styled from '@emotion/styled';
import Navigation from '../../../shared/components/Navigation_v2';
import Footer from '../../../shared/components/Footer_v2';
import Profile from '../../../components/Profile';
import { useSelector } from 'react-redux';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const ProfilePage = () => {
  const user = useSelector((state) => state.user);

  return (
    <HomePageWrapper>
      <Navigation />
      <Profile {...user} enableContactBtn={false} sendEmail={user.email} />
      <Footer />
    </HomePageWrapper>
  );
};

export default ProfilePage;
