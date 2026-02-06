import { differenceInYears } from "date-fns";
import { z } from "zod";
import { INTEREST_CATEGORIES } from "@/constants/interest-categories";
import { AVAILABLE_FIELDS } from "@/constants/professional-fields";
import { REFERRAL_SOURCE_OPTIONS } from "@/constants/referral-source";

// Re-export constants for convenience
export { AVAILABLE_FIELDS, INTEREST_CATEGORIES, REFERRAL_SOURCE_OPTIONS };

/**
 * CustomId 驗證規則
 * - 最少 3 個字符，最多 15 個字符
 * - 僅可使用英文字母 (a-z) 與數字
 */
const customIdRegex = /^[a-zA-Z0-9]+$/;

/**
 * Onboarding 表單 Schema
 *
 * Step 1: Profile - 個人資料
 * Step 2: Interests - 專業與興趣領域
 * Step 3: Referral - 如何得知島島阿學
 */
export const onboardingFormSchema = z.object({
  // Step 1: Profile
  email: z.string().email(),
  birthDate: z
    .date()
    .refine(
      (date) => {
        const age = differenceInYears(new Date(), date);
        return age >= 16;
      },
      { message: "島島阿學目前僅開放給年滿 16 歲的使用者註冊" }
    )
    .optional(),
  name: z.string().max(50, "名字最多 50 字").optional().or(z.literal("")),
  customId: z
    .string()
    .min(3, "帳號最少需要 3 個字符")
    .max(15, "帳號最多 15 個字符")
    .refine((val) => customIdRegex.test(val), "僅限使用英文字母和數字")
    .optional()
    .or(z.literal("")),
  personalSlogan: z.string().max(150, "個人標語最多 150 字").optional().or(z.literal("")),

  // Step 2: Interests
  professionalFields: z
    .array(z.string())
    .max(5, "最多只能選擇 5 個專業領域")
    .default([]),
  interests: z
    .array(z.string())
    .min(1, "請至少選擇 1 個興趣領域")
    .max(5, "最多只能選擇 5 個興趣領域"),

  // Step 3: Referral
  referralSource: z.string().min(1, "請選擇如何得知島島阿學"),
  otherReferralText: z.string().optional().or(z.literal("")),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

/**
 * 步驟驗證 Schema
 * 用於分步驟驗證，每個步驟只驗證對應的欄位
 */
export const profileStepSchema = onboardingFormSchema.pick({
  email: true,
  birthDate: true,
  name: true,
  customId: true,
  personalSlogan: true,
});

export const interestsStepSchema = onboardingFormSchema.pick({
  professionalFields: true,
  interests: true,
});

export const referralStepSchema = onboardingFormSchema.pick({
  referralSource: true,
  otherReferralText: true,
});
