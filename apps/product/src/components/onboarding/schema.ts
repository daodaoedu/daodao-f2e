import type { useTranslations } from "@daodao/i18n";
import { differenceInYears } from "date-fns";
import { z } from "zod";
import { INTEREST_CATEGORIES } from "@/constants/interest-categories";
import { AVAILABLE_FIELDS } from "@/constants/professional-fields";
import { REFERRAL_SOURCE_OPTIONS } from "@/constants/referral-source";

// Re-export constants for convenience
export { AVAILABLE_FIELDS, INTEREST_CATEGORIES, REFERRAL_SOURCE_OPTIONS };

const customIdRegex = /^[a-zA-Z0-9]+$/;

type TFunction = ReturnType<typeof useTranslations<"onboarding">>;

/**
 * 主表單 Schema（送出時驗證）
 *
 * interests / professionalFields / referralSource 允許為空，
 * 因為動態流程模式下這些欄位由 dynamicAnswers 透過 fieldKey 映射填入。
 * 每個步驟的強制填寫在 createOnboardingStepSchemas 裡驗證。
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

    // Step 2+: 固定流程欄位（動態流程時可為空，由 fieldKey 映射覆蓋）
    professionalFields: z.array(z.string()).max(5).default([]),
    interests: z.array(z.string()).max(5).default([]),
    referralSource: z.string().default(""),
    otherReferralText: z.string().optional().or(z.literal("")),

    // 動態流程步驟回答：key 為 stepId.toString()，value 為選取或輸入的答案陣列
    dynamicAnswers: z.record(z.string(), z.array(z.string())).default({}),
  });
};

export const onboardingFormSchema = createOnboardingFormSchema();

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

/**
 * 步驟驗證 Schema（用於固定流程逐步驗證，仍維持必填）
 */
export const createOnboardingStepSchemas = (t?: TFunction) => {
  const msg = (key: string, params?: Record<string, string | number>) => {
    if (t) return t(key as Parameters<TFunction>[0], params as never);
    return key;
  };

  const profileStepSchema = z.object({
    email: z.string().email(),
    birthDate: z
      .date({ required_error: msg("validation.birthDateRequired") })
      .refine((date) => differenceInYears(new Date(), date) >= 16, {
        message: msg("validation.birthDateAge"),
      }),
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
  });

  const interestsStepSchema = z.object({
    professionalFields: z
      .array(z.string())
      .min(1, msg("validation.professionalFieldsRequired", { min: 1 }))
      .max(5, msg("validation.professionalFieldsMax", { max: 5 })),
    interests: z
      .array(z.string())
      .min(1, msg("validation.interestsRequired", { min: 1 }))
      .max(5, msg("validation.interestsMax", { max: 5 })),
  });

  const referralStepSchema = z.object({
    referralSource: z.string().min(1, msg("validation.referralSourceRequired")),
    otherReferralText: z.string().optional().or(z.literal("")),
  });

  return { profileStepSchema, interestsStepSchema, referralStepSchema };
};

export const { profileStepSchema, interestsStepSchema, referralStepSchema } =
  createOnboardingStepSchemas();
