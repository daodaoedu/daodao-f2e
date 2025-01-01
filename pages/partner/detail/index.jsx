import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

import Profile from '@/components/Profile';
import {
  clearPartnerState,
  fetchPartnerById,
} from '@/redux/actions/partners';
import { useAuth } from '@/contexts/Auth';

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

export default PartnerDetailPage;
