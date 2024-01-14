import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

import styled from '@emotion/styled';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import Profile from '@/components/Profile';

import { fetchPartnerById } from '@/redux/actions/partners';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const Detail = () => {
  const dispatch = useDispatch();
  const { partner } = useSelector((state) => state?.partners);
  const { email: loginUserEmail } = useSelector((state) => state?.user);

  const router = useRouter();
  const { id } = router.query;

  const fetchUser = async () => {
    dispatch(fetchPartnerById({ id }));
  };
  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  return (
    <HomePageWrapper>
      <Navigation />
      <Profile
        {...partner}
        sendEmail={loginUserEmail}
        enableContactBtn={!!loginUserEmail}
      />
      <Footer />
    </HomePageWrapper>
  );
};

export default Detail;
