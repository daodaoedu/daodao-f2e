import { useReducer, useState } from 'react';
import dayjs from 'dayjs';
import { z } from 'zod';

const schema = z.object({
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
  roleList: z.array(z.string()).min(1, '請選擇您的身份').optional(),
  isSubscribeEmail: z.boolean().optional(),
  interestList: z.array(z.string()).optional(),
});

const initialState = {
  birthDay: dayjs(),
  gender: '',
  roleList: [],
  isSubscribeEmail: true,
  interestList: [],
};

const userReducer = (state, payload) => {
  const { key, value } = payload;
  return { ...state, [key]: value };
};

const useProfileValidation = () => {
  // check three fileds - birthday, gender, roleList
  const [errors, setErrors] = useState({});
  const [userState, stateDispatch] = useReducer(userReducer, initialState);

  /**
   *
   * @param {object} fields 欄位名稱
   * @param {boolean} validateAll 是否驗證全部
   * @returns
   */
  const validateFields = (fields, validateAll = false) => {
    const [key, val] = Object.entries(fields)[0];

    const validateResult = !validateAll
      ? schema
          .partial({ [key]: true })
          .safeParse({ [key]: key === 'birthDay' ? val?.$d : val })
      : schema.safeParse({
          ...fields,
          birthDay: fields.birthDay?.$d,
        });

    if (!validateResult.success) {
      validateResult.error.issues.forEach((issue) => {
        setErrors((err) => ({ ...err, [issue.path[0]]: issue.message }));
      });
    }

    if (!validateAll && validateResult.success) {
      const obj = { ...errors };
      delete obj[key];
      setErrors(obj);
    }
    return validateResult.success;
  };

  const onChangeHandler = ({ key, value }) => {
    stateDispatch({ key, value });
    validateFields({ [key]: value });
  };

  return {
    userState,
    onChangeHandler,
    validateFields,
    errors,
  };
};

export default useProfileValidation;
