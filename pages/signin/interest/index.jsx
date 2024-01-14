import React, { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserById, updateUser } from '@/redux/actions/user';

import { Box, Typography, Button, Skeleton } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import toast from 'react-hot-toast';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SEOConfig from '@/shared/components/SEO';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import {
  GENDER,
  ROLE,
  EDUCATION_STEP,
  WANT_TO_DO_WITH_PARTNER,
  CATEGORIES,
} from '../../../constants/member';
import TipModal from '../../../components/Signin/Interest/TipModal';
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
    max-width: 80%;
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;

function EditPage() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();

  const {
    _id: userId,
    interestList: userInterestList,
    email: userEmail,
  } = useSelector((state) => state?.user);

  const [interestList, setInterestList] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      setInterestList(userInterestList);
    }
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [userId, id]);

  const onUpdateUser = (successCallback) => {
    const payload = {
      id: userId,
      interestList,
      email: userEmail,
    };
    dispatch(updateUser(payload));
    successCallback();
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
      <TipModal
        open={open}
        onClose={() => {
          setOpen(false);
          router.push('/');
          // router.push('/partner');
        }}
        onOk={() => {
          setOpen(false);
          router.push('/profile');
          // router.push('/profile/edit');
        }}
      />
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
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  {CATEGORIES.map(({ label, value, image }) => (
                    <Box
                      key={label}
                      onClick={() => {
                        if (interestList.includes(value)) {
                          setInterestList((state) =>
                            state.filter((data) => data !== value),
                          );
                        } else {
                          setInterestList((state) => [...state, value]);
                        }
                      }}
                      sx={{
                        border: '1px solid #DBDBDB',
                        borderRadius: '8px',
                        margin: '4px',
                        padding: '10px',
                        width: 'calc(calc(100% - 32px) / 4)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyItems: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        ...(interestList.includes(value)
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
                          ...(interestList.includes(value)
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
                  sx={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '20px',
                    mr: '4px',
                  }}
                  variant="outlined"
                  onClick={() => {
                    router.back();
                  }}
                >
                  上一步
                </Button>
                <Button
                  sx={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '20px',
                    ml: '4px',
                    color: '#ffff',
                    bgcolor: '#16B9B3',
                  }}
                  variant="contained"
                  onClick={() => {
                    onUpdateUser(() => setOpen(true));
                  }}
                >
                  下一步
                </Button>
              </Box>
            </Box>
          </ContentWrapper>
        </Box>
      </LocalizationProvider>
      <Footer />
    </HomePageWrapper>
  );
}

export default EditPage;
