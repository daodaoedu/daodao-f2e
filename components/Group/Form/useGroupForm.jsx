import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ZodType, z } from 'zod';
import { CATEGORIES } from '@/constants/category';
import { AREAS } from '@/constants/areas';
import { EDUCATION_STEP } from '@/constants/member';
import { BASE_URL } from '@/constants/common';
import openLoginWindow from '@/utils/openLoginWindow';

const _eduOptions = EDUCATION_STEP.filter(
  (edu) => !['master', 'doctor', 'other'].includes(edu.value),
);
_eduOptions.push({ key: 'noLimit', value: 'noLimit', label: '終生學習' });

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
  category: [],
  area: [],
  time: '',
  partnerStyle: '',
  partnerEducationStep: [],
  description: '',
  tagList: [],
  isGrouping: true,
};

const rules = {
  userId: z.string().optional(),
  title: z.string().min(1, '請輸入標題').max(50, '請勿輸入超過 50 字'),
  file: z.any(),
  photoURL: z.string().or(z.instanceof(Blob)),
  photoAlt: z.string(),
  category: z
    .array(z.enum(categoriesOptions.map(({ value }) => value)))
    .min(1, '請選擇學習領域'),
  area: z.array(z.string()).min(1, '請選擇地點'),
  time: z.string().max(50, '請勿輸入超過 50 字'),
  partnerStyle: z.string().max(50, '請勿輸入超過 50 字'),
  partnerEducationStep: z
    .array(z.enum(eduOptions.map(({ label }) => label)))
    .min(1, '請選擇適合的學習階段'),
  description: z
    .string()
    .min(1, '請輸入揪團描述')
    .max(2000, '請勿輸入超過 2000 字'),
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

  const control = {
    onChange,
    onBlur,
  };

  const handleSubmit = (onValid) => async () => {
    if (!schema.safeParse(values).success) {
      const updatedErrors = Object.fromEntries(
        Object.entries(rules).map(([key, rule]) => [
          key,
          rule.safeParse(values[key]).error?.issues?.[0]?.message,
        ]),
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
    if (notLogin) openLoginWindow('/login');
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
