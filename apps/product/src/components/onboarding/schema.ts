import { differenceInYears } from "date-fns";
import { z } from "zod";
import type { useTranslations } from "@daodao/i18n";
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

type TFunction = ReturnType<typeof useTranslations<"onboarding">>;

/**
 * Onboarding 表單 Schema
 *
 * Step 1: Profile - 個人資料
 * Step 2: Interests - 專業與興趣領域
 * Step 3: Referral - 如何得知島島阿學
 */
export const createOnboardingFormSchema = (t?: TFunction) => {
  const msg = (key: string, params?: Record<string, string | number>) => {
    if (t) return t(key as Parameters<TFunction>[0], params as never);
    return key;
  };

  return z.object({
    // Step 1: Profile
    email: z.string().email(),
    birthDate: z.date({ required_error: msg("validation.birthDateRequired") }).refine(
      (date) => {
        const age = differenceInYears(new Date(), date);
        return age >= 16;
      },
      { message: msg("validation.birthDateAge") }
    ),
    name: z
      .string()
      .min(1, msg("validation.nameRequired"))
      .max(50, msg("validation.nameMax", { max: 50 })),
    customId: z
      .string()
      .trim()
      .min(1, msg("validation.customIdRequired"))
      .min(3, msg("validation.customIdMin", { min: 3 }))
      .max(15, msg("validation.customIdMax", { max: 15 }))
      .refine((val) => customIdRegex.test(val), msg("validation.customIdFormat")),
    personalSlogan: z
      .string()
      .min(1, msg("validation.personalSloganRequired"))
      .max(150, msg("validation.personalSloganMax", { max: 150 })),

    // Step 2: Interests
    professionalFields: z
      .array(z.string())
      .min(1, msg("validation.professionalFieldsRequired", { min: 1 }))
      .max(5, msg("validation.professionalFieldsMax", { max: 5 })),
    interests: z
      .array(z.string())
      .min(1, msg("validation.interestsRequired", { min: 1 }))
      .max(5, msg("validation.interestsMax", { max: 5 })),

    // Step 3: Referral
    referralSource: z.string().min(1, msg("validation.referralSourceRequired")),
    otherReferralText: z.string().optional().or(z.literal("")),
  });
};

export const onboardingFormSchema = createOnboardingFormSchema();

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

/**
 * 步驟驗證 Schema
 * 用於分步驟驗證，每個步驟只驗證對應的欄位
 */
export const createOnboardingStepSchemas = (t?: TFunction) => {
  const schema = createOnboardingFormSchema(t);
  return {
    profileStepSchema: schema.pick({
      email: true,
      birthDate: true,
      name: true,
      customId: true,
      personalSlogan: true,
    }),
    interestsStepSchema: schema.pick({
      professionalFields: true,
      interests: true,
    }),
    referralStepSchema: schema.pick({
      referralSource: true,
      otherReferralText: true,
    }),
  };
};

export const { profileStepSchema, interestsStepSchema, referralStepSchema } =
  createOnboardingStepSchemas();
