import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ZodType, z } from 'zod';
import { CATEGORIES } from '@/constants/category';
import { AREAS } from '@/constants/areas';
import { EDUCATION_STEP } from '@/constants/member';
import { BASE_URL } from '@/constants/common';
import openLoginWindow from '@/utils/openLoginWindow';
import { activityCategoryList } from '@/constants/activityCategory';

const _eduOptions = EDUCATION_STEP.filter(
  (edu) => !['master', 'doctor', 'other'].includes(edu.value),
);
_eduOptions.push({ key: 'noLimit', value: 'noLimit', label: '不設限' });

export const categoriesOptions = CATEGORIES;
export const areasOptions = AREAS.filter((area) => area.label !== '線上');
export const eduOptions = _eduOptions;

const DEFAULT_VALUES = {
  userId: '',
  title: '',
  file: null,
  originPhotoURL: '',
  photoURL: '',
  photoAlt: '',
  activityCategory: ['Other'],
  category: [],
  participator: '',
  area: [],
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
    z.enum(activityCategoryList.map(({ value }) => value)),
  ),
  category: z
    .array(z.enum(categoriesOptions.map(({ value }) => value)))
    .min(1, '請選擇學習領域'),
  participator: z
    .string()
    .regex(/^(100|[1-9]?\d)$/, '請輸入整數，需大於 0，不可超過 100'),
  area: z.array(z.string()).min(1, '請選擇地點'),
  time: z.string().max(50, '請勿輸入超過 50 字'),
  partnerStyle: z
    .string()
    .max(50, '請勿輸入超過 50 字')
    .min(1, '請輸入想找的夥伴類型'),
  partnerEducationStep: z
    .array(z.enum(eduOptions.map(({ label }) => label)))
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

export default function useGroupForm() {
  const [isDirty, setIsDirty] = useState(false);
  const me = useSelector((state) => state.user);
  const notLogin = !me?._id;
  const [values, setValues] = useState({
    ...DEFAULT_VALUES,
    userId: me?._id,
  });
  const [errors, setErrors] = useState({});
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

  const handleSubmit = (onValid) => async () => {
    if (!schema.safeParse(values).success) {
      let isFocus = false;
      const updatedErrors = Object.fromEntries(
        Object.entries(rules).map(([key, rule]) => {
          const errorMessage = rule.safeParse(values[key]).error?.issues?.[0]
            ?.message;

          if (errorMessage && !isFocus) {
            isFocus = true;
            refs.current[key]?.focus();
          }

          return [key, errorMessage];
        }),
      );
      setErrors(updatedErrors);
      return;
    }

    if (values.originPhotoURL === values.photoURL) {
      onValid(values);
      return;
    }

    if (values.originPhotoURL) {
      const pathArray = values.originPhotoURL.split('/');
      fetch(`${BASE_URL}/image/${pathArray[pathArray.length - 1]}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${me.token}`,
        },
      });
    }

    let photoURL = '';

    if (values.photoURL instanceof Blob) {
      const formData = new FormData();

      formData.append('file', values.photoURL);

      try {
        photoURL = await fetch(`${BASE_URL}/image`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${me.token}`,
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => data.url);
      } catch {
        photoURL = '';
      }
    }
    onValid({ ...values, photoURL });
  };

  useEffect(() => {
    let timer;
    if (notLogin) {
      timer = setTimeout(() => {
        openLoginWindow();
      }, 100);
    }
    return () => clearTimeout(timer);
  }, [notLogin]);

  return {
    notLogin,
    control,
    errors,
    values,
    isDirty,
    setValues,
    handleSubmit,
  };
}
