import React, { useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { TAIWAN_DISTRICT, COUNTRIES } from '@/constants/areas';

import {
  GENDER,
  ROLE,
  EDUCATION_STAGE,
  WANT_TO_DO_WITH_PARTNER,
} from '@/constants/member';

import {
  Box,
  Typography,
  TextField,
  Switch,
  TextareaAutosize,
  MenuItem,
  Select,
  Grid,
} from '@mui/material';

import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SEOConfig from '@/shared/components/SEO';
import InputTags from '../InputTags';

import TheAvator from './TheAvator';
import FormInput from './EditFormInput';

import useEditProfile from './useEditProfile';
import {
  FormWrapper,
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
  const mobileScreen = useMediaQuery('(max-width: 767px)');
  const router = useRouter();

  const {
    userState,
    errors,
    onChangeHandler,
    onSubmit: onEditSumit,
  } = useEditProfile();

  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (user._id || '65a7e0300604d7c3f4641bf9') {
      Object.entries(user).forEach(([key, value]) => {
        if (key === 'contactList') {
          const { instagram, facebook, discord, line } = value;
          onChangeHandler({ key: 'instagram', value: instagram || '' });
          onChangeHandler({ key: 'facebook', value: facebook || '' });
          onChangeHandler({ key: 'discord', value: discord || '' });
          onChangeHandler({ key: 'line', value: line || '' });
        } else if (key === 'location') {
          onChangeHandler({ key, value });
          const [country, city, district] = value.split('@');
          onChangeHandler({ key: 'country', value: country || null });
          onChangeHandler({ key: 'city', value: city || null });
          onChangeHandler({ key: 'district', value: district || null });
        } else {
          onChangeHandler({ key, value });
        }
      });
    } else {
      router.push('/');
    }
  }, [user]);

  const onUpdateUser = () => {
    if (Object.values(errors).length) {
      toast.error('請修正錯誤');
      return;
    }
    const resultStatus = onEditSumit({ id: user._id, email: user.email });
    if (resultStatus) {
      toast.success('更新成功');
      router.push('/profile');
    } else {
      toast.error('更新失敗');
    }
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
    <FormWrapper>
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
            <p className="title-memo">
              填寫完整資訊可以幫助其他夥伴更了解你哦！
            </p>
            <TheAvator url={userState.photoURL} />

            <Box sx={{ marginTop: '24px', width: '100%' }}>
              <FormInput
                isRequire
                title="名稱"
                parmKey="name"
                value={userState.name || ''}
                onChange={onChangeHandler}
                errorMsg={errors.name ? errors.name : ''}
              />
              <StyledGroup>
                <Typography fontWeight="500">生日 *</Typography>
                <MobileDatePicker
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
                <Typography fontWeight="500">性別 *</Typography>
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
                <Typography fontWeight="500">身份 *</Typography>
                <StyledSelectWrapper>
                  {ROLE.map(({ label, value }) => (
                    <StyledSelectBox
                      col={mobileScreen ? '2' : '3'}
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
              <Typography fontWeight="500">教育階段</Typography>
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
                labelId="country"
                id="country"
                value={userState.country}
                onChange={(event) => {
                  onChangeHandler({
                    key: 'country',
                    value: event.target.value,
                  });
                }}
                sx={{ width: '100%' }}
              >
                <MenuItem disabled value="-1">
                  <em>請選擇居住地</em>
                </MenuItem>
                {COUNTRIES.map(({ name, label }) => (
                  <MenuItem key={name} value={name}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
              {(userState.country === '台灣' || userState.country === 'tw') && (
                <Grid container columnSpacing={1}>
                  <Grid item xs="12" sm="6">
                    <Select
                      labelId="country"
                      id="country"
                      value={userState.city}
                      onChange={(event) => {
                        onChangeHandler({
                          key: 'city',
                          value: event.target.value,
                        });
                      }}
                      sx={{ width: '100%' }}
                    >
                      <MenuItem disabled value="-1">
                        <em>縣市</em>
                      </MenuItem>
                      {TAIWAN_DISTRICT.map(({ name }) => (
                        <MenuItem key={name} value={name}>
                          {name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid item xs="12" sm="6">
                    <Select
                      labelId="district"
                      id="district"
                      value={userState.district}
                      onChange={(event) => {
                        onChangeHandler({
                          key: 'district',
                          value: event.target.value,
                        });
                      }}
                      sx={{ width: '100%' }}
                    >
                      <MenuItem disabled value="-1">
                        <em>鄉鎮市區</em>
                      </MenuItem>
                      {TAIWAN_DISTRICT.find(
                        ({ name }) => name === userState.city,
                      )?.districts.map(({ name, zip }) => (
                        <MenuItem key={zip} value={name}>
                          {name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                </Grid>
              )}
            </StyledGroup>
          </StyledSection>

          <StyledSection>
            <StyledGroup mt="0">
              <Typography sx={{ fontWeight: 700, fontSize: '18px' }}>
                聯絡方式
              </Typography>
              <Typography
                sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px' }}
              >
                聯絡資訊會呈現在你的公開頁面上，讓夥伴能聯繫你
              </Typography>
            </StyledGroup>
            <Grid container columnSpacing={1}>
              {Object.entries({
                instagram: 'Instagram',
                discord: 'Discord',
                line: 'Line',
                facebook: 'Facebook',
              }).map(([key, title]) => (
                <Grid item xs="12" sm="6">
                  <FormInput
                    title={title}
                    parmKey={key}
                    value={userState[key] || ''}
                    onChange={onChangeHandler}
                    placeholder="請填寫ID"
                    errorMsg={errors[key] ? errors[key] : ''}
                  />
                </Grid>
              ))}
            </Grid>
          </StyledSection>

          <StyledSection>
            <StyledGroup mt="0">
              <Typography sx={{ fontWeight: 500 }}>想和夥伴一起</Typography>
              <StyledSelectWrapper>
                {WANT_TO_DO_WITH_PARTNER.map(({ label, value }) => (
                  <StyledSelectBox
                    key={label}
                    col={mobileScreen ? '2' : '3'}
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
              <Typography sx={{ fontWeight: 500 }}>
                可以和夥伴分享的事物
              </Typography>
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
              <Typography sx={{ fontWeight: 500 }}>標籤</Typography>
              <InputTags
                value={userState.tagList}
                change={(value) => {
                  onChangeHandler({ key: 'tagList', value, isMultiple: true });
                }}
              />
              <Typography
                sx={{
                  color: '#92989A',
                  fontWeight: 400,
                  fontSize: '14px',
                  mt: '2px',
                }}
              >
                可以是學習領域、興趣等等的標籤，例如：音樂創作、程式語言、電繪、社會議題。
              </Typography>
            </StyledGroup>

            <StyledGroup>
              <Typography sx={{ fontWeight: 500, mb: '6px' }}>
                個人簡介
              </Typography>
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
            <StyledToggleWrapper sx={{ mt: '16px' }}>
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
              variant="outlined"
              onClick={() => {
                router.push('/profile/myprofile');
              }}
            >
              查看我的頁面
            </StyledButton>
            <StyledButton variant="contained" onClick={onUpdateUser}>
              儲存資料
            </StyledButton>
          </StyledButtonGroup>
        </ContentWrapper>
      </LocalizationProvider>
    </FormWrapper>
  );
}

export default EditPage;
