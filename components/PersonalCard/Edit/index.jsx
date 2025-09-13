import React, { useEffect, useState } from 'react';
import { subYears } from 'date-fns';
import toast from 'react-hot-toast';
import useMediaQuery from '@/hooks/useMediaQuery';
import { useRouter } from 'next/navigation';
import { TAIWAN_DISTRICT, COUNTRIES } from '@/constants/areas';
import { useAuth } from '@/contexts/Auth';

import {
  GENDER,
  ROLE,
  EDUCATION,
  WANT_TO_DO_WITH_PARTNER,
} from '@/constants/member';

import { Text } from '@/components/ui/typography';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import TagEditor from '@/shared/components/TagEditor';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { useTags } from '@/services/tags';
import ErrorMessage from './ErrorMessage';

import TheAvator from './TheAvator';
import FormInput from './EditFormInput';

import useEditProfile from './useEditProfile';
import {
  StyledGroup,
  StyledSelectWrapper,
  StyledSelectBox,
  StyledSelectText,
  StyledButton,
} from './Edit.styled';

// TODO: 待重構
function EditPage() {
  const mobileScreen = useMediaQuery('isSmall');
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
  const { data: tags } = useTags();

  useEffect(() => {
    if (user?.id) {
      Object.entries(user).forEach(([key, value]) => {
        if (key === 'contactList') {
          const {
            instagram, facebook, discord, line,
          } = value;
          onChangeHandler({ key: 'instagram', value: instagram || '' });
          onChangeHandler({ key: 'facebook', value: facebook || '' });
          onChangeHandler({ key: 'discord', value: discord || '' });
          onChangeHandler({ key: 'line', value: line || '' });
        } else if (key === 'birthDay') {
          const parsedDate = new Date(value);
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
      id: user.id,
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
    <div className="bg-gradient-to-r from-[#f3fcfc] to-[#f7f8fa]">
      <div className="mx-auto flex min-h-screen w-full max-w-[672px] flex-col items-center justify-center rounded-2xl md:w-[672px]">
        <div
          className={`flex w-full flex-col items-center justify-center rounded-2xl bg-white p-[5%] ${
            errors.name || errors.birthDay || errors.gender || errors.roleList
              ? 'border border-red-500'
              : ''
          }`}
        >
          <h2 className="text-center text-[22px] font-bold leading-[140%] text-[#536166]">編輯個人頁面</h2>
          <p className="mt-2 text-center text-sm font-bold leading-[140%] text-[#536166]">
            填寫完整資訊可以幫助其他夥伴更了解你哦！
          </p>
          <TheAvator url={userState.photoURL} />

          <div className="mt-6 w-full">
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
              <Text className="font-medium">生日 *</Text>
              <div ref={(element) => setRef('birthDay', element)}>
                <DatePicker
                  value={userState.birthDay}
                  onChange={(date) => onChangeHandler({ key: 'birthDay', value: date })}
                  toDate={subYears(new Date(), 16)}
                  captionLayout="dropdown-buttons"
                  className="w-full"
                  placeholder="選擇生日"
                />
                {errors.birthDay && (
                  <Text className="mt-2 text-sm text-red-500">
                    {errors.birthDay}
                  </Text>
                )}
              </div>
            </StyledGroup>
            <StyledGroup>
              <Text className="font-medium">性別 *</Text>
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
              <Text className="font-medium">身份 *</Text>
              <StyledSelectWrapper
                ref={(element) => setRef('roleList', element)}
              >
                {ROLE.map(({ label, value }) => (
                  <StyledSelectBox
                    col={mobileScreen ? '2' : '3'}
                    key={label}
                    isselected={userState.roleList.includes(value).toString()}
                    onClick={() => onChangeHandler({
                      key: 'roleList',
                      value,
                      isMultiple: true,
                    })}
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
          </div>
        </div>

        <div className="mt-4 w-full rounded-2xl bg-white p-10 max-md:p-8 md:p-10">
          <StyledGroup mt="0">
            <Text className="font-medium">教育階段</Text>
            <Select
              value={userState.educationStage}
              onValueChange={(val) => {
                onChangeHandler({
                  key: 'educationStage',
                  value: val,
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="請選擇您目前的教育階段" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION.map(({ label, value }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </StyledGroup>
          <StyledGroup>
            <Text>居住地</Text>
            <Select
              value={userState.country}
              onValueChange={(val) => {
                onChangeHandler({
                  key: 'country',
                  value: val,
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="請選擇居住地" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(({ name, label }) => (
                  <SelectItem key={name} value={name}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(userState.country === '台灣' || userState.country === 'tw') && (
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Select
                  value={userState.city}
                  onValueChange={(val) => {
                    onChangeHandler({
                      key: 'city',
                      value: val,
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="縣市" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAIWAN_DISTRICT.map(({ name }) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={userState.district}
                  onValueChange={(val) => {
                    onChangeHandler({
                      key: 'district',
                      value: val,
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="鄉鎮市區" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAIWAN_DISTRICT.find(
                      ({ name }) => name === userState.city
                    )?.districts.map(({ name, zip }) => (
                      <SelectItem key={zip} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </StyledGroup>
        </div>

        <div
          className={`mt-4 w-full rounded-2xl bg-white p-10 max-md:p-8 md:p-10 ${
            errors.socialCode ? 'border border-red-500' : ''
          }`}
          ref={(element) => setRef('socialCode', element)}
        >
          <StyledGroup mt="0">
            <Text className="text-lg font-bold">
              聯絡方式 *
            </Text>
            <Text className="text-sm font-normal text-[#92989A]">
              聯絡資訊會呈現在你的公開頁面上，讓夥伴能聯繫你，至少填寫一個社交媒體帳號
            </Text>
          </StyledGroup>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Object.entries({
              instagram: 'Instagram',
              discord: 'Discord',
              line: 'Line',
              facebook: 'Facebook',
            }).map(([key, title]) => (
              <div key={key}>
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
              </div>
            ))}
          </div>
          <StyledGroup>
            <ErrorMessage errText={errors.socialCode} />
          </StyledGroup>
        </div>

        <div
          className={`mt-4 w-full rounded-2xl bg-white p-10 max-md:p-8 md:p-10 ${
            errors.wantToDoList || errors.tagList || errors.selfIntroduction
              ? 'border border-red-500'
              : ''
          }`}
        >
          <StyledGroup mt="0">
            <Text
              className="font-medium"
              ref={(element) => setRef('wantToDoList', element)}
            >
              想和夥伴一起 *
            </Text>
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
            <Text className="font-medium">
              可以和夥伴分享的事物
            </Text>
            <Input
              className="w-full"
              placeholder="你擅長什麼？可以分享什麼呢？"
              value={userState.share}
              onChange={(e) => {
                onChangeHandler({ key: 'share', value: e.target.value });
              }}
            />
          </StyledGroup>
          <StyledGroup>
            <Text className="mb-1.5 font-medium">標籤</Text>
            <TagEditor
              name="tagList"
              value={userState.tagList}
              tagOptions={tags}
              helperText="可以是學習領域、興趣等等的標籤，例如：音樂創作、程式語言、電繪、社會議題。"
              control={{
                setRef: (name, element) => setRef(name, element),
                onChange: ({ target }) => onChangeHandler({ key: target.name, value: target.value }),
              }}
            />
            <ErrorMessage errText={errors.tagList} />
          </StyledGroup>

          <StyledGroup>
            <Text className="mb-1.5 font-medium">
              個人簡介 *
            </Text>
            {isSetting && (
              <MarkdownEditor
                name="selfIntroduction"
                ref={(element) => setRef('selfIntroduction', element)}
                value={userState.selfIntroduction}
                rootClassName="w-full p-px bg-basic-200 rounded-md focus-within:bg-primary-base"
                className="rounded-md bg-white"
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
        </div>

        <div className="mt-4 w-full rounded-2xl bg-white p-10 max-md:p-8 md:p-10">
          <div className="flex items-center justify-between rounded-lg border border-[#dbdbdb] p-4">
            <Text className="text-base font-medium leading-[140%] text-[#293a3d]">公開顯示居住地</Text>
            <Switch
              checked={userState.isOpenLocation}
              onCheckedChange={(value) => {
                onChangeHandler({
                  key: 'isOpenLocation',
                  value,
                });
              }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-[#dbdbdb] p-4">
            <Text className="text-base font-medium leading-[140%] text-[#293a3d]">公開個人頁面尋找夥伴</Text>
            <Switch
              checked={userState.isOpenProfile}
              onCheckedChange={(value) => {
                onChangeHandler({
                  key: 'isOpenProfile',
                  value,
                });
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex w-full">
          <StyledButton
            variant="outline"
            onClick={() => {
              router.push('/personal-card/my-card');
            }}
          >
            查看我的頁面
          </StyledButton>
          <StyledButton onClick={onUpdateUser}>
            儲存資料
          </StyledButton>
        </div>
      </div>
    </div>
  );
}

export default EditPage;
