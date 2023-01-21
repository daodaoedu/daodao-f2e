import React, { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import Script from 'next/script';
import {
  Box,
  Typography,
  Button,
  Skeleton,
  Modal,
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
    width: 90%;
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '16px',
  p: 4,
};

const EditPage = () => {
  const router = useRouter();
  const auth = getAuth();
  const [user, isLoading] = useAuthState(auth);
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
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (!isLoading) {
      setUserName(user?.displayName || '');
      setPhotoURL(user?.photoURL || '');
      const db = getFirestore();
      if (user?.uid) {
        // console.log('auth.currentUser', auth.currentUser);
        const docRef = doc(db, 'user', user?.uid);
        getDoc(docRef).then((docSnap) => {
          const data = docSnap.data();
          setUserName(data?.userName || '');
          setPhotoURL(data?.photoURL || '');
          setBirthDay(dayjs(data?.birthDay) || dayjs());
          setGender(data?.gender || '');
          setRoleList(data?.roleList || []);
          setWantToLearnList(data?.wantToLearnList || []);
          setInterestAreaList(data?.interestAreaList || []);
          setEducationStep(data?.educationStep);
          setLocation(data?.location || '');
          setUrl(data?.url || '');
          setDescription(data?.description || '');
          setIsOpenLocation(data?.isOpenLocation || false);
          setIsOpenProfile(data?.isOpenProfile || false);
        });
      }
    }
  }, [user, isLoading]);

  const onUpdateUser = () => {
    const payload = {
      userName,
      photoURL,
      birthDay: birthDay.toISOString(),
      gender,
      roleList,
      wantToLearnList,
      interestAreaList,
      educationStep,
      location,
      url,
      description,
      isOpenLocation,
      isOpenProfile,
      lastUpdateDate: dayjs().toISOString(),
    };

    const db = getFirestore();

    const docRef = doc(db, 'user', user?.uid);
    getDoc(docRef).then((docSnap) => {
      setIsLoadingSubmit(true);
      const isNewUser = Object.keys(docSnap.data() || {}).length === 0;
      if (isNewUser) {
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
            router.push('/profile');
          });
      } else {
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
            router.push('/profile');
          });
      }
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 15px',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '22px',
                  lineHeight: '140%',
                  textAlign: 'center',
                  color: '#536166',
                }}
              >
                您對哪些領域感興趣？
              </Typography>
              <Typography
                sx={{
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '140%',
                  textAlign: 'center',
                  color: '#536166',
                  mt: '8px',
                }}
              >
                請選擇2-6個您想要關注的學習領域
              </Typography>
              <Box sx={{ width: '100%', marginTop: '16px' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  {CATEGORIES.slice(0, 4).map(({ label, value, image }) => (
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
                        flexDirection: 'column',
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
                          ...(interestAreaList.includes(value)
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
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    marginTop: '12px',
                  }}
                >
                  {CATEGORIES.slice(4, 8).map(({ label, value, image }) => (
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
                        flexDirection: 'column',
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
                          ...(interestAreaList.includes(value)
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
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    marginTop: '12px',
                  }}
                >
                  {CATEGORIES.slice(8).map(({ label, value, image }) => (
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
                        flexDirection: 'column',
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
                          ...(interestAreaList.includes(value)
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
                  mt: '40px',
                  width: '100%',
                  display: 'flex',
                }}
              >
                <Button
                  sx={{ width: '100%', borderRadius: '20px', mr: '4px' }}
                  variant="outlined"
                  disabled={isLoadingSubmit}
                  onClick={() => {
                    router.back();
                  }}
                >
                  上一步
                </Button>
                <Button
                  sx={{
                    width: '100%',
                    borderRadius: '20px',
                    ml: '4px',
                    color: '#ffff',
                    bgcolor: '#16B9B3',
                  }}
                  variant="outlined"
                  onClick={handleOpen}
                >
                  下一步
                </Button>
                <Modal
                  keepMounted
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="keep-mounted-modal-title"
                  aria-describedby="keep-mounted-modal-description"
                >
                  <Box sx={style}>
                    <Typography
                      id="keep-mounted-modal-title"
                      variant="h3"
                      component="h2"
                      textAlign="center"
                      sx={{
                        color: ' #536166',
                        fontWeight: 700,
                        fontWize: '22px',
                        lineHeight: '140%',
                      }}
                    >
                      想在平台上尋找夥伴嗎？
                    </Typography>
                    <Typography
                      id="keep-mounted-modal-subtitle"
                      variant="h6"
                      component="h4"
                      textAlign="center"
                      sx={{
                        color: ' #536166',
                        fontWeight: 400,
                        fontWize: '14px',
                        lineHeight: '140%',
                      }}
                    >
                      不論你是自學生、家長、教育工作者，都可以在平台上尋找志同道合的夥伴一起交流
                    </Typography>
                    <img
                      src="/assets/partner-popup.png"
                      alt="nobody-land"
                      width="360"
                      height="280"
                    />
                    <Typography
                      id="keep-mounted-modal-description"
                      textAlign="center"
                      sx={{
                        mt: 2,
                        color: ' #536166',
                        fontWeight: 400,
                        fontWize: '14px',
                        lineHeight: '140%',
                      }}
                    >
                      我們會公開你的個人檔案，填寫完整的資料，才能讓其他夥伴們更了解你喔！
                    </Typography>
                    <Box
                      sx={{
                        mt: '40px',
                        width: '100%',
                        display: 'flex',
                      }}
                    >
                      <Button
                        sx={{ width: '100%', borderRadius: '20px', mr: '4px' }}
                        variant="outlined"
                        disabled={isLoadingSubmit}
                        onClick={() => {
                          router.push('/partner');
                        }}
                      >
                        暫時不需要
                      </Button>
                      <Button
                        sx={{
                          width: '100%',
                          borderRadius: '20px',
                          ml: '4px',
                          color: '#ffff',
                          bgcolor: '#16B9B3',
                        }}
                        variant="outlined"
                        onClick={() => {
                          router.push('/profile/edit');
                        }}
                      >
                        想，填寫資料
                      </Button>
                    </Box>
                  </Box>
                </Modal>
              </Box>
            </Box>
          </ContentWrapper>
        </Box>
      </LocalizationProvider>
      <Footer />
    </HomePageWrapper>
  );
};

export default EditPage;
