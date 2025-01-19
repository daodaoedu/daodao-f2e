import dayjs from 'dayjs';
import { useReducer, useRef, useState } from 'react';
import { z } from 'zod';
import { useAuthDispatch } from '@/contexts/Auth';

const initialState = {
  name: '',
  photoURL: '',
  birthDay: dayjs(),
  gender: '',
  roleList: [],
  wantToDoList: [],
  instagram: '',
  facebook: '',
  discord: '',
  line: '',
  educationStage: '-1',
  location: '台灣',
  tagList: [],
  selfIntroduction: '',
  share: '',
  isOpenLocation: true,
  isOpenProfile: true,
  isLoadingSubmit: false,
  country: '',
  city: '',
  district: '',
};

const buildValidator = (maxLength, regex, maxMsg, regMsg) =>
  z.string().max(maxLength, maxMsg).regex(regex, regMsg).optional();

const schema = z.object({
  name: z
    .string()
    .min(1, { message: '請輸入名字' })
    .max(50, { message: '名字過長' })
    .optional(),
  gender: z
    .string()
    .refine((val) => val !== undefined && val !== '', {
      message: '請選擇您的性別',
    })
    .optional(),
  birthDay: z
    .any()
    .refine((date) => dayjs(date).isValid(), {
      message: '請選擇您的出生日期',
    })
    .refine((date) => dayjs().diff(date, 'year') >= 16, {
      message: '您的年齡未滿16歲，目前無法於平台註冊，請詳閱島島社群條款',
    })
    .optional(),
  instagram: buildValidator(
    30,
    /^($|[a-zA-Z0-9_.]{2,20})$/,
    '長度最多30個字元',
    '長度最少2個字元，支援英文、數字、底線、句號',
  ),
  facebook: buildValidator(
    64,
    /^($|[a-zA-Z0-9_.]{5,20})$/,
    '長度最多64個字元',
    '長度最少5個字元，支援英文、數字、底線、句號',
  ),
  discord: buildValidator(
    32,
    /^($|[a-zA-Z0-9_.]{2,20})$/,
    '長度最多32個字元',
    '長度最少2個字元，支援英文、數字、底線、句號',
  ),
  line: buildValidator(
    20,
    /^($|[a-zA-Z0-9_.]{3,20})$/,
    '長度最多20個字元',
    '長度最少6個字元，支援英文、數字、底線、句號',
  ),
  wantToDoList: z
    .array(z.string())
    .min(1, '為了讓其他島民更認識你，請至少選擇一項想進行的事項')
    .optional(),
  tagList: z
    .array(z.string())
    .min(1, '為了讓其他島民更認識你，請至少選擇一項標籤')
    .optional(),
  selfIntroduction: z
    .string()
    .min(1, '為了讓其他島民更認識你，請簡述您的個人經歷、想做的事項')
    .optional(),
  roleList: z.array(z.string()).min(1, '請選擇您的身份').optional(),
});

const userReducer = (state, payload) => {
  const { key, value, isMultiple = false } = payload;
  if (isMultiple) {
    return {
      ...state,
      [key]: state[key].includes(value)
        ? state[key].filter((role) => role !== value)
        : [...state[key], value],
    };
  } else if (state && state[key] !== undefined) {
    return {
      ...state,
      [key]: value,
    };
  }
  return state;
};

const useEditProfile = () => {
  const authDispatch = useAuthDispatch();
  const [userState, stateDispatch] = useReducer(userReducer, initialState);
  const [errors, setErrors] = useState({});
  const refs = useRef({});

  const validate = (state = {}, isPartial = false) => {
    const [key, val] = Object.entries(state)[0];

    const result = isPartial
      ? schema
          .partial({ [key]: true })
          .safeParse({ [key]: key === 'birthDay' ? val?.$d : val })
      : schema
          .refine(
            (data) =>
              !!data.instagram ||
              !!data.facebook ||
              !!data.discord ||
              !!data.line,
            {
              message: '至少填寫一個社交媒體帳號',
              path: ['socialCode'],
            },
          )
          .safeParse({
            ...state,
            birthDay: state.birthDay.$d,
          });

    let isFocus = false;

    if (!result.success) {
      const newErrors = Object.fromEntries(
        result.error.errors.map((err) => {
          if (!isPartial && !isFocus) {
            const element = refs.current[err.path[0]];
            isFocus = true;

            if (['INPUT', 'TEXTAREA'].includes(element.tagName)) {
              element?.focus?.();
            } else {
              element?.scrollIntoView?.({ block: 'center' });
            }
          }
          return [err.path[0], err.message];
        }),
      );
      setErrors(newErrors);
    }
    if (isPartial && result.success) {
      const obj = { ...errors };
      delete obj[key];
      setErrors(obj);
    }
    return result.success;
  };

  const onChangeHandler = ({ key, value, isMultiple }) => {
    stateDispatch({ key, value, isMultiple });
    // if isMultiple is true, value must be in array , if not, create a new array then check
    const checkVal = isMultiple && !Array.isArray(isMultiple) ? [value] : value;
    validate({ [key]: checkVal }, true);
  };

  const onSubmit = async ({ id, email }) => {
    if (!id || !email) return false;
    const {
      name,
      birthDay,
      gender,
      roleList,
      educationStage,
      wantToDoList,
      share,
      isOpenLocation,
      isOpenProfile,
      tagList,
      selfIntroduction,
      instagram,
      facebook,
      discord,
      line,
      country,
      city,
      district,
    } = userState;

    const payload = {
      id,
      email,
      name,
      birthDay: dayjs(birthDay).format('YYYY/MM/DD'),
      gender,
      roleList,
      contactList: {
        instagram,
        facebook,
        discord,
        line,
      },
      wantToDoList,
      educationStage,
      location:
        country === '國外' ? country : [country, city, district].join('@'),
      tagList,
      selfIntroduction,
      share,
      isOpenLocation,
      isOpenProfile,
    };

    try {
      await authDispatch.updateUser(payload);
      return true;
    } catch (error) {
      return false;
    }
  };

  const checkBeforeSubmit = async ({ id, email }) => {
    if (validate(userState)) {
      const result = await onSubmit({ id, email });
      return result;
    }
    return false;
  };

  const setRef = (name, element) => {
    refs.current[name] = element;
  };

  return {
    userState,
    onChangeHandler,
    validate,
    onSubmit: checkBeforeSubmit,
    setRef,
    errors,
  };
};

export default useEditProfile;
