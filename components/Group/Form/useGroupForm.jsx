import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { ZodType, z } from 'zod';
import { useSnackbar } from '@/contexts/Snackbar';
import { ACTIVITY_CATEGORIES, CATEGORIES, OTHER_OPTION } from '@/constants/category';
import { AREAS, ONLINE_OPTION, TBD_OPTION } from '@/constants/areas';
import { EDUCATION } from '@/constants/member';
import { BASE_URL } from '@/constants/common';
import useLeaveConfirm from '@/hooks/useLeaveConfirm';
import { useAuth } from '@/contexts/Auth';

export const categoriesOptions = CATEGORIES;
export const areasOptions = AREAS;
export const eduOptions = EDUCATION;

const INITIAL_VALUES = {
  userId: '',
  title: '',
  file: null,
  originPhotoURL: '',
  photoURL: '',
  photoAlt: '',
  activityCategory: [OTHER_OPTION.value],
  category: [],
  participator: '',
  area: [TBD_OPTION.value],
  time: '',
  partnerStyle: '',
  partnerEducationStep: [],
  motivation: '',
  content: '',
  outcome: '',
  notice: '',
  deadline: dayjs().add(7, 'day'),
  isNeedDeadline: false,
  tagList: [],
  isGrouping: true,
};

const rules = {
  userId: z.string().optional(),
  title: z.string().min(1, '請輸入標題').max(50, '請勿輸入超過 50 字'),
  file: z.any(),
  photoURL: z.string().or(z.instanceof(Blob)),
  photoAlt: z.string(),
  activityCategory: z.array(
    z.enum(ACTIVITY_CATEGORIES.map(({ value }) => value)),
  ),
  category: z
    .array(z.enum(categoriesOptions.map(({ value }) => value)))
    .min(1, '請選擇學習領域'),
  participator: z
    .string()
    .regex(/^(100|[1-9]\d|[1-9])$/, '請輸入整數，需大於 0，不可超過 100'),
  area: z
    .array(z.enum(AREAS.concat(ONLINE_OPTION, TBD_OPTION).map(({ value }) => value)))
    .min(1, '請選擇地點'),
  time: z.string().max(50, '請勿輸入超過 50 字'),
  partnerStyle: z
    .string()
    .max(50, '請勿輸入超過 50 字')
    .min(1, '請輸入想找的夥伴類型'),
  partnerEducationStep: z
    .array(z.enum(eduOptions.map(({ value }) => value)))
    .min(1, '請選擇適合的教育階段'),
  motivation: z.string().max(50, '請勿輸入超過 50 字').min(1, '請輸入揪團動機'),
  content: z
    .string()
    .min(1, '請輸入揪團內容與運作方式')
    .max(2000, '請勿輸入超過 2000 字'),
  outcome: z.string().max(50, '請勿輸入超過 50 字').min(1, '請輸入期待成果'),
  notice: z.string().min(1, '請輸入注意事項').max(2000, '請勿輸入超過 2000 字'),
  deadline: z.any(),
  isNeedDeadline: z.boolean(),
  tagList: z.array(z.string()),
  isGrouping: z.boolean(),
};

export default function useGroupForm(defaultValue) {
  const { user, token } = useAuth();
  const [isDirty, setIsDirty] = useState(false);
  const [values, setValues] = useState(() => ({
    ...INITIAL_VALUES,
    ...defaultValue,
    ...Object.fromEntries(
      Object.entries(rules).map(([key, rule]) => [
        key,
        rule.safeParse(defaultValue[key])?.data ?? INITIAL_VALUES[key],
      ])
    ),
    userId: user?._id,
  }));
  const [errors, setErrors] = useState({});
  const { pushSnackbar } = useSnackbar();
  const refs = useRef({});
  const schema = z.object(rules);

  const onChange = ({ target }) => {
    const { name, value } = target;
    const rule = rules[name];

    if (rule instanceof ZodType) {
      const result = rule.safeParse(value);

      setErrors((pre) => ({
        ...pre,
        [name]: result.error?.issues?.[0]?.message,
      }));
    }
    setIsDirty(true);
    setValues((pre) => ({ ...pre, [name]: value }));
  };

  const onBlur = onChange;
  const setRef = (name, element) => {
    refs.current[name] = element;
  };

  const control = {
    setRef,
    onChange,
    onBlur,
  };

  const removePhoto = (url) => {
    const pathArray = url.split('/');
    fetch(`${BASE_URL}/image/${pathArray[pathArray.length - 1]}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const uploadPhoto = async (oldPhoto, newPhoto) => {
    if (oldPhoto) {
      removePhoto(oldPhoto);
    }
    if (newPhoto instanceof Blob) {
      const formData = new FormData();

      formData.append('file', newPhoto);

      try {
        const response = await fetch(`${BASE_URL}/image`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const data = await response.json();

        return typeof data.url === 'string' ? data.url : '';
      } catch {
        return '';
      }
    } else {
      return '';
    }
  };

  const handleSubmit = (onValid) => async () => {
    const result = schema.safeParse(values);

    if (!result.success) {
      let isFocus = false;
      const updatedErrors = Object.fromEntries(
        Object.entries(rules).map(([key, rule]) => {
          const errorMessage = rule.safeParse(values[key]).error?.issues?.[0]
            ?.message;

          if (errorMessage && !isFocus && refs.current[key]) {
            isFocus = true;
            refs.current[key]?.focus();
          }

          return [key, errorMessage];
        }),
      );
      setErrors(updatedErrors);
      if (!isFocus) {
        pushSnackbar({
          message: Object.values(updatedErrors).filter(Boolean)[0],
          vertical: 'top',
          horizontal: 'center',
          type: 'error',
        });
      }
      return;
    }

    setIsDirty(false);

    if (values.originPhotoURL === values.photoURL) {
      onValid(result.data);
      return;
    }

    const photoURL = await uploadPhoto(values.originPhotoURL, values.photoURL);

    onValid({ ...result.data, photoURL });
  };

  useLeaveConfirm({ shouldConfirm: isDirty });

  return {
    control,
    errors,
    values,
    isDirty,
    handleSubmit,
  };
}
