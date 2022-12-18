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
} from 'firebase/firestore';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SEOConfig from '../../../shared/components/SEO';
import Navigation from '../../../shared/components/Navigation_v2';
import Footer from '../../../shared/components/Footer_v2';
import {
  GENDER,
  ROLE,
  EDUCATION_STEP,
  WANT_TO_DO_WITH_PARTNER,
  CATEGORIES,
} from '../../../constants/member';
import COUNTIES from '../../../constants/countries.json';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border: 1px solid #536166;
  border-radius: 8px;
  margin: 50px auto;
  padding: 40px 10px;
  max-width: 80%;
  width: 100%;
  @media (max-width: 767px) {
    width: 90%;
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;

const EditPage = () => {
  const router = useRouter();
  const auth = getAuth();
  const [user, isLoading, isError] = useAuthState(auth);
  const [userName, setUserName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [birthDay, setBirthDay] = useState(dayjs());
  const [gender, setGender] = useState('');
  const [roleList, setRoleList] = useState([]);
  const [wantToLearnList, setWantToLearnList] = useState([]);
  const [interestAreaList, setInterestAreaList] = useState([]);
  const [educationStep, setEducationStep] = useState('-1');
  const [location, setLocation] = useState('tw');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isOpenLocation, setIsOpenLocation] = useState(false);
  const [isOpenProfile, setIsOpenProfile] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setUserName(user?.displayName || '');
      setPhotoURL(user?.photoURL || '');
      const db = getFirestore();
      if (user?.uid) {
        console.log('auth.currentUser', auth.currentUser);
        const docRef = doc(db, 'user', user?.uid);
        getDoc(docRef).then((docSnap) => {
          console.log('Document data:', docSnap.data());
          console.log('docSnap: ', docSnap);
        });
      }
    }
  }, [user, isLoading]);

  const unUpdateUser = () => {
    updateProfile(auth.currentUser, {
      displayName: userName,
      photoURL,
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
              }}
            >
              編輯個人頁面
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '14px',
                lineHeight: '140%',
                textAlign: 'center',
                color: '#536166',
                marginTop: '8px',
              }}
            >
              填寫完整資訊可以幫助其他夥伴更了解你哦！
            </Typography>
            <LazyLoadImage
              alt="login"
              src={photoURL || ''}
              // "https://i.imgur.com/1nhGPPR.png"
              height={128}
              width={128}
              effect="opacity"
              style={{
                marginTop: '24px',
                borderRadius: '100%',
                background: 'rgba(240, 240, 240, .8)',
                objectFit: 'cover',
                objectPosition: 'center',
                minWidth: '128px',
                minHeight: '128px',
              }}
              placeholder={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <Skeleton
                  sx={{
                    height: '128px',
                    width: '128px',
                    background: 'rgba(240, 240, 240, .8)',
                    marginTop: '4px',
                  }}
                  variant="circular"
                  animation="wave"
                />
              }
            />

            <Box sx={{ marginTop: '50px', width: '100%', padding: '0 5%' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  marginTop: '20px',
                }}
              >
                <Typography>您的名稱 *</Typography>
                <TextField
                  sx={{ width: '100%' }}
                  value={userName}
                  onChange={(event) => setUserName(event.target.value)}
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
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    marginTop: '10px',
                    '@media (max-width: 767px)': {
                      flexDirection: 'column',
                    },
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
                        width: 'calc(calc(100% - 24px) / 4)',
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
                          width: '100%',
                          margin: '10px',
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
                          background: 'rgba(240, 240, 240, .8)',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          '@media (max-width: 767px)': {
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
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  marginTop: '20px',
                }}
              >
                <Typography>有興趣的領域 *</Typography>
                <Box sx={{ width: '100%', marginTop: '12px' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    {CATEGORIES.slice(0, 4).map(({ label, value }) => (
                      <Box
                        key={label}
                        onClick={() => {
                          if (interestAreaList.includes(value)) {
                            setInterestAreaList((state) =>
                              state.filter((data) => data !== value),
                            );
                          } else {
                            setInterestAreaList((state) => [...state, value]);
                          }
                        }}
                        sx={{
                          border: '1px solid #DBDBDB',
                          borderRadius: '8px',
                          padding: '10px',
                          width: 'calc(calc(100% - 16px) / 4)',
                          display: 'flex',
                          justifyItems: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          ...(interestAreaList.includes(value)
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
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      marginTop: '12px',
                    }}
                  >
                    {CATEGORIES.slice(4, 8).map(({ label, value }) => (
                      <Box
                        key={label}
                        onClick={() => {
                          if (interestAreaList.includes(value)) {
                            setInterestAreaList((state) =>
                              state.filter((data) => data !== value),
                            );
                          } else {
                            setInterestAreaList((state) => [...state, value]);
                          }
                        }}
                        sx={{
                          border: '1px solid #DBDBDB',
                          borderRadius: '8px',
                          padding: '10px',
                          width: 'calc(calc(100% - 16px) / 4)',
                          display: 'flex',
                          justifyItems: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          ...(interestAreaList.includes(value)
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
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      marginTop: '12px',
                    }}
                  >
                    {CATEGORIES.slice(8).map(({ label, value }) => (
                      <Box
                        key={label}
                        onClick={() => {
                          if (interestAreaList.includes(value)) {
                            setInterestAreaList((state) =>
                              state.filter((data) => data !== value),
                            );
                          } else {
                            setInterestAreaList((state) => [...state, value]);
                          }
                        }}
                        sx={{
                          border: '1px solid #DBDBDB',
                          borderRadius: '8px',
                          padding: '10px',
                          width: 'calc(calc(100% - 16px) / 4)',
                          display: 'flex',
                          justifyItems: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          ...(interestAreaList.includes(value)
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
              </Box>
              <Divider sx={{ margin: '32px 0' }} />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  marginTop: '20px',
                }}
              >
                <Typography>教育階段</Typography>
                <Select
                  labelId="education-step"
                  id="education-step"
                  value={educationStep}
                  onChange={(event) => {
                    setEducationStep(event.target.value);
                  }}
                  // placeholder="請選擇您或孩子目前的教育階段"
                  sx={{ width: '100%' }}
                >
                  <MenuItem disabled value="-1">
                    <em>請選擇您或孩子目前的教育階段</em>
                  </MenuItem>
                  {EDUCATION_STEP.map(({ label, value }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
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
                <Typography>居住地</Typography>
                <Select
                  labelId="location"
                  id="location"
                  value={location}
                  onChange={(event) => {
                    setLocation(event.target.value);
                  }}
                  // placeholder="請選擇您或孩子目前的教育階段"
                  sx={{ width: '100%' }}
                >
                  <MenuItem disabled value="-1">
                    <em>請選擇居住地</em>
                  </MenuItem>
                  {COUNTIES.map(({ name, alpha2 }) => (
                    <MenuItem key={alpha2} value={alpha2}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
                {/* <TextField
                  sx={{ width: '100%' }}
                  value={location}
                  onChange={(event) => {
                    setLocation(event.target.value);
                  }}
                /> */}
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
                <Typography>想和夥伴一起</Typography>
                <Box sx={{ width: '100%', marginTop: '12px' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    {WANT_TO_DO_WITH_PARTNER.slice(0, 3).map(
                      ({ label, value }) => (
                        <Box
                          key={label}
                          onClick={() => {
                            if (wantToLearnList.includes(value)) {
                              setWantToLearnList((state) =>
                                state.filter((data) => data !== value),
                              );
                            } else {
                              setWantToLearnList((state) => [...state, value]);
                            }
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
                            ...(wantToLearnList.includes(value)
                              ? {
                                  backgroundColor: '#DEF5F5',
                                  border: '1px solid #16B9B3',
                                }
                              : {}),
                          }}
                        >
                          <Typography sx={{ margin: 'auto' }}>
                            {label}
                          </Typography>
                        </Box>
                      ),
                    )}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      marginTop: '12px',
                    }}
                  >
                    {WANT_TO_DO_WITH_PARTNER.slice(3).map(
                      ({ label, value }) => (
                        <Box
                          key={label}
                          onClick={() => {
                            if (wantToLearnList.includes(value)) {
                              setWantToLearnList((state) =>
                                state.filter((data) => data !== value),
                              );
                            } else {
                              setWantToLearnList((state) => [...state, value]);
                            }
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
                            ...(wantToLearnList.includes(value)
                              ? {
                                  backgroundColor: '#DEF5F5',
                                  border: '1px solid #16B9B3',
                                }
                              : {}),
                          }}
                        >
                          <Typography sx={{ margin: 'auto' }}>
                            {label}
                          </Typography>
                        </Box>
                      ),
                    )}
                  </Box>
                </Box>
                {/* <TextField sx={{ width: '100%' }} /> */}
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
                <Typography>可以和夥伴分享的事物</Typography>
                <TextField
                  sx={{ width: '100%' }}
                  placeholder="ex.  自學申請、學習方法、學習資源，或各種學習領域的知識"
                />
              </Box>
              {/* <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  marginTop: '20px',
                }}
              >
                <Typography>標籤</Typography>
                <TextField
                  sx={{ width: '100%' }}
                  placeholder="搜尋或新增標籤"
                />
                <Typography
                  sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px' }}
                >
                  可以是學習領域、興趣等等的標籤，例如：音樂創作、程式語言、電繪、社會議題。
                </Typography>
              </Box> */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  marginTop: '20px',
                }}
              >
                <Typography>個人網站或社群</Typography>
                <TextField
                  sx={{ width: '100%' }}
                  placeholder="https://"
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value);
                  }}
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
                <Typography>個人簡介</Typography>
                <TextareaAutosize
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '10px',
                    borderRadius: '8px',
                    borderColor: 'rgb(0,0,0,0.87)',
                  }}
                  placeholder="寫下關於你的資訊，讓其他島民更認識你！也可以多描述想和夥伴一起做的事喔！"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                  }}
                />
              </Box>
              <Divider sx={{ margin: '32px 0' }} />
              <Box
                sx={{
                  border: '1px solid #DBDBDB',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '13px 16px',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '140%',
                    color: '#293A3D',
                  }}
                >
                  公開顯示居住地
                </Typography>
                <Switch
                  value={isOpenLocation}
                  onChange={(event) => setIsOpenLocation(event.target.value)}
                />
              </Box>
              <Box
                sx={{
                  border: '1px solid #DBDBDB',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '13px 16px',
                  marginTop: '16px',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '140%',
                    color: '#293A3D',
                  }}
                >
                  公開個人頁面尋找夥伴
                </Typography>
                <Switch
                  value={isOpenProfile}
                  onChange={(event) => setIsOpenProfile(event.target.value)}
                />
              </Box>
            </Box>

            <Box sx={{ marginTop: '40px', width: '100%' }}>
              <Button
                sx={{ width: '100%', borderRadius: '50px' }}
                variant="outlined"
                onClick={() => {
                  toast.success('你點我做什麼？？？？');
                }}
              >
                儲存資料
              </Button>
              <Button
                sx={{ marginTop: '20px', width: '100%', borderRadius: '50px' }}
                variant="outlined"
                onClick={() => {
                  toast.success('你點我做什麼？？？？');
                }}
              >
                查看我的頁面
              </Button>
            </Box>
          </ContentWrapper>
        </Box>
      </LocalizationProvider>
      <Footer />
    </HomePageWrapper>
  );
};

export default EditPage;
