import React from 'react';
import styled from '@emotion/styled';
import { useAuth } from '@/contexts/Auth';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import Profile from '@/components/Profile';
import { NavigationProvider } from '@/contexts/Navigation';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const MyProfilePage = () => {
  const { user } = useAuth();

  return <Profile {...user} isMe />;
};

MyProfilePage.getLayout = ({ children }) => {
  return (
    <HomePageWrapper>
      <NavigationProvider>
        <Navigation />
      </NavigationProvider>
      {children}
      <Footer />
    </HomePageWrapper>
  );
};

export default MyProfilePage;
