import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

import styled from '@emotion/styled';
import Navigation from '@/shared/components/Navigation';
import Footer from '@/shared/components/Footer_v2';
import Profile from '@/components/Profile';
import {
  clearPartnerState,
  fetchPartnerById,
} from '@/redux/actions/partners';
import { useAuth } from '@/contexts/Auth';
import { NavigationProvider } from '@/contexts/Navigation';
import { PromotionProvider } from '@/contexts/Promotion';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const PartnerDetailPage = () => {
  const router = useRouter();
  const { id: partnerId } = router.query;

  const dispatch = useDispatch();

  // get partner info
  const { partner } = useSelector((state) => state?.partners);

  // fetch login user info
  const { user } = useAuth();

  const fetchUser = async () => {
    dispatch(fetchPartnerById({ id: partnerId }));
  };

  useEffect(() => {
    if (partnerId !== undefined) {
      fetchUser();
    }
    return () => {
      dispatch(clearPartnerState());
    };
  }, [partnerId]);

  return (
    <Profile
      {...partner}
      isLoading={!partner}
      isMe={partner?.email === user?.email}
    />
  );
};

PartnerDetailPage.getLayout = ({ children }) => {
  return (
    <HomePageWrapper>
      <PromotionProvider>
        <NavigationProvider>
          <Navigation />
        </NavigationProvider>
      </PromotionProvider>
      {children}
      <Footer />
    </HomePageWrapper>
  );
};

export default PartnerDetailPage;
