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
  MenuItem,
  Select,
} from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import toast from 'react-hot-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, updateProfile } from 'firebase/auth';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
} from 'firebase/firestore';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import SEOConfig from '../../shared/components/SEO';
import Navigation from '../../shared/components/Navigation_v2';
import Footer from '../../shared/components/Footer_v2';
import {
  GENDER,
  ROLE,
  EDUCATION_STEP,
  WANT_TO_DO_WITH_PARTNER,
  CATEGORIES,
} from '../../constants/member';
import COUNTIES from '../../constants/countries.json';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
  background: linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-radius: 16px;
  margin: 60px auto;
  max-width: 50%;
  width: 100%;
  @media (max-width: 767px) {
    max-width: 80%;
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;

function EditPage() {
  const router = useRouter();
  const auth = getAuth();
  const [user, isLoading] = useAuthState(auth);
  const [isSubscribeEmail, setIsSubscribeEmail] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [birthDay, setBirthDay] = useState(dayjs());
  const [gender, setGender] = useState('');
  const [roleList, setRoleList] = useState([]);
  useEffect(() => {
    if (!isLoading) {
      const db = getFirestore();
      if (user?.uid) {
        // console.log('auth.currentUser', auth.currentUser);
        const docRef = doc(db, 'user', user?.uid);
        getDoc(docRef).then((docSnap) => {
          const data = docSnap.data();
          setBirthDay(dayjs(data?.birthDay) || dayjs());
          setGender(data?.gender || '');
          setRoleList(data?.roleList || []);
        });
      }
    }
  }, [user, isLoading]);

  const onUpdateUser = (successCallback) => {
    const payload = {
      birthDay: birthDay.toISOString(),
      gender,
      roleList,
      lastUpdateDate: dayjs().toISOString(),
      isSubscribeEmail,
    };

    const db = getFirestore();

    const docRef = doc(db, 'user', user?.uid);
    getDoc(docRef).then(() => {
      setIsLoadingSubmit(true);
      toast
        .promise(
          setDoc(docRef, payload).then(() => {
            setIsLoadingSubmit(false);
          }),
          {
            success: '更新成功！',
            error: '更新失敗',
            loading: '更新中...',
          },
        )
        .then(() => {
          successCallback();
        });
    });
  };
  const SEOData = useMemo(
    () => ({
      title: '編輯我的島島資料｜島島阿學',
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

  return (
    <HomePageWrapper>
      <SEOConfig data={SEOData} />
      <Navigation />
      <Box>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ minHeight: '100vh' }}>
            <ContentWrapper>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '22px',
                  lineHeight: '140%',
                  textAlign: 'center',
                  color: '#536166',
                  mt: '40px',
                }}
              >
                基本資料
              </Typography>
              <Box sx={{ marginTop: '24px', width: '100%', padding: '0 5%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    marginTop: '20px',
                  }}
                >
                  <Typography>生日 *</Typography>
                  <MobileDatePicker
                    label="birthDay"
                    inputFormat="YYYY/MM/DD"
                    value={birthDay}
                    onChange={(date) => setBirthDay(date)}
                    renderInput={(params) => (
                      <TextField {...params} sx={{ width: '100%' }} label="" />
                    )}
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    marginTop: '20px',
                  }}
                >
                  <Typography>性別 *</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    {GENDER.map(({ label, value }) => (
                      <Box
                        key={label}
                        onClick={() => {
                          setGender(value);
                        }}
                        sx={{
                          border: '1px solid #DBDBDB',
                          borderRadius: '8px',
                          padding: '10px',
                          width: 'calc(calc(100% - 16px) / 3)',
                          display: 'flex',
                          justifyItems: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          ...(gender === value
                            ? {
                                backgroundColor: '#DEF5F5',
                                border: '1px solid #16B9B3',
                              }
                            : {}),
                        }}
                      >
                        <Typography sx={{ margin: 'auto' }}>{label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    marginTop: '20px',
                  }}
                >
                  <Typography>身份 *</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      marginTop: '10px',
                    }}
                  >
                    {ROLE.map(({ label, value, image }) => (
                      <Box
                        key={label}
                        onClick={() => {
                          if (roleList.includes(value)) {
                            setRoleList((state) =>
                              state.filter((data) => data !== value),
                            );
                          } else {
                            setRoleList((state) => [...state, value]);
                          }
                        }}
                        sx={{
                          border: '1px solid #DBDBDB',
                          borderRadius: '8px',
                          padding: '10px',
                          margin: '4px',
                          width: 'calc(calc(100% - 24px) / 3)',
                          flexBasis: 'calc(calc(100% - 24px) / 3)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyItems: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          ...(roleList.includes(value)
                            ? {
                                backgroundColor: '#DEF5F5',
                                border: '1px solid #16B9B3',
                              }
                            : {}),
                          '@media (max-width: 767px)': {
                            height: '100% auto',
                            width: 'calc(calc(100% - 24px) / 2)',
                            flexBasis: 'calc(calc(100% - 24px) / 2)',
                          },
                        }}
                      >
                        <LazyLoadImage
                          alt={label}
                          src={image}
                          effect="opacity"
                          style={{
                            height: '100px',
                            width: '100%',
                            borderRadius: '6px',
                            // background: 'rgba(240, 240, 240, .8)',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            '@media (maxWidth: 767px)': {
                              width: '100%',
                            },
                          }}
                          placeholder={
                            // eslint-disable-next-line react/jsx-wrap-multilines
                            <Skeleton
                              sx={{
                                height: '100px',
                                width: '100%',
                                borderRadius: '6px',
                                background: 'rgba(240, 240, 240, .8)',
                                marginTop: '4px',
                              }}
                              variant="rectangular"
                              animation="wave"
                            />
                          }
                        />
                        <Typography
                          sx={{
                            margin: 'auto',
                            marginTop: '10px',
                            ...(roleList.includes(value)
                              ? {
                                  fontWeight: 700,
                                }
                              : {}),
                          }}
                        >
                          {label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <FormControlLabel
                  sx={{
                    marginTop: '20px',
                  }}
                  control={
                    // eslint-disable-next-line react/jsx-wrap-multilines
                    <Checkbox
                      checked={isSubscribeEmail}
                      onChange={(event) =>
                        setIsSubscribeEmail(event.target.checked)
                      }
                    />
                  }
                  label="訂閱電子報與島島阿學的新資訊"
                />
                <Button
                  sx={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '20px',
                    margin: '24px 0px 45px 0px',
                    color: '#ffff',
                    bgcolor: '#16B9B3',
                  }}
                  variant="contained"
                  onClick={() => {
                    onUpdateUser(() => router.push('/signin/interest'));
                  }}
                >
                  下一步
                </Button>
              </Box>
            </ContentWrapper>
          </Box>
        </LocalizationProvider>
      </Box>
      <Footer />
    </HomePageWrapper>
  );
}

export default EditPage;
