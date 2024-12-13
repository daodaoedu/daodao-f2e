import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

import styled from '@emotion/styled';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import Profile from '@/components/Profile';
import {
  clearPartnerState,
  fetchPartnerById,
} from '@/redux/actions/partners';

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
  const { email } = useSelector((state) => state?.user);

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
      isMe={partner?.email === email}
    />
  );
};

PartnerDetailPage.getLayout = ({ children }) => {
  return (
    <HomePageWrapper>
      <Navigation />
      {children}
      <Footer />
    </HomePageWrapper>
  );
};

export default PartnerDetailPage;
