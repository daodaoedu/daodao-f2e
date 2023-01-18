import React, { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import Script from 'next/script';
import {
  Box,
  Typography,
  Button,
  Skeleton,
  TextField,
  Divider,
  Switch,
  TextareaAutosize,
  Chip,
} from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, updateProfile } from 'firebase/auth';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import toast from 'react-hot-toast';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
} from 'firebase/firestore';
import SEOConfig from '../../shared/components/SEO';
import Navigation from '../../shared/components/Navigation_v2';
import Footer from '../../shared/components/Footer_v2';
import { WANT_TO_DO_WITH_PARTNER, CATEGORIES } from '../../constants/member';
import { mapToTable } from '../../utils/helper';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const BottonBack = {
  color: '#536166',
  position: 'relative',
  left: '-20%',
  top: '10%',
  boxShadow:'unset',
  '&:hover': {
    color: '#16B9B3'
  },
};

const Tag = ({ label }) => (
  <Chip
    label={label}
    value={label}
    sx={{
      backgroundColor: '#fff',
      opacity: '80%',
      cursor: 'pointer',
      margin: '5px',
      whiteSpace: 'nowrap',
      fontWeight: 500,
      fontSize: '16px',
      bgcolor: 'rgb(219, 237, 219)',
      '&:hover': {
        opacity: '100%',
        backgroundColor: '#fff',
        transition: 'transform 0.4s',
      },
    }}
  />
);

const ProfilePage = () => {
  const router = useRouter();
  const auth = getAuth();
  const [user, isLoading] = useAuthState(auth);
  const [userName, setUserName] = useState('');
  const [description, setDescription] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [wantToLearnList, setWantToLearnList] = useState([]);
  const [interestAreaList, setInterestAreaList] = useState([]);
  useEffect(() => {
    if (!isLoading) {
      setUserName(user?.displayName || '');
      setPhotoURL(user?.photoURL || '');
      const db = getFirestore();
      if (user?.uid) {
        const docRef = doc(db, 'user', user?.uid);
        getDoc(docRef).then((docSnap) => {
          const data = docSnap.data();
          // console.log('data', data);
          setUserName(data?.userName || '');
          setPhotoURL(data?.photoURL || '');
          setDescription(data?.description || '');
          setWantToLearnList(data?.wantToLearnList || []);
          setInterestAreaList(data?.interestAreaList || []);
        });
      }
    }
  }, [user, isLoading]);
  const SEOData = useMemo(
    () => ({
      title: '許浪手的小島｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );

  const tagList = interestAreaList.map((item) => mapToTable(CATEGORIES)[item]);
  // ('衝浪', '還是衝浪', '開車', '買車', '司機', '打電話')

  return (
    <HomePageWrapper>
      <Script src="https://meet.jit.si/external_api.js" />
      <SEOConfig data={SEOData} />
      <Navigation />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button variant="text" sx={BottonBack} onClick={() => {
                  router.push('/partner');
                }}>
          <ChevronLeftIcon />
          返回
        </Button>
        <Box
          sx={{
            width: '720px',
            padding: '40px 30px ',
            bgcolor: '#fff',
            borderRadius: '20px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <LazyLoadImage
              alt="login"
              src={
                photoURL ||
                'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3VyZnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60'
              }
              height={80}
              width={80}
              effect="opacity"
              style={{
                borderRadius: '100%',
                background: 'rgba(240, 240, 240, .8)',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              placeholder={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <Skeleton
                  sx={{
                    height: '80px',
                    width: '80px',
                    background: 'rgba(240, 240, 240, .8)',
                    marginTop: '4px',
                  }}
                  variant="circular"
                  animation="wave"
                />
              }
            />

            <Box sx={{ marginLeft: '12px' }}>
              <Typography sx={{ color: '#536166', fontSize: '18px' }}>
                {userName || '許浪手'}
              </Typography>
              <Typography component="p" sx={{ color: '#92989A' }}>
                自學生
              </Typography>
              <Typography
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginTop: '12px',
                }}
              >
                <LocationOnOutlinedIcon sx={{ marginRight: '10px' }} />{' '}
                台北市松山區
              </Typography>
            </Box>
          </Box>
          <Box sx={{ marginTop: '24px' }}>
            {tagList.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            width: '720px',
            padding: '40px 30px ',
            marginTop: '10px',
            bgcolor: '#fff',
            borderRadius: '20px',
          }}
        >
          <Box>
            <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
              可分享
            </Typography>
            <Typography sx={{ marginLeft: '12px' }}>自學心得</Typography>
          </Box>
          <Divider sx={{ color: '#F3F3F3', margin: '6px 0' }} />
          <Box>
            <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
              想一起
            </Typography>
            <Typography sx={{ marginLeft: '12px' }}>
              {wantToLearnList
                .map((item) => mapToTable(WANT_TO_DO_WITH_PARTNER)[item])
                .join(', ') ||
                '衝浪、還有衝浪、或是找別人衝浪、交更多朋友一起衝浪'}
            </Typography>
          </Box>
          <Divider sx={{ color: '#F3F3F3', margin: '6px 0' }} />
          <Box>
            <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
              網站
            </Typography>
            <Typography sx={{ marginLeft: '12px' }}>xxx</Typography>
          </Box>
          <Divider sx={{ color: '#F3F3F3', margin: '6px 0' }} />
          <Box>
            <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
              簡介
            </Typography>
            <Typography component="p" sx={{}}>
              {description || '開車去衝浪，偶而開出去衝浪'}
            </Typography>
          </Box>
        </Box>
        <Button
          sx={{
            marginTop: '24px',
            width: '160px',
            borderRadius: '20px',
            color: '#fff',
            bgcolor: '#16B9B3',
            boxShadow: '0px 4px 10px rgba(89, 182, 178, 0.5)',
          }}
          variant="outlined"
          onClick={() => {}}
        >
          加好友
        </Button>
      </Box>
      <Footer />
    </HomePageWrapper>
  );
};

export default ProfilePage;
