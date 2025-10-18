import { z } from 'zod';
import { format } from 'date-fns';
import { UserValidatorsCreateUserSchemaProfessionalField } from '@/generated/models';

/**
 * Onboarding 表單驗證 schema
 * 定義用戶註冊時需要填寫的所有欄位驗證規則
 */
export const onboardingSchema = z.object({
  // 個人資料
  birthDay: z
    .date({ required_error: '請選擇生日' })
    .transform((date) => format(date, 'yyyy/MM/dd'))
    .or(z.string().min(1, '請選擇生日')),
  name: z.string().min(1, '請輸入您的名字'),
  customId: z
    .string()
    .min(3, '使用者帳號至少需要3個字元')
    .max(15, '使用者帳號最多15個字元')
    .regex(/^[a-z0-9]+$/, '只能使用小寫英文字母和數字'),
  personalSlogan: z.string().max(150, '個人標語最多150個字元').optional(),

  // 專業與興趣領域
  professionalField: z
    .array(z.nativeEnum(UserValidatorsCreateUserSchemaProfessionalField))
    .min(1, '請至少選擇一個專業領域')
    .max(5, '最多選擇5個專業領域'),
  interestList: z
    .array(z.string())
    .min(1, '請至少選擇一個興趣領域')
    .max(5, '最多選擇5個興趣領域'),

  // 推薦來源
  referralSource: z.string().min(1, '請選擇您如何得知島島阿學'),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
