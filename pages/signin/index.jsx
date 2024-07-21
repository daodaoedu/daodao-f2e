import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserById, updateUser } from '@/redux/actions/user';
import { GENDER, ROLE } from '@/constants/member';
import dayjs from 'dayjs';

import { Box, Typography, Button, Skeleton, TextField } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import SEOConfig from '@/shared/components/SEO';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import styled from '@emotion/styled';

export const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
  background: linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa;
`;

export const StyledContentWrapper = styled.div`
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

  h2 {
    font-weight: 700;
    font-size: 22px;
    line-height: 140%;
    text-align: center;
    color: #536166;
    margin-top: 40px;
  }
`;

export const StyledQuestionInput = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin-top: 20px;
`;

function EditPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    birthDay: userBirthDay,
    gender: userGender,
    roleList: userRoleList,
    isSubscribeEmail: userIsSubscribeEmail,
    email: userEmail,
    createdDate,
    updatedDate,
  } = useSelector((state) => state?.user);
  const { id } = router.query;

  const [isSubscribeEmail, setIsSubscribeEmail] = useState(false);
  const [birthDay, setBirthDay] = useState(dayjs());
  const [gender, setGender] = useState('');
  const [roleList, setRoleList] = useState([]);

  const fetchUser = async () => {
    dispatch(fetchUserById(id));
  };

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  useEffect(() => {
    setBirthDay(userBirthDay ? dayjs(userBirthDay) : dayjs());
    setGender(userGender || '');
    setRoleList(userRoleList || []);
    setIsSubscribeEmail(userIsSubscribeEmail || false);

    if (createdDate !== updatedDate) {
      router.push('/profile');
    }
  }, [userEmail]);

  const onUpdateUser = () => {
    const payload = {
      id,
      email: userEmail,
      birthDay: birthDay.toISOString(),
      gender,
      roleList,
      isSubscribeEmail,
    };
    dispatch(updateUser(payload));
    router.push(`/signin/interest`);
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
            <StyledContentWrapper>
              <h2>基本資料</h2>
              <Box sx={{ marginTop: '24px', width: '100%', padding: '0 5%' }}>
                <StyledQuestionInput>
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
                </StyledQuestionInput>
                <StyledQuestionInput>
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
                </StyledQuestionInput>
                <StyledQuestionInput>
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
                </StyledQuestionInput>
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
                  onClick={onUpdateUser}
                >
                  下一步
                </Button>
              </Box>
            </StyledContentWrapper>
          </Box>
        </LocalizationProvider>
      </Box>
      <Footer />
    </HomePageWrapper>
  );
}

export default EditPage;
