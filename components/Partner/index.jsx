import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Box, Typography, Button } from '@mui/material';
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
            <Box sx={{ minHeight: '100vh', padding: '5%' }}>
              找夥伴功能架構與維運中，如果你們希望加速開發的腳步的話，歡迎一起加入團隊共同協作！
              <Box
                sx={{
                  margin: '20px 0 10px 0',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() =>
                    window.open('https://forms.gle/if2kwAEQkeaTUgm37', '_blank')
                  }
                  sx={{ margin: '0 10px' }}
                >
                  <Typography variant="p">加入團隊</Typography>
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    window.open(
                      'https://g0v.hackmd.io/@daodaoedu/HydZGAUYc',
                      '_blank',
                    )
                  }
                  sx={{ margin: '0 10px' }}
                >
                  <Typography variant="p">了解更多</Typography>
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    window.open('https://www.daoedu.tw/about', '_blank')
                  }
                  sx={{ margin: '0 10px' }}
                >
                  <Typography variant="p">關於島島</Typography>
                </Button>
              </Box>
            </Box>
            {/* <PartnerList list={partnerList} /> */}
          </Box>
        </Box>
      </PartnerWrapper>
    </>
  );
}

export default Partner;
