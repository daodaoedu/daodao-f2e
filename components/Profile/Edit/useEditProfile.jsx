import dayjs from 'dayjs';
import { useReducer, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateUser } from '@/redux/actions/user';
import { z } from 'zod';

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
  isOpenLocation: false,
  isOpenProfile: false,
  isLoadingSubmit: false,
  country: '',
  city: '',
  district: '',
};

const buildValidator = (maxLength, regex, maxMsg, regMsg) =>
  z.string().max(maxLength, maxMsg).regex(regex, regMsg).optional();

const tempSchema = Object.keys(initialState).reduce((acc, key) => {
  return key !== 'birthDay'
    ? {
        ...acc,
        [key]: z.string().optional(),
      }
    : acc;
}, {});

const schema = z.object({
  ...tempSchema,
  name: z
    .string()
    .min(1, { message: '請輸入名字' })
    .max(50, { message: '名字過長' })
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
  isOpenLocation: z.boolean().optional(),
  isOpenProfile: z.boolean().optional(),
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
    /^($|[a-zA-Z0-9_.]{6,20})$/,
    '長度最多20個字元',
    '長度最少6個字元，支援英文、數字、底線、句號',
  ),
  isLoadingSubmit: z.boolean().optional(),
  tagList: z.array(z.string()).optional(),
  wantToDoList: z.array(z.string()).optional(),
  roleList: z.array(z.string()).optional(),
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
  const reduxDispatch = useDispatch();
  const [userState, stateDispatch] = useReducer(userReducer, initialState);
  const [errors, setErrors] = useState({});

  const validate = (state = {}, isPartial = false) => {
    const [key, val] = Object.entries(state)[0];
    const result = isPartial
      ? schema
          .partial({ [key]: true })
          .safeParse({ [key]: key === 'birthDay' ? val?.$d : val })
      : schema.safeParse({
          ...state,
          birthDay: state.birthDay.$d,
        });
    if (!result.success) {
      result.error.errors.forEach((err) => {
        setErrors({ [err.path[0]]: err.message });
      });
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
    validate({ [key]: value }, true);
  };

  const onSubmit = async ({ id, email }) => {
    if (!id || !email) return;
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

    reduxDispatch(updateUser(payload));
  };

  const checkBeforeSubmit = ({ id, email }) => {
    if (validate(userState)) {
      onSubmit({ id, email });
      return true;
    }
    return false;
  };

  return {
    userState,
    onChangeHandler,
    onSubmit: checkBeforeSubmit,
    errors,
  };
};

export default useEditProfile;
