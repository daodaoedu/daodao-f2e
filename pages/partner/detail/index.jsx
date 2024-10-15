import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

import styled from '@emotion/styled';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import Profile from '@/components/Profile';
import ContactModal from '@/components/Profile/Contact';
import {
  clearPartnerState,
  sendEmailToPartner,
  fetchPartnerById,
} from '@/redux/actions/partners';
import toast from 'react-hot-toast';
import { ROLE } from '@/constants/member';
import { mapToTable } from '@/utils/helper';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const ROLELIST = mapToTable(ROLE);

const PartnerDetailPage = () => {
  const router = useRouter();
  const { id: partnerId } = router.query;

  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  // get partner info
  const { partner } = useSelector((state) => state?.partners);
  const partnerRole = useMemo(() => {
    return partner?.roleList && partner.roleList.length > 0
      ? ROLELIST[partner.roleList[0]]
      : '';
  }, [partner]);

  // fetch login user info
  const {
    _id,
    email,
    name,
    roleList,
    photoURL,
    email: loginUserEmail,
  } = useSelector((state) => state?.user);

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

  // modal handle
  const handleOnOk = ({ message, contact }) => {
    dispatch(
      sendEmailToPartner({
        userId: _id,
        from: email,
        to: partner.email,
        name,
        roleList:
          roleList.length > 0 ? roleList.map((role) => ROLELIST[role]) : [''],
        photoURL,
        text: message,
        information: [loginUserEmail, contact],
      }),
    );
    setOpen(false);
    toast.success('寄送成功');
  };

  return (
    <>
      {!!partner && (
        <ContactModal
          open={open}
          title={partner?.name}
          descipt={partnerRole || '-'}
          avatar={partner?.photoURL}
          onClose={() => {
            setOpen(false);
          }}
          onOk={handleOnOk}
        />
      )}

      <Profile
        {...partner}
        isLoading={!partner}
        sendEmail={loginUserEmail}
        enableContactBtn={!!loginUserEmail}
        handleContactPartner={() => setOpen(true)}
      />
    </>
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
