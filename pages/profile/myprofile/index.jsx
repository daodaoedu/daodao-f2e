import React from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import Profile from '@/components/Profile';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const MyProfilePage = () => {
  const user = useSelector((state) => state.user);

  return <Profile {...user} enableContactBtn={false} sendEmail={user.email} />;
};

MyProfilePage.getLayout = ({ children }) => {
  return (
    <HomePageWrapper>
      <Navigation />
      {children}
      <Footer />
    </HomePageWrapper>
  );
};

export default MyProfilePage;
