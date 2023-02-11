import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, updateProfile } from 'firebase/auth';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import PartnerList from './PartnerList';
import SearchField from './SearchField';
import Banner from './Banner';

const PartnerWrapper = styled.div`
  min-height: 100vh;
  background-color: transparent;
  z-index: 100;
  margin-top: -150px;
  position: relative;
`;

function Partner() {
  const router = useRouter();
  const [partnerList, setPartnerList] = useState([]);
  useEffect(() => {
    const db = getFirestore();
    const colRef = collection(db, 'partnerlist');
    getDocs(colRef).then((docsSnap) => {
      docsSnap.forEach((doc) => {
        setPartnerList((prevState) => [
          ...prevState,
          {
            id: doc.id,
            ...(doc.data() || {}),
          },
        ]);
        console.log(doc.id, ' => ', doc.data());
      });
    });
    // const test = collection('partnerlist').
    // console.log('test', test);
    // const docRef = doc(db, 'partnerlist', user?.uid);
    // getDoc(docRef).then((docSnap) => {
    //   const data = docSnap.data();
    //   setUserName(data?.userName || '');
    //   setPhotoURL(data?.photoURL || '');
    //   setBirthDay(dayjs(data?.birthDay) || dayjs());
    //   setGender(data?.gender || '');
    //   setRoleList(data?.roleList || []);
    //   setWantToLearnList(data?.wantToLearnList || []);
    //   setInterestAreaList(data?.interestAreaList || []);
    //   setEducationStep(data?.educationStep);
    //   setLocation(data?.location || '');
    //   setUrl(data?.url || '');
    //   setDescription(data?.description || '');
    //   setIsOpenLocation(data?.isOpenLocation || false);
    //   setIsOpenProfile(data?.isOpenProfile || false);
    // });
  }, [setPartnerList]);
  console.log('partnerList', partnerList);
  return (
    <>
      <Banner />
      <PartnerWrapper>
        <Box
          sx={{
            padding: '0 10%',
          }}
        >
          <Box
            sx={{
              marginTop: '24px',
              borderRadius: '20px',
              boxShadow: '0px 4px 6px rgba(196, 194, 193, 0.2)',
              padding: '40px',
              zIndex: 2,
              background: '#fff',
            }}
          >
            <SearchField />
          </Box>
          <Box
            sx={{
              marginTop: '24px',
              borderRadius: '20px',
              boxShadow: '0px 4px 6px rgba(196, 194, 193, 0.2)',
              background: '#fff',
            }}
          >
            <PartnerList list={partnerList} />
          </Box>
        </Box>
      </PartnerWrapper>
    </>
  );
}

export default Partner;
