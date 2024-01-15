import React, { useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import COUNTIES from '@/constants/countries.json';
import {
  GENDER,
  ROLE,
  EDUCATION_STAGE,
  WANT_TO_DO_WITH_PARTNER,
} from '@/constants/member';

import {
  Box,
  Typography,
  Skeleton,
  TextField,
  Switch,
  TextareaAutosize,
  MenuItem,
  Select,
  Grid,
} from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SEOConfig from '@/shared/components/SEO';

import useEditProfile from './useEditProfile';
import {
  HomePageWrapper,
  ContentWrapper,
  StyledGroup,
  StyledSelectWrapper,
  StyledSelectBox,
  StyledSelectText,
  StyledToggleWrapper,
  StyledToggleText,
  StyledTitleWrap,
  StyledSection,
  StyledButtonGroup,
  StyledButton,
} from './Edit.styled';

function EditPage() {
  const router = useRouter();

  const { userState, onChangeHandler, onSubmit } = useEditProfile();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (user._id) {
      Object.entries(user).forEach(([key, value]) => {
        if (key !== 'contactList') {
          onChangeHandler({ key, value });
        } else {
          const { instagram, facebook, discord, line } = value;
          onChangeHandler({ key: 'instagram', value: instagram || '' });
          onChangeHandler({ key: 'facebook', value: facebook || '' });
          onChangeHandler({ key: 'discord', value: discord || '' });
          onChangeHandler({ key: 'line', value: line || '' });
        }
      });
    } else {
      router.push('/');
    }
  }, [user]);

  const onUpdateUser = async (successCallback) => {
    await onSubmit({ id: user._id, email: user.email });
    toast.success('更新成功');
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
      <SEOConfig data={SEOData} />
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        sx={{
          background: 'linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa',
        }}
      >
        <ContentWrapper sx={{ minHeight: '100vh' }}>
          <StyledTitleWrap>
            <h2>編輯個人頁面</h2>
            <p>填寫完整資訊可以幫助其他夥伴更了解你哦！</p>
            <LazyLoadImage
              alt="login"
              src={userState.photoURL || ''}
              // "https://imgur.com/EADd1UD.png"
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

            <Box sx={{ marginTop: '24px', width: '100%' }}>
              <StyledGroup>
                <Typography>名稱 *</Typography>
                <TextField
                  sx={{ width: '100%' }}
                  value={userState.name}
                  onChange={(event) =>
                    onChangeHandler({ key: 'name', value: event.target.value })
                  }
                />
              </StyledGroup>
              <StyledGroup>
                <Typography>生日 *</Typography>
                <MobileDatePicker
                  label="birthDay"
                  inputFormat="YYYY/MM/DD"
                  value={userState.birthDay}
                  onChange={(date) =>
                    onChangeHandler({ key: 'birthDay', value: date })
                  }
                  renderInput={(params) => (
                    <TextField {...params} sx={{ width: '100%' }} label="" />
                  )}
                />
              </StyledGroup>
              <StyledGroup>
                <Typography>性別 *</Typography>
                <StyledSelectWrapper>
                  {GENDER.map(({ label, value }) => (
                    <StyledSelectBox
                      isselected={`${userState.gender === value}`}
                      key={label}
                      onClick={() => {
                        onChangeHandler({ key: 'gender', value });
                      }}
                    >
                      <StyledSelectText
                        isselected={`${userState.gender === value}`}
                      >
                        {label}
                      </StyledSelectText>
                    </StyledSelectBox>
                  ))}
                </StyledSelectWrapper>
              </StyledGroup>
              <StyledGroup>
                <Typography>身份 *</Typography>
                <StyledSelectWrapper>
                  {ROLE.map(({ label, value }) => (
                    <StyledSelectBox
                      key={label}
                      isselected={userState.roleList.includes(value).toString()}
                      onClick={() =>
                        onChangeHandler({
                          key: 'roleList',
                          value,
                          isMultiple: true,
                        })
                      }
                    >
                      <StyledSelectText
                        isselected={userState.roleList
                          .includes(value)
                          .toString()}
                      >
                        {label}
                      </StyledSelectText>
                    </StyledSelectBox>
                  ))}
                </StyledSelectWrapper>
              </StyledGroup>
            </Box>
          </StyledTitleWrap>

          <StyledSection>
            <StyledGroup mt="0">
              <Typography>教育階段</Typography>
              <Select
                labelId="education-stage"
                id="education-stage"
                value={userState.educationStage}
                onChange={(event) => {
                  onChangeHandler({
                    key: 'educationStage',
                    value: event.target.value,
                  });
                }}
                sx={{ width: '100%' }}
              >
                <MenuItem disabled>
                  <em>請選擇您或孩子目前的教育階段</em>
                </MenuItem>
                {EDUCATION_STAGE.map(({ label, value }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </StyledGroup>
            <StyledGroup>
              <Typography>居住地</Typography>
              <Select
                labelId="location"
                id="location"
                value={userState.location}
                onChange={(event) => {
                  onChangeHandler({
                    key: 'location',
                    value: event.target.value,
                  });
                }}
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
            </StyledGroup>
          </StyledSection>

          {/* 聯絡方式 */}
          <StyledSection>
            <StyledGroup mt="0">
              <Typography>聯絡方式</Typography>
              <Typography
                sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px' }}
              >
                聯絡資訊會呈現在你的公開頁面上，讓夥伴能聯繫你
              </Typography>
            </StyledGroup>
            <Grid container columnSpacing={1}>
              <Grid item xs="6">
                <StyledGroup>
                  <Typography>Instagram</Typography>
                  <TextField
                    value={userState.instagram}
                    onChange={(event) => {
                      onChangeHandler({
                        key: 'instagram',
                        value: event.target.value,
                      });
                    }}
                    placeholder="請填寫ID"
                    sx={{ width: '100%' }}
                  />
                </StyledGroup>
              </Grid>
              <Grid item xs="6">
                <StyledGroup>
                  <Typography>Discord</Typography>
                  <TextField
                    value={userState.discord}
                    onChange={(event) => {
                      onChangeHandler({
                        key: 'discord',
                        value: event.target.value,
                      });
                    }}
                    placeholder="請填寫ID"
                    sx={{ width: '100%' }}
                  />
                </StyledGroup>
              </Grid>
              <Grid item xs="6">
                <StyledGroup>
                  <Typography>Line</Typography>
                  <TextField
                    value={userState.line}
                    onChange={(event) => {
                      onChangeHandler({
                        key: 'line',
                        value: event.target.value,
                      });
                    }}
                    placeholder="請填寫ID"
                    sx={{ width: '100%' }}
                  />
                </StyledGroup>
              </Grid>
              <Grid item xs="6">
                <StyledGroup>
                  <Typography>Facebook</Typography>
                  <TextField
                    value={userState.facebook}
                    onChange={(event) => {
                      onChangeHandler({
                        key: 'facebook',
                        value: event.target.value,
                      });
                    }}
                    placeholder="請填寫ID"
                    sx={{ width: '100%' }}
                  />
                </StyledGroup>
              </Grid>
            </Grid>
          </StyledSection>

          <StyledSection>
            <StyledGroup mt="0">
              <Typography>想和夥伴一起</Typography>
              <StyledSelectWrapper>
                {WANT_TO_DO_WITH_PARTNER.map(({ label, value }) => (
                  <StyledSelectBox
                    key={label}
                    isselected={userState.wantToDoList
                      .includes(value)
                      .toString()}
                    onClick={() => {
                      onChangeHandler({
                        key: 'wantToDoList',
                        value,
                        isMultiple: true,
                      });
                    }}
                  >
                    <StyledSelectText
                      isselected={userState.wantToDoList
                        .includes(value)
                        .toString()}
                    >
                      {label}
                    </StyledSelectText>
                  </StyledSelectBox>
                ))}
              </StyledSelectWrapper>
            </StyledGroup>
            <StyledGroup>
              <Typography>可以和夥伴分享的事物</Typography>
              <TextField
                sx={{ width: '100%' }}
                placeholder="你擅長什麼？可以分享什麼呢？"
                value={userState.share}
                onChange={(e) => {
                  onChangeHandler({ key: 'share', value: e.target.value });
                }}
              />
            </StyledGroup>
            <StyledGroup>
              {/* TODO: NEED TO FIXED */}
              <Typography>標籤</Typography>
              <TextField
                sx={{ width: '100%' }}
                placeholder="搜尋或新增標籤"
                value={userState.tagList[0]}
                onChange={(event) => {
                  onChangeHandler({
                    key: 'tagList',
                    value: event.target.value,
                  });
                }}
              />
              <Typography
                sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px' }}
              >
                可以是學習領域、興趣等等的標籤，例如：音樂創作、程式語言、電繪、社會議題。
              </Typography>
            </StyledGroup>

            <StyledGroup>
              <Typography>個人簡介</Typography>
              <TextareaAutosize
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '10px',
                  borderRadius: '8px ',
                  border: '1px solid #DBDBDB',
                }}
                placeholder="寫下關於你的資訊，讓其他島民更認識你！也可以多描述想和夥伴一起做的事喔！"
                value={userState.selfIntroduction}
                onChange={(event) => {
                  onChangeHandler({
                    key: 'selfIntroduction',
                    value: event.target.value,
                  });
                }}
              />
            </StyledGroup>
          </StyledSection>

          <StyledSection>
            <StyledToggleWrapper>
              <StyledToggleText>公開顯示居住地</StyledToggleText>
              <Switch
                checked={userState.isOpenLocation}
                onChange={(_, value) => {
                  onChangeHandler({
                    key: 'isOpenLocation',
                    value,
                  });
                }}
              />
            </StyledToggleWrapper>
            <StyledToggleWrapper>
              <StyledToggleText>公開個人頁面尋找夥伴</StyledToggleText>
              <Switch
                checked={userState.isOpenProfile}
                onChange={(_, value) => {
                  onChangeHandler({
                    key: 'isOpenProfile',
                    value,
                  });
                }}
              />
            </StyledToggleWrapper>
          </StyledSection>

          <StyledButtonGroup>
            <StyledButton
              variant="contained"
              onClick={() => {
                router.push('/profile/myprofile');
              }}
            >
              查看我的頁面
            </StyledButton>
            <StyledButton
              variant="outlined"
              onClick={() => {
                onUpdateUser(() => router.push('/profile'));
              }}
            >
              儲存資料
            </StyledButton>
          </StyledButtonGroup>
        </ContentWrapper>
      </LocalizationProvider>
    </HomePageWrapper>
  );
}

export default EditPage;
