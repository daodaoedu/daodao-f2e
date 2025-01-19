import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { TAIWAN_DISTRICT, COUNTRIES } from '@/constants/areas';
import { useAuth } from '@/contexts/Auth';

import {
  GENDER,
  ROLE,
  EDUCATION,
  WANT_TO_DO_WITH_PARTNER,
} from '@/constants/member';

import {
  Box,
  Typography,
  TextField,
  Switch,
  MenuItem,
  Select,
  Grid,
} from '@mui/material';

import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TagEditor from '@/shared/components/TagEditor';
import MarkdownEditor from '@/shared/components/MarkdownEditor';
import ErrorMessage from './ErrorMessage';

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

// TODO: 待重構
function EditPage() {
  const mobileScreen = useMediaQuery('(max-width: 767px)');
  const [isSetting, setIsSetting] = useState(false);
  const router = useRouter();

  const {
    userState,
    errors,
    onChangeHandler,
    validate,
    onSubmit: onEditSubmit,
    setRef,
  } = useEditProfile();

  const { user, token, isComplete } = useAuth();
  const { tags } = useSelector((state) => state.partners);

  useEffect(() => {
    if (user?._id) {
      Object.entries(user).forEach(([key, value]) => {
        if (key === 'contactList') {
          const { instagram, facebook, discord, line } = value;
          onChangeHandler({ key: 'instagram', value: instagram || '' });
          onChangeHandler({ key: 'facebook', value: facebook || '' });
          onChangeHandler({ key: 'discord', value: discord || '' });
          onChangeHandler({ key: 'line', value: line || '' });
        } else if (key === 'birthDay') {
          const parsedDate = dayjs(value);
          onChangeHandler({ key: 'birthDay', value: parsedDate });
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
      setIsSetting(true);
    } else {
      router.push('/');
    }
  }, [user, token]);

  const onUpdateUser = async () => {
    const resultStatus = await onEditSubmit({
      id: user._id,
      email: user.email,
    });
    if (Object.values(errors).length) {
      toast.error('請修正錯誤');
      return;
    }
    if (resultStatus) {
      toast.success('更新成功');
    } else {
      toast.error('更新失敗');
    }
  };

  useEffect(() => {
    if (isComplete) return;
    validate(userState);
  }, [userState, isComplete]);

  return (
    <FormWrapper>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        sx={{
          background: 'linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa',
        }}
      >
        <ContentWrapper sx={{ minHeight: '100vh' }}>
          <StyledTitleWrap
            sx={{
              border:
                errors.name ||
                errors.birthDay ||
                errors.gender ||
                errors.roleList
                  ? '1px solid red'
                  : '',
            }}
          >
            <h2>編輯個人頁面</h2>
            <p className="title-memo">
              填寫完整資訊可以幫助其他夥伴更了解你哦！
            </p>
            <TheAvator url={userState.photoURL} />

            <Box sx={{ marginTop: '24px', width: '100%' }}>
              <FormInput
                isRequire
                ref={(element) => setRef('name', element)}
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
                    <TextField
                      {...params}
                      ref={(element) => setRef('birthDay', element)}
                      sx={{ width: '100%' }}
                      label=""
                      error={!!errors.birthDay}
                      helperText={errors.birthDay ? errors.birthDay : ''}
                    />
                  )}
                  maxDate={dayjs().subtract(16, 'year')}
                  defaultCalendarMonth={dayjs().subtract(18, 'year')}
                />
              </StyledGroup>
              <StyledGroup>
                <Typography fontWeight="500">性別 *</Typography>
                <StyledSelectWrapper
                  ref={(element) => setRef('gender', element)}
                >
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
                <ErrorMessage errText={errors.gender} />
              </StyledGroup>
              <StyledGroup>
                <Typography fontWeight="500">身份 *</Typography>
                <StyledSelectWrapper
                  ref={(element) => setRef('roleList', element)}
                >
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
                <ErrorMessage errText={errors.roleList} />
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
                  <em>請選擇您目前的教育階段</em>
                </MenuItem>
                {EDUCATION.map(({ label, value }) => (
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
                {COUNTRIES.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
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
                      {TAIWAN_DISTRICT.map(({ name, value }) => (
                        <MenuItem key={value} value={value}>
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
                        ({ value }) => value === userState.city,
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

          <StyledSection
            ref={(element) => setRef('socialCode', element)}
            sx={{ border: errors.socialCode ? '1px solid red' : '' }}
          >
            <StyledGroup mt="0">
              <Typography sx={{ fontWeight: 700, fontSize: '18px' }}>
                聯絡方式 *
              </Typography>
              <Typography
                sx={{ color: '#92989A', fontWeight: 400, fontSize: '14px' }}
              >
                聯絡資訊會呈現在你的公開頁面上，讓夥伴能聯繫你，至少填寫一個社交媒體帳號
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
                    ref={(element) => setRef(key, element)}
                    title={title}
                    parmKey={key}
                    value={userState[key] || ''}
                    onChange={onChangeHandler}
                    placeholder="請填寫ID"
                    errorMsg={
                      errors[key]
                        ? errors[key]
                        : errors.socialCode
                        ? '請填寫您的 ID'
                        : ''
                    }
                  />
                </Grid>
              ))}
            </Grid>
            <StyledGroup>
              <ErrorMessage errText={errors.socialCode} />
            </StyledGroup>
          </StyledSection>

          <StyledSection
            sx={{
              border:
                errors.wantToDoList || errors.tagList || errors.selfIntroduction
                  ? '1px solid red'
                  : '',
            }}
          >
            <StyledGroup mt="0">
              <Typography
                sx={{ fontWeight: 500 }}
                ref={(element) => setRef('wantToDoList', element)}
              >
                想和夥伴一起 *
              </Typography>
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
              <ErrorMessage errText={errors.wantToDoList} />
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
              <Typography sx={{ fontWeight: 500, mb: '6px' }}>標籤</Typography>
              <TagEditor
                name="tagList"
                value={userState.tagList}
                tagOptions={tags}
                helperText="可以是學習領域、興趣等等的標籤，例如：音樂創作、程式語言、電繪、社會議題。"
                control={{
                  setRef: (name, element) => setRef(name, element),
                  onChange: ({ target }) =>
                    onChangeHandler({ key: target.name, value: target.value }),
                }}
              />
              <ErrorMessage errText={errors.tagList} />
            </StyledGroup>

            <StyledGroup>
              <Typography sx={{ fontWeight: 500, mb: '6px' }}>
                個人簡介 *
              </Typography>
              {isSetting && (
                <MarkdownEditor
                  name="selfIntroduction"
                  ref={(element) => setRef('selfIntroduction', element)}
                  value={userState.selfIntroduction}
                  rootClassName="w-full p-px bg-basic-200 rounded-md focus-within:bg-primary-base"
                  className="bg-white rounded-md"
                  placeholder="寫下關於你的資訊，讓其他島民更認識你！也可以多描述想和夥伴一起做的事喔！"
                  onChange={(markdown) => {
                    onChangeHandler({
                      key: 'selfIntroduction',
                      value: markdown,
                    });
                  }}
                />
              )}
              <ErrorMessage errText={errors.selfIntroduction} />
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
